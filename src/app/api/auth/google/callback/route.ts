import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, fetchGoogleProfile } from '@/lib/oauth/google';
import { db } from '@/lib/db';
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';
import { sendAccountLinkedEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

export const runtime = 'nodejs';

const ERROR_REDIRECT = (code: string) => 
  NextResponse.redirect(new URL(`/login?error=${code}`, process.env.NEXT_PUBLIC_APP_URL!));

export async function GET(req: NextRequest) {
  // Rate limit
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`oauth_callback_${ip}`, 10);
  if (!rateLimit.success) {
    return ERROR_REDIRECT('OAUTH_INTERNAL_ERROR');
  }

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');
  
  // User cancelled or Google returned an error
  if (error || !code || !state) {
    return ERROR_REDIRECT('OAUTH_CANCELLED');
  }
  
  // Verify CSRF state
  const stateCookie = req.cookies.get('oauth_state')?.value;
  if (!stateCookie) return ERROR_REDIRECT('OAUTH_STATE_MISSING');
  
  let storedState, redirect;
  try {
    const parsed = JSON.parse(stateCookie);
    storedState = parsed.state;
    redirect = parsed.redirect || '/dashboard';
    
    // State expires after 10 minutes
    if (Date.now() - parsed.ts > 10 * 60 * 1000) {
      return ERROR_REDIRECT('OAUTH_STATE_EXPIRED');
    }
  } catch {
    return ERROR_REDIRECT('OAUTH_STATE_INVALID');
  }
  
  if (storedState !== state) return ERROR_REDIRECT('OAUTH_STATE_MISMATCH');
  
  try {
    // 1. Exchange code for token
    const tokenResponse = await exchangeCodeForToken(code);
    
    // 2. Fetch Google profile
    const profile = await fetchGoogleProfile(tokenResponse.access_token);
    
    if (!profile.verified_email) {
      return ERROR_REDIRECT('OAUTH_EMAIL_UNVERIFIED');
    }
    
    // 3. Process identity in a transaction to prevent race conditions
    const { client, isNewUser, isNewLink } = await db.$transaction(async (tx: any) => {
      // Look up by Google provider ID first
      const existingProvider = await tx.authProvider.findUnique({
        where: {
          provider_providerId: {
            provider: 'GOOGLE',
            providerId: profile.id,
          },
        },
        include: { client: true },
      });
      
      if (existingProvider) {
        // CASE C: Returning OAuth user
        const updatedClient = await tx.client.update({
          where: { id: existingProvider.clientId },
          data: { 
            lastSignedInAt: new Date(),
            avatar: profile.picture || existingProvider.client.avatar,
            locale: profile.locale || existingProvider.client.locale,
          }
        });

        await tx.authProvider.update({
          where: { id: existingProvider.id },
          data: { lastUsedAt: new Date() },
        });

        return { client: updatedClient, isNewUser: false, isNewLink: false };
      }

      // Look up by email
      const existingClient = await tx.client.findUnique({
        where: { email: profile.email },
      });
      
      if (existingClient) {
        // CASE B: Existing email user, link Google
        await tx.authProvider.create({
          data: {
            clientId: existingClient.id,
            provider: 'GOOGLE',
            providerId: profile.id,
            email: profile.email,
            emailVerified: true,
            metadata: JSON.stringify({
              picture: profile.picture,
              locale: profile.locale,
              name: profile.name,
            }),
          },
        });
        
        const updatedClient = await tx.client.update({
          where: { id: existingClient.id },
          data: { 
            emailVerified: existingClient.emailVerified || new Date(),
            lastSignedInAt: new Date(),
            avatar: existingClient.avatar || profile.picture,
            locale: existingClient.locale || profile.locale,
          },
        });

        return { client: updatedClient, isNewUser: false, isNewLink: true };
      }

      // CASE A: New user
      const newClient = await tx.client.create({
        data: {
          email: profile.email,
          name: profile.name,
          passwordHash: null,
          emailVerified: new Date(),
          lastSignedInAt: new Date(),
          avatar: profile.picture,
          locale: profile.locale,
          planTier: 'starter',
          role: 'client',
          onboardingComplete: false,
          authProviders: {
            create: {
              provider: 'GOOGLE',
              providerId: profile.id,
              email: profile.email,
              emailVerified: true,
              metadata: JSON.stringify({
                picture: profile.picture,
                locale: profile.locale,
                name: profile.name,
              }),
            },
          },
          // Create default property
          properties: {
            create: {
              name: 'Main Home',
              type: 'RESIDENTIAL',
            },
          },
        },
      });

      return { client: newClient, isNewUser: true, isNewLink: false };
    });

    // 4. Log the Sign-In Event
    await db.signInEvent.create({
      data: {
        clientId: client.id,
        provider: 'GOOGLE',
        ipAddress: ip,
        userAgent: req.headers.get('user-agent'),
        success: true,
      }
    });
    
    // 5. Sign tokens
    const accessToken = await signAccessToken({
      sub: client.id,
      email: client.email,
      role: client.role,
      onboarding_complete: client.onboardingComplete,
    });
    const refreshToken = await signRefreshToken({ sub: client.id });
    
    // 6. Store refresh token in DB
    await db.refreshToken.create({
      data: {
        clientId: client.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    
    // 7. Determine redirect destination
    const finalRedirect = isNewUser || !client.onboardingComplete ? '/onboarding' : redirect;
    
    const response = NextResponse.redirect(
      new URL(finalRedirect, process.env.NEXT_PUBLIC_APP_URL!)
    );
    
    setAuthCookies(response, { accessToken, refreshToken });
    response.cookies.delete('oauth_state');
    
    if (isNewLink) {
      sendAccountLinkedEmail(client.email, 'Google').catch(err => 
        console.error('[oauth] linked email failed:', err)
      );
    }
    
    return response;
  } catch (err) {
    console.error('[oauth/google/callback]', err);
    return ERROR_REDIRECT('OAUTH_INTERNAL_ERROR');
  }
}
