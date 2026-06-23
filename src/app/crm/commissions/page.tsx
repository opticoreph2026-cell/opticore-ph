import React from 'react';
import Link from 'next/link';
import { Handshake } from 'lucide-react';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function CommissionsPage() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-4">
        <Handshake className="w-12 h-12 text-white/10 mx-auto" />
        <h2 className="text-xl font-semibold text-white/40">Partner Commissions</h2>
        <p className="text-sm text-white/20 max-w-md">
          Commission tracking and partner payouts will be available here.
        </p>
        <Link
          href="/crm"
          className="inline-block text-sm text-accent-amber hover:text-accent-amber/80 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
