import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const propertyId = url.searchParams.get('propertyId');

    const whereClause: any = {};
    if (propertyId) {
      whereClause.propertyId = propertyId;
      // Verify property belongs to user
      const property = await db.property.findFirst({
        where: { id: propertyId, clientId: user.sub as string }
      });
      if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    } else {
      // Find all appliances for all user properties
      const properties = await db.property.findMany({
        where: { clientId: user.sub as string },
        select: { id: true }
      });
      whereClause.propertyId = { in: properties.map((p: any) => p.id) };
    }

    const appliances = await db.appliance.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ appliances });
  } catch (error) {
    console.error('Appliances GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { propertyId, name, category, wattage, hoursPerDay, quantity } = data;

    // Verify property
    const property = await db.property.findFirst({
      where: { id: propertyId, clientId: user.sub as string }
    });

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const newAppliance = await db.appliance.create({
      data: {
        clientId: user.sub as string,  // required field — was missing
        propertyId,
        name,
        category,
        wattage,
        hoursPerDay,  // schema field is 'hoursPerDay', not 'dailyHours'
        quantity: quantity || 1
      }
    });

    return NextResponse.json({ appliance: newAppliance });
  } catch (error) {
    console.error('Appliances POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    // Verify ownership indirectly through property
    const appliance = await db.appliance.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!appliance || appliance.property.clientId !== user.sub) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.appliance.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Appliances DELETE Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
