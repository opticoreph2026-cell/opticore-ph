import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await db.energyCustomer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lead: { select: { fullName: true, status: true } },
        sites: { select: { id: true, address: true } },
        _count: { select: { quotations: true } },
      },
    });

    return NextResponse.json({ data: customers });
  } catch (err) {
    console.error('[GET /api/energy/customers]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      leadId, fullName, billingAddress, siteAddress,
      contactPhone, contactEmail, utilityCompanyId,
      utilityAccountNo, customerType, organizationId,
    } = body;

    if (!fullName) {
      return NextResponse.json({ error: 'fullName is required' }, { status: 422 });
    }

    const customer = await db.energyCustomer.create({
      data: {
        leadId: leadId || null,
        fullName,
        billingAddress: billingAddress || null,
        siteAddress: siteAddress || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null,
        utilityCompanyId: utilityCompanyId || null,
        utilityAccountNo: utilityAccountNo || null,
        customerType: customerType || 'residential',
        organizationId: organizationId || null,
      },
    });

    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/customers]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
