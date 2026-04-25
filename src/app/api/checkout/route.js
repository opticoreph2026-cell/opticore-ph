import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/paymongo';

export async function POST(request) {
  // Guard: PayMongo must be configured
  if (!process.env.PAYMONGO_SECRET_KEY) {
    console.error('[Checkout] PAYMONGO_SECRET_KEY is not set in environment variables.');
    return NextResponse.json(
      { error: 'Payment gateway is not configured. Please contact support.' },
      { status: 503 }
    );
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { plan, interval } = body ?? {};

    if (plan !== 'pro' && plan !== 'business') {
      return NextResponse.json({ error: 'Invalid plan selected.' }, { status: 400 });
    }

    const host     = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl  = `${protocol}://${host}`;

    const { checkoutUrl } = await createCheckoutSession({
      clientId:   user.sub,
      email:      user.email,
      plan,
      interval:   interval || 'monthly',
      successUrl: `${baseUrl}/dashboard?upgraded=true&plan=${plan}`,
      cancelUrl:  `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: checkoutUrl });

  } catch (error) {
    console.error('[Checkout API Error]:', error?.message ?? error);

    // Surface PayMongo-specific errors so front-end can show them
    const message = error?.message ?? '';
    if (message.includes('PayMongo error')) {
      return NextResponse.json(
        { error: 'Payment gateway rejected the request. Please try again or contact support.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    );
  }
}
