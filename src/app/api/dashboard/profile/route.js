import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getClientById, updateClientProfile } from '@/lib/db';

/**
 * GET /api/dashboard/profile
 * Returns the current user's profile data (name, email, applianceCount, etc.).
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getClientById(user.sub);
    if (!client) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: client.id,
        name: client.name,
        email: client.email,
        applianceCount: client.applianceCount || 0,
        planTier: client.planTier,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/dashboard/profile
 * Updates the user's profile fields.
 */
export async function PATCH(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applianceCount, name } = body;

    const updated = await updateClientProfile(user.sub, {
      applianceCount: applianceCount !== undefined ? parseInt(applianceCount) : undefined,
      name
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: updated.id,
        name: updated.name,
        applianceCount: updated.applianceCount,
      }
    });
  } catch (error) {
    console.error('[profile] PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
