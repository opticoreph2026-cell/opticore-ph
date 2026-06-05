import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = await db.client.findUnique({
      where: { id: user.sub as string },
      include: {
        properties: true,
        bills: { take: 5, orderBy: { billingPeriodStart: 'desc' } }
      }
    });

    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Remove password hash from response
    const { passwordHash, ...safeClient } = client;

    return NextResponse.json({ profile: safeClient });
  } catch (error) {
    console.error('Profile GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { email, password, role, ...updateData } = data; // Prevent updating sensitive fields here

    const updated = await db.client.update({
      where: { id: user.sub as string },
      data: updateData
    });

    // Remove password hash
    const { passwordHash, ...safeClient } = updated;

    return NextResponse.json({ profile: safeClient });
  } catch (error) {
    console.error('Profile PUT Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
