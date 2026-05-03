import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createAdminNotification } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * POST /api/provider/request
 * Authenticated user submits an unsupported provider request.
 * Rate limited: 1 per user per 24h.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({})) as {
    providerName?: string;
    region?: string;
    notes?: string;
  };

  const { providerName, region, notes } = body;

  if (!providerName || typeof providerName !== 'string' || providerName.trim().length < 2) {
    return NextResponse.json({ error: 'Provider name is required.' }, { status: 400 });
  }

  // Rate limit: 1 submission per user per 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentRequest = await db.adminNotification.findFirst({
    where: {
      type: 'provider_request',
      meta: { contains: user.id },
      createdAt: { gte: oneDayAgo },
    },
  });

  if (recentRequest) {
    return NextResponse.json(
      { error: 'You have already submitted a provider request in the last 24 hours.' },
      { status: 429 }
    );
  }

  // Create admin notification
  await createAdminNotification({
    type: 'provider_request',
    title: `Provider Request: ${providerName.trim()}`,
    message: `${user.email} is requesting support for ${providerName.trim()}${region ? ` (${region})` : ''}.`,
    meta: {
      clientId: user.id,
      clientEmail: user.email,
      providerName: providerName.trim(),
      region: region?.trim() || null,
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json({
    ok: true,
    message: 'Your request has been submitted. We\'ll add support within 7 days.',
  });
}
