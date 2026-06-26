import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm, canAccessDesigns } from '@/lib/energy-auth';
import { createLeadSchema } from '@/lib/validations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessDesigns(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedOrgId = searchParams.get('assignedOrgId');

    const where: any = {};
    if (status) where.status = status;
    if (assignedOrgId) where.assignedOrgId = assignedOrgId;
    if (session.organizationId && !canAccessCrm(session as any)) {
      where.assignedOrgId = session.organizationId;
    }

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

    const { fullName, phone, email, addressLine, city, province, barangay, customerType, monthlyBill, source, notes } = parsed.data;

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
        barangay,
        customerType: customerType || 'residential',
        monthlyBill: monthlyBill || 0,
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

    // ── Territory-based auto-assignment ─────────────────────────────────
    if (province) {
      try {
        const orgs = await db.energyOrganization.findMany({
          where: { status: 'active', type: 'partner' },
          select: { id: true, name: true, territory: true },
        });
        const normalizedProvince = province.toLowerCase().trim();
        const matchedOrg = orgs.find((org: { id: string; name: string; territory: string }) => {
          try {
            const territories: string[] = JSON.parse(org.territory);
            return territories.some((t) => t.toLowerCase().trim() === normalizedProvince);
          } catch { return false; }
        });
        if (matchedOrg) {
          await db.energyLead.update({
            where: { id: lead.id },
            data: { assignedOrgId: matchedOrg.id },
          });
          lead.assignedOrgId = matchedOrg.id;
        }
      } catch (terrErr) {
        console.error('[territory assignment]', terrErr);
      }
    }

    await db.adminNotification.create({
      data: {
        type: 'lead',
        title: 'New Lead',
        message: `New ${customerType || 'residential'} lead from ${fullName}`,
        meta: JSON.stringify({ href: `/crm/leads` }),
      },
    }).catch((err: any) => console.error('[notification]', err));

    return NextResponse.json({ data: lead }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/leads]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
