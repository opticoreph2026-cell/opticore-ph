import { NextResponse } from 'next/server';
import { aggregateProviderBenchmarking } from '@/lib/algorithms/providerAggregator';

/**
 * POST /api/admin/aggregate-rates
 * 
 * Secure endpoint to trigger the Nationwide Provider Aggregation engine.
 * Ideal for invoking via Vercel Cron or a secure Admin Dashboard button.
 */
export async function POST(request) {
  try {
    const cronSecret = process.env.ADMIN_CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await aggregateProviderBenchmarking();

    if (!result) {
      return NextResponse.json({ message: 'No new aggregation data found.' }, { status: 200 });
    }

    return NextResponse.json({
      message: 'Nationwide aggregation successful.',
      upsertedCount: result.updatedProviders
    }, { status: 200 });

  } catch (error) {
    console.error('[Cron Aggregate Rates] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
