'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { NEOVOLT_BATTERIES, SYSTEM_PRESETS } from '@/data/neovolt-products';

const FEATURED_PRODUCTS = [
  {
    category: 'Inverters',
    items: [
      { name: 'Single-Phase Hybrid', output: '3.68–8.0 kVA', desc: 'Ideal for residential homes with backup', sku: 'BW-INV-SPH5K', icon: 'Zap' },
      { name: 'Three-Phase Hybrid', output: '4.0–15.0 kVA', desc: 'For commercial and industrial use', sku: 'BW-INV-TPH10K', icon: 'Zap' },
    ],
  },
  {
    category: 'Batteries',
    items: NEOVOLT_BATTERIES.slice(0, 2).map((b) => ({
      name: b.sku,
      output: b.usable,
      desc: `${b.chemistry} · ${b.cycles} cycles · ${b.warranty}`,
      sku: b.sku,
      icon: 'Battery',
    })),
  },
  {
    category: 'System Presets',
    items: SYSTEM_PRESETS.slice(0, 2).map((p) => ({
      name: p.name,
      output: p.storage,
      desc: p.desc,
      sku: `${p.inverter} + ${p.battery}`,
      icon: 'Package',
    })),
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export function FeaturedProducts() {
  const t = useTranslations('products');

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground-950 mb-4">
            Featured Products
          </h2>
          <p className="text-foreground-600 max-w-2xl mx-auto">
            IEC-certified Neovolt ESS systems by Bytewatt — engineered for Philippine conditions
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {FEATURED_PRODUCTS.map((group) => (
            <motion.div key={group.category} variants={itemVariants} className="space-y-4">
              <h3 className="text-xs font-semibold text-foreground-500 uppercase tracking-widest font-mono px-1">
                {group.category}
              </h3>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div
                    key={item.name}
                    className="bento-card group cursor-default hover:bg-background-100/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-[10px] font-mono text-primary-500 font-medium">{item.sku}</p>
                    </div>
                    <p className="text-lg font-bold text-foreground-950 mb-1">{item.name}</p>
                    <p className="text-sm text-foreground-600 mb-2">{item.output}</p>
                    <p className="text-xs text-foreground-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 text-center"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-background-100/40 border border-foreground-950/10 text-foreground-950 font-semibold hover:bg-background-200 transition-all group"
          >
            {t('viewAll')}
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
