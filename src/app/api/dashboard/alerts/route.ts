import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const alerts = await db.alert.findMany({
      where: { 
        clientId: user.sub as string,
        resolved: false
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Alerts GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { id, resolved } = data;

    const alert = await db.alert.findFirst({
      where: { id, clientId: user.sub as string }
    });

    if (!alert) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await db.alert.update({
      where: { id },
      data: { resolved }
    });

    return NextResponse.json({ alert: updated });
  } catch (error) {
    console.error('Alerts PUT Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
