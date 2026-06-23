import React from 'react';

export default function CustomerSupportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-2">Support</h1>
      <p className="text-gray-400">Get help with your solar system or account.</p>
      <div className="bg-[#16161D] border border-white/5 rounded-xl p-8 text-center text-gray-500">
        <p className="mb-4">Contact our support team:</p>
        <p className="text-[#F5A524]">support@opticore.ph</p>
        <p className="text-gray-400 mt-2">Response time: within 24 hours</p>
      </div>
    </div>
  );
}
