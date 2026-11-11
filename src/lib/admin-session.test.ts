import crypto from 'crypto';
import { beforeAll, describe, expect, it } from 'vitest';

const SECRET = 'test-secret-with-at-least-24-characters';

let lib: typeof import('@/lib/admin-session');

beforeAll(async () => {
  process.env.NEXTAUTH_SECRET = SECRET;
  lib = await import('@/lib/admin-session');
});

describe('admin session token', () => {
  it('accepts a freshly signed token', () => {
    const token = lib.createAdminSessionToken('admin_1');
    expect(lib.verifyAdminSessionToken(token)).toBe('admin_1');
  });

  it('cannot be forged from a bare base64 admin id (the old format)', () => {
    const legacy = Buffer.from(`admin_1:${Date.now()}`).toString('base64');
    expect(lib.verifyAdminSessionToken(legacy)).toBeNull();
  });

  it('rejects a swapped payload', () => {
    const signature = lib.createAdminSessionToken('admin_1').split('.')[1];
    const payload = Buffer.from(
      JSON.stringify({ sub: 'admin_999', exp: Date.now() + 60_000 })
    ).toString('base64url');

    expect(lib.verifyAdminSessionToken(`${payload}.${signature}`)).toBeNull();
  });

  it('rejects an expired token', () => {
    const payload = Buffer.from(
      JSON.stringify({ sub: 'admin_1', exp: Date.now() - 1_000 })
    ).toString('base64url');
    const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');

    expect(lib.verifyAdminSessionToken(`${payload}.${signature}`)).toBeNull();
  });
});
