/**
 * POST /api/admin/upgrade
 * Admin-only: manually upgrade or downgrade a client's plan tier.
 *
 * Body: { clientId: string, tier: 'starter' | 'pro' | 'business' }
 */

import { NextResponse }      from 'next/server';
import { getCurrentUser }    from '@/lib/auth';
import { setClientPlanTier } from '@/lib/db';

const VALID_TIERS = ['starter', 'pro', 'business'];

export async function POST(request) {
  const jwtUser = await getCurrentUser();

  if (!jwtUser || jwtUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { clientId, tier } = body ?? {};

  if (!clientId || !tier) {
    return NextResponse.json({ error: 'clientId and tier are required.' }, { status: 400 });
  }

  if (!VALID_TIERS.includes(tier)) {
    return NextResponse.json(
      { error: `Invalid tier. Must be one of: ${VALID_TIERS.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    await setClientPlanTier(clientId, tier);
    return NextResponse.json({ success: true, clientId, tier });
  } catch {
    return NextResponse.json({ error: 'Failed to update plan.' }, { status: 500 });
  }
}
