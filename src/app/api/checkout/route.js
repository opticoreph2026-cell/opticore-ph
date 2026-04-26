import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
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
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 });
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

    if (!checkoutUrl) {
      throw new Error('PayMongo returned an empty checkout URL.');
    }

    return NextResponse.json({ url: checkoutUrl });

  } catch (error) {
    console.error('[Checkout API Error]:', error);

    // Detailed error for debugging (will be shown in toast)
    const errorMessage = error?.message || 'Unknown error';
    if (errorMessage.includes('PayMongo error')) {
      return NextResponse.json(
        { error: `Payment gateway error: ${errorMessage.replace('PayMongo error: ', '')}` },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: `Checkout failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
