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
  draft: 'bg-white/5 text-white/40',
  sent: 'bg-accent-cyan/10 text-accent-cyan',
  accepted: 'bg-accent-emerald/10 text-accent-emerald',
  rejected: 'bg-accent-rose/10 text-accent-rose',
  expired: 'bg-gray-500/10 text-gray-400',
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
          <Link href="/crm/quotations" className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{quotation.quoteNumber}</h1>
            <p className="text-sm text-gray-400">{quotation.customer?.fullName || 'Unknown Customer'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[quotation.status] ?? 'bg-white/5 text-gray-400'}`}>
            {quotation.status}
          </span>
          <QuotationActions quotationId={quotation.id} currentStatus={quotation.status} />
          <a
            href={`/api/energy/quotations/${id}/pdf`}
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-blue text-white text-sm font-semibold hover:bg-accent-blue/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#16161D] border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Quote Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span className="text-white">{quotation.customer?.fullName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Address</span>
              <span className="text-white">{quotation.customer?.siteAddress || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Issue Date</span>
              <span className="text-white">{new Date(quotation.issueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Valid Until</span>
              <span className="text-white">{new Date(quotation.validUntil).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">VAT Treatment</span>
              <span className="text-white capitalize">{quotation.vatTreatment.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#16161D] border border-white/5 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">System</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Solar PV</span>
              <span className="text-white">{quotation.design?.pvArrayKwp ? `${quotation.design.pvArrayKwp} kWp` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Panels</span>
              <span className="text-white">
                {quotation.design?.pvPanelCount ? `${quotation.design.pvPanelCount} × ${quotation.design.pvPanelWattage}W` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Inverter</span>
              <span className="text-white">{quotation.design?.inverter?.modelName || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Battery</span>
              <span className="text-white">
                {quotation.design?.battery ? `${quotation.design.battery.usableKwh} kWh` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#16161D] border border-white/5 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Pricing</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Hardware</span>
            <span className="text-white">{formatMoney(quotation.hardwareSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Installation</span>
            <span className="text-white">{formatMoney(quotation.installationFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Design & Engineering</span>
            <span className="text-white">{formatMoney(quotation.designFee)}</span>
          </div>
          {Number(quotation.maintenanceContractOffer) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Maintenance</span>
              <span className="text-white">{formatMoney(quotation.maintenanceContractOffer)}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-white/5">
            <span className="text-base font-semibold text-white">Grand Total</span>
            <span className="text-base font-bold text-accent-cyan">{formatMoney(quotation.grandTotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Deposit Required</span>
            <span>{quotation.depositRequiredPct}%</span>
          </div>
        </div>
      </div>

      {quotation.notes && (
        <div className="bg-[#16161D] border border-white/5 rounded-xl p-6 space-y-2">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Notes</h3>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{quotation.notes}</p>
        </div>
      )}
    </div>
  );
}
