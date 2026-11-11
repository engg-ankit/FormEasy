import crypto from 'crypto';
import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/mailer', () => ({
  sendMail: vi.fn(async () => ({ success: true })),
  escapeHtml: (value: string) => value,
}));

const SECRET = 'test-secret-with-at-least-24-characters';
const HASH = '$2a$10$abcdefghijklmnopqrstuv';

let lib: typeof import('@/lib/password-reset');

beforeAll(async () => {
  process.env.NEXTAUTH_SECRET = SECRET;
  lib = await import('@/lib/password-reset');
});

describe('password reset tokens', () => {
  it('round-trips a valid token', () => {
    const token = lib.createResetToken('user_1', HASH);
    const claims = lib.verifyResetToken(token);

    expect(claims?.userId).toBe('user_1');
    expect(lib.matchesPasswordVersion(claims!.passwordVersion, HASH)).toBe(true);
  });

  it('rejects a tampered payload', () => {
    const token = lib.createResetToken('user_1', HASH);
    const signature = token.split('.')[1];

    const forged = Buffer.from(
      JSON.stringify({ sub: 'user_2', exp: Date.now() + 60_000, pv: 'x' })
    ).toString('base64url');

    expect(lib.verifyResetToken(`${forged}.${signature}`)).toBeNull();
  });

  it('rejects garbage and empty tokens', () => {
    expect(lib.verifyResetToken('')).toBeNull();
    expect(lib.verifyResetToken('not-a-token')).toBeNull();
  });

  it('rejects an expired but correctly signed token', () => {
    const payload = Buffer.from(
      JSON.stringify({ sub: 'user_1', exp: Date.now() - 1_000, pv: 'abc' })
    ).toString('base64url');
    const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');

    expect(lib.verifyResetToken(`${payload}.${signature}`)).toBeNull();
  });

  it('stops working once the password changes', () => {
    const claims = lib.verifyResetToken(lib.createResetToken('user_1', HASH))!;
    expect(lib.matchesPasswordVersion(claims.passwordVersion, '$2a$10$totallydifferent')).toBe(false);
  });
});
