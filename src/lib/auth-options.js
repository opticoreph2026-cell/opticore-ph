import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';
import { createAdminNotification } from '@/lib/db';


export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET || '',
    }),
  ],

  callbacks: {
    /**
     * Fires after Google authenticates the user.
     * We upsert the user in our own database here.
     */
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const { email, name, id: googleId, image: avatar } = user;

        if (!email) return false;

        try {
          const existing = await db.client.findFirst({
            where: {
              OR: [
                { email: email.toLowerCase() },
                { googleId: googleId ?? undefined },
              ],
            },
          });

          if (!existing) {
            // New user — create account automatically
            await db.client.create({
              data: {
                email:              email.toLowerCase(),
                name:               name || email.split('@')[0],
                googleId:           googleId || null,
                avatar:             avatar || null,
                passwordHash:       `GOOGLE_OAUTH_USER_${Math.random().toString(36).substring(2, 12)}`,
                onboardingComplete: false,
                consentGiven:       true,
                role:               'client',
                applianceCount:     0,
              },
            });

            // Notify admin (non-blocking)
            createAdminNotification({
              type:    'new_user',
              title:   'New user via Google',
              message: `${name || email} signed up using Google OAuth`,
              meta:    { email: email.toLowerCase(), name: name || email, plan: 'starter' },
            }).catch(() => {});

          } else {
            // Existing user — sync Google ID and avatar if changed
            await db.client.update({
              where: { id: existing.id },
              data: {
                googleId: googleId || existing.googleId,
                avatar:   avatar   || existing.avatar,
              },
            });
          }

          return true; // Allow sign-in
        } catch (error) {
          console.error('[NextAuth] signIn callback error:', error);
          return false;
        }
      }
      return true;
    },

    /**
     * Always route Google sign-in through our internal bridge.
     * The bridge converts the NextAuth session into OptiCore JWT cookies.
     */
    async redirect({ url, baseUrl }) {
      // If callbackUrl is explicitly /api/auth/bridge, honour it
      if (url.includes('/api/auth/bridge')) {
        return `${baseUrl}/api/auth/bridge`;
      }
      // Same-origin relative URLs — allow them
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Same-origin absolute URLs — allow them
      if (url.startsWith(baseUrl)) return url;
      // Default: always go to bridge for any Google auth
      return `${baseUrl}/api/auth/bridge`;
    },
  },

  pages: {
    signIn:  '/login',
    error:   '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
