import { describe, expect, it, vi } from 'vitest';

// The limiter imports the Prisma client; tests inject their own store instead.
vi.mock('@/lib/prisma', () => ({ prisma: {} }));

import { consumeRateLimit, enforceRateLimits, getClientIp, ipRule, type RateLimitStore } from '@/lib/rate-limit';

function makeStore() {
  const rows = new Map<string, { count: number; windowEnd: Date }>();

  const store: RateLimitStore = {
    async updateMany({ where, data }) {
      const row = rows.get(where.key);
      if (!row) return { count: 0 };

      const windowExpired = where.windowEnd?.lt ? row.windowEnd < where.windowEnd.lt : false;
      const windowActive = where.windowEnd?.gte ? row.windowEnd >= where.windowEnd.gte : false;
      const underLimit = where.count?.lt !== undefined ? row.count < where.count.lt : true;

      if (!windowExpired && !(windowActive && underLimit)) return { count: 0 };

      row.count = typeof data.count === 'number' ? data.count : row.count + data.count.increment;
      if (data.windowEnd) row.windowEnd = data.windowEnd;
      return { count: 1 };
    },
    async findUnique({ where }) {
      const row = rows.get(where.key);
      return row ? { count: row.count, windowEnd: row.windowEnd } : null;
    },
    async upsert({ where, create }) {
      if (!rows.has(where.key)) {
        rows.set(where.key, { count: create.count, windowEnd: create.windowEnd });
      }
      return {};
    },
    async deleteMany() {
      return { count: 0 };
    },
  };

  return { store, rows };
}

const WINDOW = 15 * 60 * 1000;

describe('consumeRateLimit', () => {
  it('allows exactly the limit, then blocks', async () => {
    const { store } = makeStore();
    const results = [];

    for (let i = 0; i < 4; i++) {
      results.push(await consumeRateLimit('login:email:a@b.com', 3, WINDOW, store));
    }

    expect(results.slice(0, 3).every((r) => r.allowed)).toBe(true);
    expect(results.slice(0, 3).map((r) => r.remaining)).toEqual([2, 1, 0]);
    expect(results[3].allowed).toBe(false);
    expect(results[3].retryAfter).toBeGreaterThan(0);
  });

  it('keeps separate buckets per key', async () => {
    const { store } = makeStore();
    await consumeRateLimit('login:email:a@b.com', 1, WINDOW, store);
    const other = await consumeRateLimit('login:email:c@d.com', 1, WINDOW, store);

    expect(other.allowed).toBe(true);
  });

  it('starts fresh after the window expires', async () => {
    const { store, rows } = makeStore();
    for (let i = 0; i < 3; i++) await consumeRateLimit('forgot:email:x@y.com', 3, WINDOW, store);

    rows.get('forgot:email:x@y.com')!.windowEnd = new Date(Date.now() - 1_000);
    const after = await consumeRateLimit('forgot:email:x@y.com', 3, WINDOW, store);

    expect(after.allowed).toBe(true);
    expect(after.remaining).toBe(2);
  });
});

describe('enforceRateLimits', () => {
  it('blocks when any rule is exhausted', async () => {
    const { store } = makeStore();
    const rules = [
      { key: 'ip:1.1.1.1', limit: 1, windowMs: WINDOW },
      { key: 'email:a@b.com', limit: 99, windowMs: WINDOW },
    ];

    expect((await enforceRateLimits(rules, store)).allowed).toBe(true);
    expect((await enforceRateLimits(rules, store)).allowed).toBe(false);
  });

  it('fails open when the store is broken', async () => {
    const broken = new Proxy({} as RateLimitStore, {
      get: () => async () => {
        throw new Error('relation "RateLimit" does not exist');
      },
    });

    const result = await enforceRateLimits([{ key: 'k', limit: 1, windowMs: WINDOW }], broken);
    expect(result.allowed).toBe(true);
  });
});

describe('client ip rules', () => {
  it('reads the first forwarded address', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 10.0.0.1' },
    });

    expect(getClientIp(request)).toBe('1.2.3.4');
    expect(ipRule(request, 'login', 5, WINDOW)?.key).toBe('login:ip:1.2.3.4');
  });

  it('skips the rule when no proxy reports an address', () => {
    const request = new Request('http://localhost');

    expect(getClientIp(request)).toBeNull();
    expect(ipRule(request, 'login', 5, WINDOW)).toBeNull();
  });
});
