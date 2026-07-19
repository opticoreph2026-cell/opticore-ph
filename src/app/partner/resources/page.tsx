import React from 'react';
import { BookOpen, FileText, Download, Film, FileSpreadsheet } from 'lucide-react';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const resources = [
  {
    section: 'Brand Assets',
    icon: FileText,
    items: [
      { name: 'OptiCore Brand Guidelines', type: 'PDF', size: '2.4 MB', url: '#' },
      { name: 'Logo Pack (PNG + SVG)', type: 'ZIP', size: '1.8 MB', url: '#' },
      { name: 'Social Media Templates', type: 'ZIP', size: '4.2 MB', url: '#' },
    ],
  },
  {
    section: 'Training Guides',
    icon: BookOpen,
    items: [
      { name: 'Neovolt Product Training Manual', type: 'PDF', size: '8.6 MB', url: '#' },
      { name: 'Site Assessment Checklist', type: 'PDF', size: '1.2 MB', url: '#' },
      { name: 'Installation Best Practices', type: 'PDF', size: '3.5 MB', url: '#' },
    ],
  },
  {
    section: 'Technical Datasheets',
    icon: FileSpreadsheet,
    items: [
      { name: 'Neovolt Inverter Series Datasheet', type: 'PDF', size: '1.1 MB', url: '#' },
      { name: 'Battery Storage Specifications', type: 'PDF', size: '0.9 MB', url: '#' },
      { name: 'System Design Reference Guide', type: 'PDF', size: '5.3 MB', url: '#' },
    ],
  },
  {
    section: 'Sales Materials',
    icon: Film,
    items: [
      { name: 'Customer Presentation Deck', type: 'PPTX', size: '12.4 MB', url: '#' },
      { name: 'ROI Comparison One-Pager', type: 'PDF', size: '0.6 MB', url: '#' },
      { name: 'Customer Testimonials', type: 'PDF', size: '1.8 MB', url: '#' },
    ],
  },
];

function typeColor(type: string): string {
  if (type === 'PDF') return 'text-accent-rose';
  if (type === 'ZIP') return 'text-accent-cyan';
  if (type === 'PPTX') return 'text-accent-cyan';
  return 'text-gray-400';
}

export default function PartnerResourcesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Marketing Resources</h1>
        <p className="text-gray-400">
          Brand assets, training guides, and technical documentation for OptiCore partners.
        </p>
      </div>

      <div className="space-y-8">
        {resources.map((section) => {
          const SectionIcon = section.icon;
          return (
            <div key={section.section} className="bg-[#16161D] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
                <SectionIcon className="w-5 h-5 text-accent-emerald" />
                <h2 className="text-lg font-bold text-white">{section.section}</h2>
              </div>
              <div className="divide-y divide-white/5">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          <span className={typeColor(item.type)}>{item.type}</span>
                          {' · '}{item.size}
                        </p>
                      </div>
                    </div>
                    <a
                      href={item.url}
                      className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-accent-cyan transition-colors"
                      title={`Download ${item.name}`}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
