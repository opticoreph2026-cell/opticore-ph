import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getActiveProperty, getClientById, db } from '@/lib/db';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getClientById(user.sub);
    const plan = client?.planTier ?? 'starter';

    if (plan === 'starter') {
      return NextResponse.json({ 
        error: 'FORBIDDEN', 
        message: 'LPG Empty Forecaster is a Pro feature. Please upgrade to track depletion rates.' 
      }, { status: 403 });
    }

    const { tankSizeKg, costPhp, brand, replacementDate, isEmpty } = await request.json();

    if (!tankSizeKg || !costPhp || !replacementDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const activeProperty = await getActiveProperty(user.sub);

    const reading = await db.lPGReading.create({
      data: {
        clientId: user.sub,
        propertyId: activeProperty?.id || null,
        tankSizeKg: Number(tankSizeKg),
        costPhp: Number(costPhp),
        brand: brand || null,
        replacementDate: replacementDate,
        isEmpty: Boolean(isEmpty),
      }
    });

    return NextResponse.json({ success: true, readingId: reading.id }, { status: 200 });

  } catch (error) {
    console.error('LPG Submission Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
