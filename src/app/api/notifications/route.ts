import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const severityToType: Record<string, string> = {
  info: 'system',
  warning: 'alert',
  critical: 'alert',
};

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await db.alert.findMany({
      where: { clientId: session.sub },
      orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
      take: 20,
    });

    const notifications = alerts.map((a: any) => ({
      id: a.id,
      type: severityToType[a.severity] ?? 'system',
      title: a.title,
      message: a.message,
      time: timeAgo(new Date(a.createdAt)),
      read: a.isRead,
      href: undefined,
    }));

    return NextResponse.json({ data: notifications });
  } catch (err) {
    console.error('[GET /api/notifications]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}
