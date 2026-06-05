import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const property = await db.property.findFirst({
      where: { 
        id: params.id,
        clientId: user.sub as string 
      },
      include: {
        bills: {
          orderBy: { billingPeriodStart: 'desc' },
          take: 12
        },
        appliances: true,
        fuelLogs: {
          orderBy: { logDate: 'desc' },
          take: 5
        }
      }
    });

    if (!property) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ property });
  } catch (error) {
    console.error('Property GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership
    const existing = await db.property.findFirst({
      where: { id: params.id, clientId: user.sub as string }
    });

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const data = await req.json();

    const updated = await db.property.update({
      where: { id: params.id },
      data
    });

    return NextResponse.json({ property: updated });
  } catch (error) {
    console.error('Property PUT Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership
    const existing = await db.property.findFirst({
      where: { id: params.id, clientId: user.sub as string }
    });

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await db.property.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Property DELETE Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
