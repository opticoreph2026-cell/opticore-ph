import React from 'react';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { FileText, Download } from 'lucide-react';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const docTypeLabels: Record<string, string> = {
  proposal_pdf: 'Proposals',
  contract: 'Contracts',
  sld: 'Single-Line Diagrams',
  coc: 'Certificate of Compliance',
  warranty_cert: 'Warranty Certificates',
  invoice: 'Invoices',
  receipt: 'Receipts',
};

const docTypeIcons: Record<string, string> = {
  proposal_pdf: 'text-accent-cyan',
  contract: 'text-accent-emerald',
  sld: 'text-accent-cyan',
  coc: 'text-purple-400',
  warranty_cert: 'text-accent-rose',
  invoice: 'text-accent-cyan',
  receipt: 'text-foreground-400',
};

export default async function CustomerDocumentsPage() {
  const session = await getSession();
  const email = session?.email as string;

  let customerId: string | null = null;
  let documents: any[] = [];

  if (email) {
    const customer = await db.energyCustomer.findFirst({
      where: { contactEmail: email },
      select: { id: true },
    });
    if (customer) {
      customerId = customer.id;
      documents = await db.energyDocument.findMany({
        where: { ownerType: 'customer', ownerId: customer.id },
        orderBy: { uploadedAt: 'desc' },
      });
    }
  }

  const grouped: Record<string, any[]> = {};
  for (const doc of documents) {
    const key = doc.docType;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(doc);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground-950 mb-2">My Documents</h1>
        <p className="text-foreground-400">Your signed contracts, invoices, certificates, and system diagrams.</p>
      </div>

      {!customerId ? (
        <div className="bg-background-800 border border-foreground-950/5 rounded-xl p-12 text-center text-foreground-500">
          <FileText className="w-10 h-10 mx-auto mb-3 text-foreground-600" />
          <p className="font-medium text-foreground-400">No account linked</p>
          <p className="text-sm text-foreground-600 mt-1">
            Please contact support to link your account.
          </p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-background-800 border border-foreground-950/5 rounded-xl p-12 text-center text-foreground-500">
          <FileText className="w-10 h-10 mx-auto mb-3 text-foreground-600" />
          <p className="font-medium text-foreground-400">No documents yet</p>
          <p className="text-sm text-foreground-600 mt-1">
            Documents will appear here after your first project is created.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([docType, docs]) => (
          <div key={docType} className="bg-background-800 border border-foreground-950/5 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-foreground-950/5 bg-foreground-950/5">
              <h2 className="text-lg font-bold text-foreground-950">{docTypeLabels[docType] || docType}</h2>
            </div>
            <div className="divide-y divide-white/5">
              {docs.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-foreground-950/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-5 h-5 ${docTypeIcons[docType] || 'text-foreground-500'} flex-shrink-0`} />
                    <div>
                      <p className="text-sm font-medium text-foreground-950">
                        {doc.fileUrl?.split('/').pop() || 'Document'}
                      </p>
                      <p className="text-xs text-foreground-500">
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-PH', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-foreground-950/5 text-foreground-400 hover:text-accent-cyan transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
