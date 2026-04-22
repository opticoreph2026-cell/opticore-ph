/**
 * POST /api/webhooks/paymongo
 *
 * Receives PayMongo webhook events and upgrades client plans automatically.
 *
 * Supported events:
 *   - checkout_session.payment.paid  → upgrade plan_tier
 *
 * Setup in PayMongo Dashboard → Developers → Webhooks:
 *   URL:    https://yourdomain.com/api/webhooks/paymongo
 *   Events: checkout_session.payment.paid
 */

import { NextResponse }        from 'next/server';
import { verifyWebhookSignature } from '@/lib/paymongo';
import { setClientPlanTier }   from '@/lib/db';

export async function POST(request) {
  const signature = request.headers.get('paymongo-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 401 });
  }

  // Read raw body for signature verification
  const rawBody = await request.text();

  // Verify HMAC signature
  let isValid = false;
  try {
    isValid = await verifyWebhookSignature(rawBody, signature);
  } catch {
    return NextResponse.json({ error: 'Signature verification failed.' }, { status: 401 });
  }

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  // Parse the event
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const eventType = event?.data?.attributes?.type;

  // ── Handle payment success ────────────────────────────────────────────────
  if (eventType === 'checkout_session.payment.paid') {
    const session  = event.data?.attributes?.data;
    const metadata = session?.attributes?.metadata ?? {};
    const clientId = metadata.client_id;
    const plan     = metadata.plan;

    if (!clientId || !plan) {
      // Gracefully ignore — PayMongo expects a 200 regardless
      return NextResponse.json({ received: true });
    }

    try {
      await setClientPlanTier(clientId, plan);
    } catch {
      // Log internally (not to console in production)
      // In production: use a structured logger (Datadog, Sentry, etc.)
      return NextResponse.json({ error: 'Failed to upgrade plan.' }, { status: 500 });
    }
  }

  // Always return 200 to acknowledge receipt
  return NextResponse.json({ received: true }, { status: 200 });
}

