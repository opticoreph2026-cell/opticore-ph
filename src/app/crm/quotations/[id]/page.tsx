import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { QuotationActions } from '@/components/crm/QuotationActions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const statusColors: Record<string, string> = {
  draft: 'bg-foreground-950/5 text-foreground-950/40',
  sent: 'bg-accent-cyan/10 text-accent-cyan',
  accepted: 'bg-accent-emerald/10 text-accent-emerald',
  rejected: 'bg-accent-rose/10 text-accent-rose',
  expired: 'bg-gray-500/10 text-foreground-950/40',
};

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || !canAccessCrm(session as any)) {
    redirect('/login');
  }

  const { id } = await params;

  const quotation = await db.energyQuotation.findUnique({
    where: { id },
    include: {
      customer: true,
      design: {
        include: { inverter: true, battery: true, panelModel: true },
      },
      roiScenario: true,
    },
  });

  if (!quotation) {
    redirect('/crm/quotations');
  }

  const formatMoney = (v: number) => `₱${Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/crm/quotations" className="p-2 rounded-lg hover:bg-foreground-950/5 text-foreground-950/40 hover:text-foreground-950 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground-950">{quotation.quoteNumber}</h1>
            <p className="text-sm text-foreground-950/40">{quotation.customer?.fullName || 'Unknown Customer'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[quotation.status] ?? 'bg-foreground-950/5 text-foreground-950/40'}`}>
            {quotation.status}
          </span>
          <QuotationActions quotationId={quotation.id} currentStatus={quotation.status} />
          <a
            href={`/api/energy/quotations/${id}/pdf`}
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-background-50 text-sm font-semibold hover:bg-primary-600 shadow-lg shadow-primary-500/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-800 border border-foreground-950/10 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-display font-semibold text-foreground-950/60 uppercase tracking-wider">Quote Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground-950/50">Customer</span>
              <span className="text-foreground-950">{quotation.customer?.fullName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-950/50">Address</span>
              <span className="text-foreground-950">{quotation.customer?.siteAddress || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-950/50">Issue Date</span>
              <span className="text-foreground-950">{new Date(quotation.issueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-950/50">Valid Until</span>
              <span className="text-foreground-950">{new Date(quotation.validUntil).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-950/50">VAT Treatment</span>
              <span className="text-foreground-950 capitalize">{quotation.vatTreatment.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        <div className="bg-background-800 border border-foreground-950/10 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-display font-semibold text-foreground-950/60 uppercase tracking-wider">System</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground-950/50">Solar PV</span>
              <span className="text-foreground-950">{quotation.design?.pvArrayKwp ? `${quotation.design.pvArrayKwp} kWp` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-950/50">Panels</span>
              <span className="text-foreground-950">
                {quotation.design?.pvPanelCount ? `${quotation.design.pvPanelCount} × ${quotation.design.pvPanelWattage}W` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-950/50">Inverter</span>
              <span className="text-foreground-950">{quotation.design?.inverter?.modelName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-950/50">Battery</span>
              <span className="text-foreground-950">
                {quotation.design?.battery ? `${quotation.design.battery.usableKwh} kWh` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background-800 border border-foreground-950/10 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-display font-semibold text-foreground-950/60 uppercase tracking-wider">Pricing</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground-950/50">Hardware</span>
            <span className="text-foreground-950">{formatMoney(quotation.hardwareSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-950/50">Installation</span>
            <span className="text-foreground-950">{formatMoney(quotation.installationFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground-950/50">Design & Engineering</span>
            <span className="text-foreground-950">{formatMoney(quotation.designFee)}</span>
          </div>
          {Number(quotation.maintenanceContractOffer) > 0 && (
            <div className="flex justify-between">
                <span className="text-foreground-950/50">Maintenance</span>
              <span className="text-foreground-950">{formatMoney(quotation.maintenanceContractOffer)}</span>
            </div>
          )}
          {Number(quotation.permitFee) > 0 && (
            <div className="flex justify-between">
                <span className="text-foreground-950/50">Permits & DU Filing</span>
              <span className="text-foreground-950">{formatMoney(quotation.permitFee)}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-foreground-950/10">
            <span className="text-base font-semibold text-foreground-950">Grand Total</span>
            <span className="text-base font-bold text-accent-cyan">{formatMoney(quotation.grandTotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-foreground-950/50">
            <span>Deposit Required</span>
            <span>{quotation.depositRequiredPct}%</span>
          </div>
        </div>
      </div>

      {quotation.notes && (
        <div className="bg-background-800 border border-foreground-950/10 rounded-xl p-6 space-y-2">
          <h3 className="text-sm font-display font-semibold text-foreground-950/60 uppercase tracking-wider">Notes</h3>
          <p className="text-sm text-foreground-950/70 whitespace-pre-wrap">{quotation.notes}</p>
        </div>
      )}
    </div>
  );
}
