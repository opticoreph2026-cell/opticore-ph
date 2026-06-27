'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

export function FAQ() {
  const locale = useLocale();
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/faq?locale=${locale}`)
      .then((r) => r.json())
      .then((res) => {
        setItems(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locale]);

  const categories = items.reduce<string[]>((acc, item) => {
    if (item.category && !acc.includes(item.category)) {
      acc.push(item.category);
    }
    return acc;
  }, []);

  const grouped = categories.length > 0
    ? categories.map((cat) => ({
        category: cat,
        items: items.filter((i) => i.category === cat),
      }))
    : [{ category: null, items }];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground-950 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-foreground-600">
            Everything you need to know about solar with OptiCore
          </p>
        </motion.div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bento-card h-16 animate-pulse bg-background-100/20" />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="bento-card p-8 text-center">
            <p className="text-foreground-500">No FAQs available yet. Check back soon!</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-8">
            {grouped.map((group) => (
              <div key={group.category || 'uncategorized'}>
                {group.category && (
                  <h3 className="text-xs font-semibold text-foreground-500 uppercase tracking-widest font-mono mb-4 px-1">
                    {group.category}
                  </h3>
                )}
                <div className="space-y-2">
                  {group.items.map((item, index) => {
                    const isOpen = openId === item.id;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <button
                          onClick={() => setOpenId(isOpen ? null : item.id)}
                          className="w-full bento-card text-left hover:bg-background-100/20 transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-foreground-950 group-hover:text-primary-500 transition-colors">
                              {item.question}
                            </span>
                            <ChevronDown
                              className={`w-5 h-5 text-foreground-400 flex-shrink-0 transition-transform duration-300 ${
                                isOpen ? 'rotate-180 text-primary-500' : ''
                              }`}
                            />
                          </div>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <p className="text-sm text-foreground-600 leading-relaxed mt-4 pt-4 border-t border-foreground-950/10">
                                  {item.answer}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
