const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('c:/Users/juliu/Documents/AI Automations/Latest/opticore/src/components/dashboard/ApplianceCatalogClient.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Replace cyan and blue colors with brand (amber) variants
content = content.replace(/cyan-500/g, 'brand-500');
content = content.replace(/cyan-400/g, 'brand-400');
content = content.replace(/cyan-800/g, 'brand-800');
content = content.replace(/cyan-900/g, 'brand-900');
content = content.replace(/cyan-950/g, 'brand-950');

content = content.replace(/blue-500/g, 'brand-500');
content = content.replace(/blue-600/g, 'brand-600');
content = content.replace(/blue-400/g, 'brand-400');

// Replace slate background and borders with surface variants
content = content.replace(/slate-950/g, 'surface-950');
content = content.replace(/slate-900/g, 'surface-900');
content = content.replace(/slate-800/g, 'surface-800');
content = content.replace(/slate-700/g, 'surface-700');
content = content.replace(/slate-600/g, 'surface-600');

// For text colors, we map to semantic text utilities
content = content.replace(/text-slate-500/g, 'text-text-muted');
content = content.replace(/text-slate-400/g, 'text-text-secondary');
content = content.replace(/text-slate-300/g, 'text-text-secondary hover:text-text-primary');
content = content.replace(/text-slate-100/g, 'text-text-primary');

// Any border-slate-* that didn't match surface might just need to be white/[0.05] or something
content = content.replace(/border-slate-800/g, 'border-white/[0.06]');
content = content.replace(/border-slate-700/g, 'border-white/[0.06]');
content = content.replace(/bg-slate-800/g, 'bg-surface-800');

// Fix the RGB colors in box shadow strings that were cyan-like
content = content.replace(/rgba\(6,182,212/g, 'rgba(245,158,11'); // brand-500 amber
content = content.replace(/rgba\(8,145,178/g, 'rgba(217,119,6'); // brand-600 amber

fs.writeFileSync(targetFile, content);
console.log('ApplianceCatalogClient.tsx text colors refactored.');
