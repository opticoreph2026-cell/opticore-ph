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
        try {
          const creds = credentials as Record<string, string> | undefined;
          const email = creds?.email;
          const password = creds?.password;
          const authType = creds?.type;
          if (!email || !password) {
            console.log('[auth:authorize] missing email or password');
            return null;
          }

          // ── Turnstile verification for OTP ────────────────────────
          if (authType === 'otp' && process.env.TURNSTILE_SECRET_KEY) {
            const turnstileToken = creds?.turnstileToken;
            if (!turnstileToken) {
              console.log('[auth:authorize] OTP missing turnstile token');
              return null;
            }
            const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`,
            });
            const outcome = await verifyRes.json();
            if (!outcome.success) {
              console.log('[auth:authorize] OTP turnstile verification failed');
              return null;
            }
          }

          // ── OTP login ──────────────────────────────────────────────
          if (authType === 'otp') {
            const client = await db.client.findUnique({ where: { email } });
            if (!client || client.suspended) {
              console.log('[auth:authorize] OTP user not found or suspended', email);
              return null;
            }
            if (!client.otpCode || !client.otpExpiresAt) {
              console.log('[auth:authorize] no OTP requested', email);
              return null;
            }
            if (client.otpCode !== password) {
              console.log('[auth:authorize] OTP mismatch', email);
              return null;
            }
            if (new Date() > client.otpExpiresAt) {
              console.log('[auth:authorize] OTP expired', email);
              return null;
            }

            await db.client.update({
              where: { id: client.id },
              data: { otpCode: null, otpExpiresAt: null, lastLoginAt: new Date(), lastSignedInAt: new Date() },
            });

            const profile = await db.energyProfile.findUnique({
              where: { clientId: client.id },
            });

            return {
              id: client.id,
              email: client.email,
              name: client.name ?? undefined,
              role: client.role,
              organizationId: profile?.organizationId ?? undefined,
            };
          }

          // ── Turnstile verification (skip for OTP and post-signup auto-login) ──
          if (!creds?.skipTurnstile) {
            const turnstileToken = creds?.turnstileToken;
            if (!turnstileToken) {
              console.log('[auth:authorize] missing turnstile token');
              return null;
            }
            if (process.env.TURNSTILE_SECRET_KEY) {
              const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`,
              });
              const outcome = await verifyRes.json();
              if (!outcome.success) {
                console.log('[auth:authorize] turnstile verification failed');
                return null;
              }
            }
          }

          // ── Password login ─────────────────────────────────────────
          const client = await db.client.findUnique({ where: { email } });
          if (!client) {
            console.log('[auth:authorize] user not found', email);
            return null;
          }
          if (!client.passwordHash) {
            console.log('[auth:authorize] no password hash', email);
            return null;
          }
          if (client.suspended) {
            console.log('[auth:authorize] user suspended', email);
            return null;
          }

          const { valid } = await verifyPassword(password, client.passwordHash);
          if (!valid) {
            console.log('[auth:authorize] invalid password', email);
            return null;
          }

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
        } catch (err) {
          console.error('[auth:authorize] error:', err);
          return null;
        }
      },
    }),
    ...(process.env.RESEND_API_KEY
      ? [
          Resend({
            from: process.env.EMAIL_FROM ?? 'OptiCore PH <opticoreph2026@gmail.com>',
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
      const now = Date.now();
      const FIFTEEN_MIN = 15 * 60 * 1000;
      const WRITE_THROTTLE = 60 * 1000;

      if (user) {
        token.lastActivityAt = now;
        token.role = (user as { role?: string }).role;
        token.organizationId = (user as { organizationId?: string }).organizationId;
      } else {
        const lastActivity = token.lastActivityAt as number | undefined;
        if (lastActivity && now - lastActivity > FIFTEEN_MIN) {
          return {};
        }
        if (!lastActivity || now - lastActivity > WRITE_THROTTLE) {
          token.lastActivityAt = now;
        }
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
