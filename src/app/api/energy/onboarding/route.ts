import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { onboardingSchema } from '@/lib/validations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (session.role !== 'customer') {
      return NextResponse.json({ error: 'Only customers can onboard' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 422 });
    }

    const { siteAddress, utilityCompanyId, averageBill } = parsed.data;

    const client = await db.client.findFirst({ where: { email: { equals: session.email, mode: 'insensitive' } } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    if (client.onboardingComplete) {
      return NextResponse.json({ error: 'Onboarding already completed' }, { status: 400 });
    }

    let utilityCompany = null;
    if (utilityCompanyId) {
      utilityCompany = await db.energyUtilityCompany.findUnique({ where: { code: utilityCompanyId } });
    }

    const customer = await db.energyCustomer.create({
      data: {
        fullName: client.name || session.email,
        contactEmail: session.email.toLowerCase(),
        contactPhone: client.phone,
        siteAddress: siteAddress || null,
        utilityCompanyId: utilityCompany?.id || null,
        customerType: 'residential',
      },
    });

    if (siteAddress) {
      await db.energySite.create({
        data: {
          customerId: customer.id,
          address: siteAddress,
        },
      });
    }

    if (averageBill && averageBill > 0 && utilityCompany) {
      await db.energyLead.create({
        data: {
          source: 'website_onboarding',
          fullName: client.name || session.email,
          email: session.email,
          phone: client.phone,
          addressLine: siteAddress,
          customerType: 'residential',
          utilityCompanyId: utilityCompany.id,
          monthlyBillPhp: averageBill * 100,
          status: 'new',
        },
      });
    }

    await db.client.update({
      where: { id: client.id },
      data: { onboardingComplete: true },
    });

    return NextResponse.json({ success: true, customerId: customer.id });
  } catch (error) {
    console.error('[Onboarding] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
