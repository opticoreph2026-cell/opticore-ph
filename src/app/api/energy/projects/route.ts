import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status;

    const projects = await db.energyProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, contractId: true, designId: true, organizationId: true,
        leadInstallerId: true, scheduledInstallDate: true, actualInstallDate: true,
        commissioningDate: true, status: true, commissioningChecklistJson: true,
        commissioningPhotosJson: true, warrantyRegisteredAt: true,
        createdAt: true, updatedAt: true,
        contract: { select: { quotation: { select: { customer: { select: { fullName: true } } } } } },
        organization: { select: { name: true } },
        leadInstaller: { select: { client: { select: { name: true } } } },
        milestones: { select: { id: true, milestone: true, milestoneDate: true, notes: true }, orderBy: { milestoneDate: 'desc' }, take: 5 },
      },
    });

    return NextResponse.json({ data: projects });
  } catch (err) {
    console.error('[GET /api/energy/projects]', err);
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
      contractId,
      designId,
      organizationId,
      leadInstallerId,
      scheduledInstallDate,
      status,
      milestones,
    } = body;

    if (!contractId || !designId) {
      return NextResponse.json({ error: 'contractId and designId are required' }, { status: 400 });
    }

    const validProjectStatuses = ['scheduled', 'in_progress', 'commissioned', 'warranty_registered', 'closed'];
    const resolvedStatus = status || 'scheduled';
    if (status && !validProjectStatuses.includes(resolvedStatus)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validProjectStatuses.join(', ')}` }, { status: 422 });
    }

    const project = await db.energyProject.create({
      data: {
        contractId,
        designId,
        organizationId: organizationId || null,
        leadInstallerId: leadInstallerId || null,
        scheduledInstallDate: scheduledInstallDate ? new Date(scheduledInstallDate) : null,
        status: resolvedStatus,
      },
    });

    if (milestones && Array.isArray(milestones)) {
      await db.projectMilestone.createMany({
        data: milestones.map((m: { milestone: string; milestoneDate?: string; notes?: string }) => ({
          projectId: project.id,
          milestone: m.milestone,
          milestoneDate: m.milestoneDate ? new Date(m.milestoneDate) : new Date(),
          notes: m.notes || null,
        })),
      });
    }

    // ── Auto-deduct inventory from design's inverter/battery ────────────
    if (designId) {
      try {
        const design = await db.systemDesign.findUnique({
          where: { id: designId },
          select: { inverterId: true, inverterQuantity: true, batteryId: true, batteryQuantity: true },
        });
        if (design) {
          const updates: Promise<unknown>[] = [];
          if (design.inverterId && design.inverterQuantity > 0) {
            const inverters = await db.inventoryUnit.findMany({
              where: {
                inverterId: design.inverterId,
                ownershipStatus: { not: 'sold_installed' },
                installedAtProjectId: null,
              },
              take: design.inverterQuantity,
              orderBy: { receivedDate: 'asc' },
            });
            for (const unit of inverters) {
              updates.push(
                db.inventoryUnit.update({
                  where: { id: unit.id },
                  data: { ownershipStatus: 'sold_installed', installedAtProjectId: project.id },
                }),
              );
            }
          }
          if (design.batteryId && design.batteryQuantity > 0) {
            const batteries = await db.inventoryUnit.findMany({
              where: {
                batteryId: design.batteryId,
                ownershipStatus: { not: 'sold_installed' },
                installedAtProjectId: null,
              },
              take: design.batteryQuantity,
              orderBy: { receivedDate: 'asc' },
            });
            for (const unit of batteries) {
              updates.push(
                db.inventoryUnit.update({
                  where: { id: unit.id },
                  data: { ownershipStatus: 'sold_installed', installedAtProjectId: project.id },
                }),
              );
            }
          }
          await Promise.all(updates);
        }
      } catch (invErr) {
        console.error('[POST /api/energy/projects] inventory deduction error (non-fatal):', invErr);
      }
    }

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/projects]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
