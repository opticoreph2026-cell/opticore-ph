/* eslint-disable no-console */
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

const PAYMONGO_WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('paymongo-signature');
    if (!signature || !PAYMONGO_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.text();

    // Verify signature: format t=timestamp,te=test,li=live
    const signatures = signature.split(',');
    const timestamp = signatures.find((s) => s.startsWith('t='))?.replace('t=', '') || '';
    const liveSignature =
      signatures.find((s) => s.startsWith('li='))?.replace('li=', '') ||
      signatures.find((s) => s.startsWith('te='))?.replace('te=', '');

    const expectedSignature = crypto
      .createHmac('sha256', PAYMONGO_WEBHOOK_SECRET)
      .update(timestamp + '.' + payload)
      .digest('hex');

    if (expectedSignature !== liveSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(payload);

    // Process successful payment — record against EnergyContract
    if (event.data.attributes.type === 'payment.paid') {
      const paymentData = event.data.attributes.data.attributes;
      const amountCentavos: number = paymentData.amount ?? 0;
      const metadata = paymentData.metadata as Record<string, string> | undefined;

      if (metadata?.contractId) {
        const paymentType = metadata.paymentType ?? 'deposit';
        const payment = await db.energyPayment.create({
          data: {
            contractId: metadata.contractId,
            amountCentavos,
            paymentType,
            method: 'gcash',
            referenceNo: paymentData.id ?? null,
            paidAt: new Date(),
          },
        });

        await db.energyContract.update({
          where: { id: metadata.contractId },
          data: paymentType === 'deposit'
            ? { depositPaidAt: new Date() }
            : { balancePaidAt: new Date() },
        });

        console.log(`[PayMongo] Recorded payment ${payment.id} (₱${(amountCentavos / 100).toFixed(2)}) for contract ${metadata.contractId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[PayMongo Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
