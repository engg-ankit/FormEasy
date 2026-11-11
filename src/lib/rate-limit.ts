import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Fixed-window rate limiting backed by the database.
 *
 * The app runs on serverless functions (Vercel), where an in-memory Map is
 * per-instance and therefore useless for limiting — the Postgres row is shared
 * by every instance. One row per key, reset when its window expires.
 */

export interface RateLimitStore {
  updateMany(args: {
    where: { key: string; windowEnd?: { lt?: Date; gte?: Date }; count?: { lt: number } };
    data: { count: number | { increment: number }; windowEnd?: Date };
  }): Promise<{ count: number }>;
  findUnique(args: {
    where: { key: string };
  }): Promise<{ count: number; windowEnd: Date } | null>;
  upsert(args: {
    where: { key: string };
    create: { key: string; count: number; windowEnd: Date };
    update: Record<string, never>;
  }): Promise<unknown>;
  deleteMany(args: { where: { windowEnd: { lt: Date } } }): Promise<{ count: number }>;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Requests still allowed in the current window (0 when blocked). */
  remaining: number;
  /** Seconds until the window resets — 0 when allowed. */
  retryAfter: number;
}

const CLEANUP_INTERVAL_PROBABILITY = 0.02; // roughly 1 in 50 calls

function defaultStore(): RateLimitStore {
  return prisma.rateLimit as unknown as RateLimitStore;
}

/**
 * Count one hit against `key` and report whether it is still within `limit`.
 * Keys are scoped by the caller, e.g. `forgot:email:a@b.com`.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  store: RateLimitStore = defaultStore()
): Promise<RateLimitResult> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowMs);

  // Expired window: clear the counter (the increment below counts this request).
  await store.updateMany({
    where: { key, windowEnd: { lt: now } },
    data: { count: 0, windowEnd },
  });

  // Increment only while under the limit (atomic; safe across instances).
  const incremented = await store.updateMany({
    where: { key, windowEnd: { gte: now }, count: { lt: limit } },
    data: { count: { increment: 1 } },
  });

  if (incremented.count === 0) {
    const existing = await store.findUnique({ where: { key } });

    if (!existing) {
      // First hit for this key.
      await store.upsert({ where: { key }, create: { key, count: 1, windowEnd }, update: {} });
      return { allowed: true, remaining: limit - 1, retryAfter: 0 };
    }

    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((existing.windowEnd.getTime() - now.getTime()) / 1000)),
    };
  }

  const record = await store.findUnique({ where: { key } });

  // Drop rows whose window ended over a day ago, occasionally, to keep the table small.
  if (Math.random() < CLEANUP_INTERVAL_PROBABILITY) {
    await store
      .deleteMany({ where: { windowEnd: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } } })
      .catch(() => undefined);
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - (record?.count ?? 1)),
    retryAfter: 0,
  };
}

export interface RateLimitRule {
  /** Scoped key, e.g. `login:email:a@b.com`. */
  key: string;
  limit: number;
  windowMs: number;
}

/**
 * Check a list of rules in order; the first exhausted one blocks the request.
 * Fails open (with a loud log) when the counter store itself errors, so a
 * missing table or DB hiccup cannot lock everyone out of the app.
 */
export async function enforceRateLimits(
  rules: RateLimitRule[],
  store?: RateLimitStore
): Promise<RateLimitResult> {
  for (const rule of rules) {
    try {
      const result = await consumeRateLimit(rule.key, rule.limit, rule.windowMs, store);
      if (!result.allowed) return result;
    } catch (error) {
      console.error('Rate limit check failed (allowing request):', error);
    }
  }

  return { allowed: true, remaining: 0, retryAfter: 0 };
}

/** Clear a counter, e.g. after a successful login. */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    await prisma.rateLimit.deleteMany({ where: { key } });
  } catch (error) {
    console.error('Rate limit reset failed:', error);
  }
}

export function rateLimitedResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    {
      error: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
    },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
