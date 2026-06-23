import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';
import { createLeadSchema } from '@/lib/validations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedOrgId = searchParams.get('assignedOrgId');

    const where: any = {};
    if (status) where.status = status;
    if (assignedOrgId) where.assignedOrgId = assignedOrgId;

    const leads = await db.energyLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        utilityCompany: { select: { name: true, code: true } },
        assignedOrg: { select: { name: true } },
      },
    });

    return NextResponse.json({ data: leads });
  } catch (err) {
    console.error('[GET /api/energy/leads]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const isPublicSubmission = !session; // Allow public submissions from landing page

    const body = await request.json();
    const parsed = createLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { fullName, phone, email, addressLine, city, province, customerType, monthlyBillPhp, source, notes } = parsed.data;

    if (email) {
      const existing = await db.energyLead.findFirst({
        where: { email },
        select: { id: true, fullName: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      if (existing) {
        return NextResponse.json({ data: existing, duplicate: true }, { status: 200 });
      }
    }

    const lead = await db.energyLead.create({
      data: {
        fullName,
        phone,
        email,
        addressLine,
        city,
        province,
        customerType: customerType || 'residential',
        monthlyBillPhp: monthlyBillPhp || 0,
        source: source || 'website_calc',
        status: 'new',
        notes,
      },
    });

    await db.activityLog.create({
      data: {
        relatedToType: 'lead',
        relatedToId: lead.id,
        action: 'created',
        description: `Lead created for ${fullName}${email ? ` (${email})` : ''}`,
        actorId: (session as any)?.id ?? null,
      },
    }).catch((err: any) => console.error('[activity]', err));

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/leads]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
