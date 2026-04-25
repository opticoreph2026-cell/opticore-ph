import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        const { email, name, id: googleId, image: avatar } = user;
        
        try {
          let client = await db.client.findFirst({
            where: {
              OR: [
                { email: email.toLowerCase() },
                { googleId: googleId }
              ]
            }
          });

          if (!client) {
            client = await db.client.create({
              data: {
                email: email.toLowerCase(),
                name: name,
                googleId: googleId,
                avatar: avatar,
                // Since the DB might still have a NOT NULL constraint on passwordHash,
                // we provide a random placeholder for social signups.
                passwordHash: `GOOGLE_OAUTH_USER_${Math.random().toString(36).substring(2, 12)}`,
                onboardingComplete: false,
                consentGiven: true,
                role: 'client',
                applianceCount: 0
              }
            });
          } else {
            // Update Google info and avatar if it changed
            await db.client.update({
              where: { id: client.id },
              data: { 
                googleId: googleId,
                avatar: avatar || client.avatar 
              }
            });
          }
          
          return true; // Allow sign in
        } catch (error) {
          console.error('[NextAuth] Error during sign-in callback:', error);
          return false;
        }
      }
      return true;
    },
    
    async redirect({ url, baseUrl }) {
      // If the URL is absolute and on the same origin, allow it
      if (url.startsWith(baseUrl)) return url;
      // If the URL is relative, allow it
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Default to our internal bridge for social-to-custom-jwt conversion
      return `${baseUrl}/api/auth/bridge`;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
