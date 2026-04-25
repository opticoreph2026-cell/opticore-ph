/**
 * POST /api/webhooks/paymongo
 * Receives PayMongo events, upgrades plan, fires admin notification.
 */
import { NextResponse }           from 'next/server';
import { verifyWebhookSignature } from '@/lib/paymongo';
import { setClientPlanTier, createAdminNotification, getClientById } from '@/lib/db';

export async function POST(request) {
  const signature = request.headers.get('paymongo-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 401 });
  }

  const rawBody = await request.text();

  let isValid = false;
  try {
    isValid = await verifyWebhookSignature(rawBody, signature);
  } catch {
    return NextResponse.json({ error: 'Signature verification failed.' }, { status: 401 });
  }

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const eventType = event?.data?.attributes?.type;

  if (eventType === 'checkout_session.payment.paid') {
    const session  = event.data?.attributes?.data;
    const metadata = session?.attributes?.metadata ?? {};
    const clientId = metadata.client_id;
    const plan     = metadata.plan;
    const interval = metadata.interval || 'monthly';

    if (!clientId || !plan) {
      return NextResponse.json({ received: true });
    }

    try {
      await setClientPlanTier(clientId, plan, event.data.id);

      // Fetch client details for the notification
      const client = await getClientById(clientId).catch(() => null);

      const prices = { pro: { monthly: 499, yearly: 4790 }, business: { monthly: 2499, yearly: 23990 } };
      const amount = prices[plan]?.[interval] ?? 0;

      // Fire admin notification
      await createAdminNotification({
        type:    'payment',
        title:   `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan activated`,
        message: `${client?.name || 'A user'} upgraded to ${plan} (${interval}) — ₱${amount.toLocaleString()}`,
        meta: {
          clientId,
          email:    client?.email,
          name:     client?.name,
          plan,
          interval,
          amount,
          sessionId: event.data.id,
        },
      }).catch(() => {}); // non-blocking

    } catch {
      return NextResponse.json({ error: 'Failed to upgrade plan.' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
