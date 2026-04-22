import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/paymongo';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body;

    if (plan !== 'pro' && plan !== 'business') {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const { checkoutUrl } = await createCheckoutSession({
      clientId: user.sub,
      email: user.email,
      plan,
      successUrl: `${baseUrl}/dashboard?upgraded=true`,
      cancelUrl: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('[Checkout API Error]:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
