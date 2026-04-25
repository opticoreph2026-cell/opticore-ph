/**
 * GET  /api/admin/notifications        — list + unread count
 * POST /api/admin/notifications        — mark one or all as read
 */
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getAdminNotifications,
  countUnreadAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const [notifications, unreadCount] = await Promise.all([
      getAdminNotifications(40),
      countUnreadAdminNotifications(),
    ]);
    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error('[Admin Notifications GET]', err);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await request.json();
    if (body.markAll) {
      await markAllAdminNotificationsRead();
    } else if (body.id) {
      await markAdminNotificationRead(body.id);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin Notifications POST]', err);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
