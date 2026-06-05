import { NextResponse } from 'next/server';
import { db, getErcRateForMonth, getWaterRateForDate } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { calculateExpectedElectricBill } from '@/lib/erc-calculator';
import { calculateExpectedWaterBill } from '@/lib/water-calculator';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const propertyId = url.searchParams.get('propertyId');
    const utilityType = url.searchParams.get('utilityType'); // electric, water

    const whereClause: any = { clientId: user.sub as string };
    if (propertyId) whereClause.propertyId = propertyId;
    if (utilityType) whereClause.utilityType = utilityType;

    const bills = await db.bill.findMany({
      where: whereClause,
      include: { lineItems: true },
      orderBy: { billingPeriodStart: 'desc' }
    });

    return NextResponse.json({ bills });
  } catch (error) {
    console.error('Bills GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { propertyId, utilityType, billingPeriodStart, billingPeriodEnd, dueDate, amountDue, consumption, lineItems, ...rest } = data;

    // Verify property
    const property = await db.property.findFirst({
      where: { id: propertyId, clientId: user.sub as string }
    });

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    // ERC/Water Verification Logic
    let ercVerified = false;
    let ercVerificationResult = null;
    let ratePerUnit = null;

    if (utilityType === 'electric' && property.electricDU) {
      const activeRate = await getErcRateForMonth(property.electricDU, new Date(billingPeriodStart));
      if (activeRate) {
        const verification = calculateExpectedElectricBill(consumption, activeRate);
        ercVerified = true;
        ercVerificationResult = JSON.stringify(verification);
        ratePerUnit = Math.round((verification.totalExpectedCentavos / consumption) * 10000); // Int rate unit
      }
    } else if (utilityType === 'water' && property.waterUtility) {
      const activeRate = await getWaterRateForDate(property.waterUtility, new Date(billingPeriodStart));
      if (activeRate) {
        const verification = calculateExpectedWaterBill(consumption, activeRate);
        ercVerified = true;
        ercVerificationResult = JSON.stringify(verification);
        ratePerUnit = Math.round((verification.totalExpectedCentavos / consumption) * 10000);
      }
    }

    const newBill = await db.bill.create({
      data: {
        clientId: user.sub as string,
        propertyId,
        utilityType,
        billingPeriodStart: new Date(billingPeriodStart),
        billingPeriodEnd: new Date(billingPeriodEnd),
        dueDate: dueDate ? new Date(dueDate) : null,
        amountDue,
        consumption,
        ratePerUnit,
        ercVerified,
        ercVerificationResult,
        distributionUtility: utilityType === 'electric' ? property.electricDU : property.waterUtility,
        ...rest,
        lineItems: {
          create: lineItems || []
        }
      },
      include: { lineItems: true }
    });

    return NextResponse.json({ bill: newBill });
  } catch (error) {
    console.error('Bills POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
