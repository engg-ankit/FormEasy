import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthSecret, getAdminSecret } from '@/lib/auth-secret';

const SECRET = 'test-secret-with-at-least-24-characters';

describe('auth secret resolution', () => {
  beforeEach(() => {
    vi.stubEnv('NEXTAUTH_SECRET', '');
    vi.stubEnv('ADMIN_SESSION_SECRET', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws in production when the secret is missing', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => getAuthSecret()).toThrow(/NEXTAUTH_SECRET/);
  });

  it('rejects a short secret in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXTAUTH_SECRET', 'short');
    expect(() => getAuthSecret()).toThrow(/NEXTAUTH_SECRET/);
  });

  it('accepts a long enough secret', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXTAUTH_SECRET', SECRET);
    expect(getAuthSecret()).toBe(SECRET);
  });

  it('uses a separate admin secret when provided', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXTAUTH_SECRET', SECRET);
    vi.stubEnv('ADMIN_SESSION_SECRET', 'admin-secret-with-24-plus-chars!!');
    expect(getAdminSecret()).toBe('admin-secret-with-24-plus-chars!!');
  });
});
