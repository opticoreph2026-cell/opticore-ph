/**
 * POST /api/auth/refresh
 * Re-issues a fresh 24h JWT using latest DB data (plan, onboarding status, etc.)
 * Useful after a PayMongo upgrade webhook fires and the old JWT still shows 'starter'.
 */
import { NextResponse } from 'next/server';
import { getCurrentUser, signToken, setAuthCookie } from '@/lib/auth';
import { getClientById } from '@/lib/db';

export async function POST() {
  try {
    const jwtUser = await getCurrentUser();
    if (!jwtUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch latest state from DB — this picks up planTier changes from PayMongo webhooks
    const client = await getClientById(jwtUser.sub);
    if (!client) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const newToken = await signToken({
      sub:                 client.id,
      email:               client.email,
      name:                client.name,
      role:                client.role ?? 'client',
      plan:                client.planTier ?? 'starter',
      onboarding_complete: client.onboardingComplete ?? false,
    });

    await setAuthCookie(newToken);

    return NextResponse.json({
      success: true,
      plan: client.planTier ?? 'starter',
    });
  } catch (error) {
    console.error('[Auth Refresh]:', error);
    return NextResponse.json({ error: 'Failed to refresh session.' }, { status: 500 });
  }
}
