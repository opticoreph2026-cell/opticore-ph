import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getActiveProperty, getClientById, db, createAlert } from '@/lib/db';
import { predictLPGDepletion } from '@/lib/algorithms/lpgPredictor';

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const activeProperty = await getActiveProperty(user.sub);
    const readings = await db.lPGReading.findMany({
      where: { 
        clientId: user.sub,
        propertyId: activeProperty?.id || null 
      },
      orderBy: { replacementDate: 'desc' },
      take: 20
    });

    return NextResponse.json({ readings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch LPG history' }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
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
    
    // 2. Trigger Intelligence Forecaster
    try {
      const forecast = await predictLPGDepletion(user.sub, activeProperty?.id);
      
      if (forecast && forecast.status !== 'insufficient_data') {
        if (forecast.status === 'warning' || forecast.status === 'critical') {
          await createAlert({
            client_id: user.sub,
            title: "🔥 LPG Tank Depletion Alert",
            message: `Your tank is estimated to be ${forecast.percentLeft.toFixed(0)}% full. Estimated empty date: ${forecast.estimatedDate} (${forecast.daysLeft} days remaining).`,
            severity: forecast.status === 'critical' ? 'critical' : 'warning'
          });
        }
      }
    } catch (forecasterErr) {
      console.error('[LPG Forecaster] Non-fatal error:', forecasterErr);
    }

    return NextResponse.json({ success: true, readingId: reading.id }, { status: 200 });

  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const record = await db.lPGReading.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (record.clientId !== user.sub) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await db.lPGReading.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete LPG record' }, { status: 500 });
  }
}
