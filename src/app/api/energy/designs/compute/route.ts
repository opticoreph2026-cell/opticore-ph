import 'server-only';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';
import {
  mapBatteryFromDb,
  mapInverterFromDb,
  runDesignCompute,
  type DesignComputeInput,
} from '@/lib/design-compute';
import type { CriticalLoad, DesignPathway, GridConnectionType } from '@/lib/solar-design';

export const runtime = 'nodejs';

async function ensureCustomerAndSite(leadId: string) {
  const lead = await db.energyLead.findUnique({
    where: { id: leadId },
    include: { customers: { include: { sites: true } } },
  });

  if (!lead) throw new Error('Lead not found');

  let customer = lead.customers[0];
  if (!customer) {
    customer = await db.energyCustomer.create({
      data: {
        leadId: lead.id,
        fullName: lead.fullName,
        contactPhone: lead.phone,
        contactEmail: lead.email,
        siteAddress: lead.addressLine,
        customerType: lead.customerType,
      },
      include: { sites: true },
    });
  }

  let site = customer.sites[0];
  if (!site) {
    site = await db.energySite.create({
      data: {
        customerId: customer.id,
        address: lead.addressLine ?? `${lead.city}, ${lead.province}`,
      },
    });
  }

  return { lead, customer, site };
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      leadId,
      save = false,
      averageMonthlyKwh,
      averageMonthlyBillCentavos,
      gridConnectionType = 'single_phase',
      designPathway = 'zero_export_hybrid',
      customerType = 'residential',
      peakSunHours = 4.5,
      targetOffsetPct = 80,
      panelWattage = 550,
      backupAutonomyHours = 4,
      criticalLoads = [],
      availableRoofAreaSqm,
    } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    const { lead, customer, site } = await ensureCustomerAndSite(leadId);

    const [inverterRows, batteryRows] = await Promise.all([
      db.productInverter.findMany({ where: { active: true } }),
      db.productBattery.findMany({ where: { active: true } }),
    ]);

    const input: DesignComputeInput = {
      averageMonthlyKwh: Number(averageMonthlyKwh) || lead.monthlyBillPhp / 100 / 10.5,
      averageMonthlyBillCentavos: Number(averageMonthlyBillCentavos) || lead.monthlyBillPhp,
      gridConnectionType: gridConnectionType as GridConnectionType,
      designPathway: designPathway as DesignPathway,
      customerType: customerType || lead.customerType,
      peakSunHours: Number(peakSunHours),
      targetOffsetPct: Number(targetOffsetPct),
      panelWattage: Number(panelWattage),
      backupAutonomyHours: Number(backupAutonomyHours),
      criticalLoads: criticalLoads as CriticalLoad[],
      availableRoofAreaSqm: availableRoofAreaSqm ? Number(availableRoofAreaSqm) : undefined,
    };

    const result = runDesignCompute(
      input,
      inverterRows.map(mapInverterFromDb),
      batteryRows.map(mapBatteryFromDb),
    );

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    if (!save) {
      return NextResponse.json({
        data: {
          compute: result,
          customerId: customer.id,
          siteId: site.id,
          leadName: lead.fullName,
        },
      });
    }

    const profile = await db.energyProfile.findUnique({
      where: { clientId: session.sub },
    });

    const assessment = await db.loadAssessment.create({
      data: {
        siteId: site.id,
        assessedById: profile?.id ?? null,
        averageMonthlyKwh: input.averageMonthlyKwh,
        averageMonthlyBillPhp: input.averageMonthlyBillCentavos,
        gridConnectionType: input.gridConnectionType,
        backupAutonomyHours: input.backupAutonomyHours,
        criticalLoadsJson: JSON.stringify(input.criticalLoads),
        customerGoal: 'both',
      },
    });

    const design = await db.systemDesign.create({
      data: {
        siteId: site.id,
        assessmentId: assessment.id,
        designedById: profile?.id ?? null,
        designPathway: input.designPathway,
        recommendedTier: result.selection.tier,
        pvArrayKwp: result.pv.pvArrayKwp,
        pvPanelCount: result.pv.panelCount,
        pvPanelWattage: input.panelWattage,
        inverterId: result.selection.inverter.id,
        inverterQuantity: result.selection.inverterQuantity,
        batteryId: result.selection.battery.id,
        batteryQuantity: result.selection.batteryQuantity,
        totalUsableStorageKwh: result.selection.totalUsableStorageKwh,
        estimatedAnnualYieldKwh: result.annualYieldKwh,
        peakSunHours: input.peakSunHours,
        sldDataJson: JSON.stringify(result.sld),
        status: 'draft',
      },
    });

    await db.designBomItem.createMany({
      data: result.bom.map((item) => ({
        designId: design.id,
        itemType: item.itemType,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitCostCentavos: item.unitCostCentavos,
        source: item.source,
      })),
    });

    return NextResponse.json(
      {
        data: {
          design,
          compute: result,
          customerId: customer.id,
          siteId: site.id,
          assessmentId: assessment.id,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[POST /api/energy/designs/compute]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
