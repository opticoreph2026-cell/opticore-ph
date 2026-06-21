/* eslint-disable no-console */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Replace with your actual PayMongo webhook secret
const PAYMONGO_WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('paymongo-signature');
    if (!signature || !PAYMONGO_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.text();

    // Verify signature
    // The signature header format: t=timestamp,te=test_signature,li=live_signature
    const signatures = signature.split(',');
    const timestamp = signatures[0]?.replace('t=', '') || '';
    const liveSignature = signatures.find(s => s.startsWith('li='))?.replace('li=', '') || signatures.find(s => s.startsWith('te='))?.replace('te=', '');

    const expectedSignature = crypto
      .createHmac('sha256', PAYMONGO_WEBHOOK_SECRET)
      .update(timestamp + '.' + payload)
      .digest('hex');

    if (expectedSignature !== liveSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);
    
    // Process successful payment
    if (event.data.attributes.type === 'payment.paid') {
      const paymentData = event.data.attributes.data.attributes;
      const amount = paymentData.amount;
      const metadata = paymentData.metadata; // Expecting clientId and plan in metadata

      if (metadata?.clientId) {
        let role = 'FREE';
        if (amount >= 79900) role = 'BUSINESS';
        else if (amount >= 14900) role = 'PRO';

        await db.client.update({
          where: { id: metadata.clientId },
          data: { role }
        });

        // Add subscription record (assuming you add a Subscription model later or just log it)
        console.log(`Upgraded user ${metadata.clientId} to ${role}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
