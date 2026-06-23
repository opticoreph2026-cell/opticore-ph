import React from 'react';

export default function CustomerDocumentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-2">My Documents</h1>
      <p className="text-gray-400">Your signed contracts, invoices, and certificates.</p>
      <div className="bg-[#16161D] border border-white/5 rounded-xl p-8 text-center text-gray-500">
        No documents yet. Documents will appear here after your first project.
      </div>
    </div>
  );
}
