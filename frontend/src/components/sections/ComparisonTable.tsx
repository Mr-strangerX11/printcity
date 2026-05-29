'use client';

import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { CheckCircle, MinusCircle, ArrowRight } from 'lucide-react';
import { useReducedMotion } from '@/hooks';

const ROWS = [
  { feature: 'Print Quality', us: 'DTG Premium — vibrant, wash-resistant', them: 'Standard offset or screen-print' },
  { feature: 'Min. Order', us: 'Just 1 piece — no minimums', them: '5–50 pieces minimum' },
  { feature: 'Delivery Time', us: '3–5 business days', them: '7–14 days' },
  { feature: 'Design Studio', us: 'Live preview with real mockups', them: 'Static image upload only' },
  { feature: 'Vendor Payouts', us: 'Weekly automated payouts', them: 'Monthly or manual' },
  { feature: 'Custom Packaging', us: 'Available on bulk orders', them: 'Rarely offered' },
  { feature: 'Support', us: '24/7 live chat + ticketing', them: 'Email only, slow response' },
];

export default function ComparisonTable() {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });
  const reducedMotion = useReducedMotion();

  return (
    <section ref={ref} className="py-16 sm:py-20" style={{ background: 'var(--page-bg)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={!reducedMotion && inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-black text-emerald-500 uppercase tracking-[0.28em] mb-5 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Why PrintCity?
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[3.25rem] font-black leading-tight tracking-tight mb-4"
            style={{ color: 'var(--text-heading)' }}>
            How we <span className="shimmer-text">compare</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            See why 10,000+ creators choose PrintCity over the rest.
          </p>
        </motion.div>

        <motion.div
          className="rounded-3xl overflow-hidden"
          style={{ border: '1px solid var(--border-color)' }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={!reducedMotion && inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr] bg-gradient-to-r from-violet-600 to-blue-600 text-white">
            <div className="p-4 sm:p-5 text-sm font-black">Feature</div>
            <div className="p-4 sm:p-5 text-sm font-black text-center border-l border-white/20 bg-white/10">
              ✨ PrintCity
            </div>
            <div className="p-4 sm:p-5 text-sm font-black text-center border-l border-white/20 opacity-70">
              Others
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y" style={{ '--tw-divide-opacity': 1, borderColor: 'var(--border-color)' } as React.CSSProperties}>
            {ROWS.map((row, i) => (
              <motion.div
                key={row.feature}
                className="grid grid-cols-[1fr_1fr_1fr] hover:bg-opacity-50 transition-colors"
                style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--page-bg)' }}
                initial={{ opacity: 0, x: -15 }}
                animate={!reducedMotion && inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
                whileHover={{ backgroundColor: 'var(--hover-bg)' }}
              >
                <div className="p-4 text-sm font-semibold" style={{ color: 'var(--text-body)' }}>
                  {row.feature}
                </div>
                <div className="p-4 border-l" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{row.us}</span>
                  </div>
                </div>
                <div className="p-4 border-l" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-start gap-2">
                    <MinusCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{row.them}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 15 }}
          animate={!reducedMotion && inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Link href="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-black rounded-2xl text-sm hover:opacity-95 transition-opacity">
            Start Printing Now <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
