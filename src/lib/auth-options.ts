import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyMobileToken } from '@/lib/mobile-auth';

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
          };
        }

        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials');
          return null;
        }

        try {
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

          console.log('[Auth] Login successful:', credentials.email);
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
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
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production',
};