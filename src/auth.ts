import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Resend from 'next-auth/providers/resend';
import { authConfig } from '@/auth.config';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const client = await db.client.findUnique({ where: { email } });
        if (!client?.passwordHash || client.suspended) return null;

        const { valid } = await verifyPassword(password, client.passwordHash);
        if (!valid) return null;

        const profile = await db.energyProfile.findUnique({
          where: { clientId: client.id },
        });

        await db.client
          .update({
            where: { id: client.id },
            data: { lastLoginAt: new Date(), lastSignedInAt: new Date() },
          })
          .catch(() => {});

        return {
          id: client.id,
          email: client.email,
          name: client.name ?? undefined,
          role: client.role,
          organizationId: profile?.organizationId ?? undefined,
        };
      },
    }),
    ...(process.env.RESEND_API_KEY
      ? [
          Resend({
            from: process.env.EMAIL_FROM ?? 'OptiCore <noreply@opticore.ph>',
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === 'resend' && user.email) {
        const client = await db.client.findUnique({ where: { email: user.email } });
        if (!client || client.suspended) return false;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.organizationId = (user as { organizationId?: string }).organizationId;
      }

      if (account?.provider === 'resend' && user?.email) {
        const client = await db.client.findUnique({ where: { email: user.email } });
        if (client) {
          const profile = await db.energyProfile.findUnique({
            where: { clientId: client.id },
          });
          token.sub = client.id;
          token.role = client.role;
          token.organizationId = profile?.organizationId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as string) ?? 'client';
        session.user.organizationId = token.organizationId as string | undefined;
      }
      return session;
    },
  },
});
