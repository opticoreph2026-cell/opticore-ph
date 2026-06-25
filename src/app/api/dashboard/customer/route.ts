import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.email;
    const customer = await db.energyCustomer.findFirst({
      where: { contactEmail: { equals: email, mode: 'insensitive' } },
      select: {
        id: true,
        fullName: true,
        contactEmail: true,
        contactPhone: true,
        siteAddress: true,
        quotations: {
          select: {
            id: true,
            quoteNumber: true,
            status: true,
            grandTotal: true,
            issueDate: true,
            validUntil: true,
          },
          orderBy: { issueDate: 'desc' },
          take: 3,
        },
      },
    });

    let project = null;
    if (customer) {
      project = await db.energyProject.findFirst({
        where: {
          contract: {
            quotation: {
              customerId: customer.id,
            },
          },
        },
        select: {
          id: true,
          status: true,
          scheduledInstallDate: true,
          commissioningDate: true,
          milestones: {
            select: { milestone: true, milestoneDate: true },
            orderBy: { milestoneDate: 'desc' },
            take: 5,
          },
        },
      });
    }

    return NextResponse.json({ customer, project });
  } catch (err) {
    console.error('[GET /api/dashboard/customer]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
