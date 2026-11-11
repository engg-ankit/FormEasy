import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyMobileToken, isSessionCurrent } from '@/lib/mobile-auth';
import { enforceRateLimits, resetRateLimit } from '@/lib/rate-limit';
import { getAuthSecret } from '@/lib/auth-secret';

// 5 failed web logins per account per 15 minutes.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_EMAIL_LIMIT = 5;

/** Thrown/returned secret is resolved per call so a missing env fails closed. */
function authSecret(): string {
  return getAuthSecret();
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otpToken: { label: 'OTP Token', type: 'text' },
      },
      async authorize(credentials) {
        // OTP login: the frontend calls /api/mobile/otp-login (which verifies the
        // email OTP) and passes the signed JWT it receives back to NextAuth here.
        if (credentials?.otpToken) {
          const payload = await verifyMobileToken(credentials.otpToken);
          if (!payload) {
            console.log('[Auth] Invalid otpToken');
            return null;
          }
          if (!(await isSessionCurrent(payload))) {
            console.log('[Auth] otpToken was revoked');
            return null;
          }
          const otpUser = await prisma.user.findUnique({ where: { id: payload.uid } });
          if (!otpUser) {
            console.log('[Auth] otpToken user not found:', payload.uid);
            return null;
          }
          console.log('[Auth] OTP login successful:', otpUser.email);
          return {
            id: otpUser.id,
            email: otpUser.email,
            name: otpUser.fullName,
            sessionVersion: otpUser.sessionVersion,
          };
        }

        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials');
          return null;
        }

        try {
          const emailKey = `login:email:${credentials.email.toLowerCase()}`;

          const gate = await enforceRateLimits([
            { key: emailKey, limit: LOGIN_EMAIL_LIMIT, windowMs: LOGIN_WINDOW_MS },
          ]);
          if (!gate.allowed) {
            console.log('[Auth] Login rate limited:', credentials.email);
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log('[Auth] User not found:', credentials.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            console.log('[Auth] Invalid password for:', credentials.email);
            return null;
          }

          await resetRateLimit(emailKey);
          console.log('[Auth] Login successful:', credentials.email);
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            sessionVersion: user.sessionVersion,
          };
        } catch (error) {
          console.error('[Auth] Authorize error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days — a stolen cookie cannot live for a month
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sv = user.sessionVersion ?? 0;
        return token;
      }

      // On every session read, drop the session if the password was reset.
      if (token.id && typeof token.id === 'string') {
        try {
          const current = await prisma.user.findUnique({
            where: { id: token.id },
            select: { sessionVersion: true },
          });
          if (!current || current.sessionVersion !== (token.sv ?? 0)) {
            delete token.id;
            return token;
          }
        } catch {
          // Database hiccup: keep the session rather than logging everyone out.
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: authSecret(),
};
