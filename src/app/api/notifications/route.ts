import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isOptcoreStaff } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isOptcoreStaff(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10) || 50));
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      db.adminNotification.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      db.adminNotification.count(),
    ]);

    return NextResponse.json({ data: notifications, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[GET /api/notifications]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isOptcoreStaff(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, message, meta } = body;

    if (!type || !title || !message) {
      return NextResponse.json({ error: 'type, title, and message are required' }, { status: 422 });
    }

    const notification = await db.adminNotification.create({
      data: {
        type,
        title,
        message,
        meta: meta ? JSON.stringify(meta) : null,
      },
    });

    return NextResponse.json({ data: notification }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/notifications]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
