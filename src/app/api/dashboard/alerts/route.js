import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { 
  getAlertsByClient, 
  markAlertRead, 
  markAllAlertsRead,
  countUnreadAlerts 
} from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/alerts
 * Query params: severity, read, type, take, skip
 */
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const options = {
      severity: searchParams.get('severity'),
      read:     searchParams.get('read') ?? undefined,
      type:     searchParams.get('type'),
      take:     searchParams.get('take') ?? 20,
      skip:     searchParams.get('skip') ?? 0,
    };

    const [alerts, unreadCount] = await Promise.all([
      getAlertsByClient(user.sub, options),
      countUnreadAlerts(user.sub)
    ]);

    // Metadata for KPI cards
    const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.isRead).length;
    const latestTime = alerts[0]?.createdAt || null;

    return NextResponse.json({
      success: true,
      alerts,
      meta: {
        unreadCount,
        criticalCount,
        latestTime,
        pagination: {
          take: Number(options.take),
          skip: Number(options.skip),
        }
      }
    });

  } catch (err) {
    console.error('[Alerts API] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

/**
 * PUT /api/dashboard/alerts
 * Body: { id: string } or { bulk: true }
 */
export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, bulk } = body;

    if (bulk) {
      await markAllAlertsRead(user.sub);
      return NextResponse.json({ success: true, message: 'All alerts marked as read' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Alert ID is required for single update' }, { status: 400 });
    }

    await markAlertRead(id, user.sub);
    return NextResponse.json({ success: true, message: 'Alert marked as read' });

  } catch (err) {
    console.error('[Alerts API] PUT error:', err);
    const msg = err.message || 'Update failed';
    const status = msg === 'Forbidden.' ? 403 : msg === 'Alert not found.' ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
