import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const propertyId = url.searchParams.get('propertyId');

    const whereClause: any = { clientId: user.sub as string };
    if (propertyId) whereClause.propertyId = propertyId;

    const fuelLogs = await db.fuelLog.findMany({
      where: whereClause,
      orderBy: { logDate: 'desc' }
    });

    return NextResponse.json({ fuelLogs });
  } catch (error) {
    console.error('FuelLogs GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { propertyId, fuelType, quantity, pricePerUnit, purpose, logDate, notes } = data;

    // Verify property
    const property = await db.property.findFirst({
      where: { id: propertyId, clientId: user.sub as string }
    });

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const totalCost = Math.round((quantity / 100) * (pricePerUnit / 100) * 100);

    const newFuelLog = await db.fuelLog.create({
      data: {
        clientId: user.sub as string,
        propertyId,
        fuelType,
        quantity,
        pricePerUnit,
        totalCost,
        purpose,
        logDate: new Date(logDate),
        notes
      }
    });

    return NextResponse.json({ fuelLog: newFuelLog });
  } catch (error) {
    console.error('FuelLogs POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
