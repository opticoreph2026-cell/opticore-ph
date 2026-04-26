/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile.
 */

import { NextResponse }        from 'next/server';
import { getSession }         from '@/lib/auth';
import { getClientById }       from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const jwtUser = await getSession();
  if (!jwtUser) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  let profile = null;
  try {
    const record = await getClientById(jwtUser.sub);
    if (record) {
      profile = {
        id:               record.id,
        name:             record.name             ?? jwtUser.name,
        email:            record.email            ?? jwtUser.email,
        plan:             record.planTier         ?? 'starter',
        avatar:           record.avatar           ?? jwtUser.avatar ?? '',
        electricProvider: record.electricityProviderId ?? '',
        waterProvider:    record.waterProviderId       ?? '',
        role:             record.role             ?? 'client',
        emailAlertsEnabled: record.emailAlertsEnabled ?? true,
      };
    } else {
      // User exists in token but not in DB (e.g. deleted)
      throw new Error('User not found in data store');
    }
  } catch {
    // Fall back to JWT data
      profile = {
        id:    jwtUser.sub,
        name:  jwtUser.name,
        email: jwtUser.email,
        plan:  'starter',
        avatar: jwtUser.avatar ?? '',
        role:  jwtUser.role ?? 'client',
      };
  }

  return NextResponse.json({ user: profile }, { status: 200 });
}
