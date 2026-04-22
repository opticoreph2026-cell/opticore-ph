import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { setClientPlanTier } from '@/lib/db';

/**
 * POST /api/admin/clients/[id]/plan
 * 
 * Securely allows an admin to manually override a user's plan tier.
 * Records the action in the Transaction log as 'manual_override'.
 */
export async function POST(request, { params }) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { plan } = body;

    if (!['starter', 'pro', 'business'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    await setClientPlanTier(id, plan, null, 'manual_override');

    return NextResponse.json({ success: true, message: `Plan updated to ${plan}` });

  } catch (error) {
    console.error('[Admin Plan Override Error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
