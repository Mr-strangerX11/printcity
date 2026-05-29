'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ArrowRight } from 'lucide-react';
import { useReducedMotion } from '@/hooks';

const FAQS = [
  { q: 'How long does delivery take?', a: '3–5 business days with free tracking for all orders within Nepal. Same-day dispatch for orders placed before 12 PM.' },
  { q: 'Can I cancel my order?', a: 'Yes, up to 24 hours after placing. After that, we start production and cancellation is no longer possible.' },
  { q: "What's your refund policy?", a: 'Full refund or reprint for any quality issues. 15-day money-back guarantee if you\'re not completely satisfied.' },
  { q: 'How do I track my order?', a: 'Check your dashboard under "My Orders" or watch for SMS and email notifications with real-time tracking updates.' },
  { q: 'Can I order custom designs?', a: 'Absolutely! Use our Design Studio to upload your artwork, choose placement and size, and preview it on the product before ordering.' },
  { q: 'How do vendor payouts work?', a: 'Vendors receive weekly automated payouts to their bank account every Friday. No minimums, no delays.' },
];

export default function QuickFAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });
  const reducedMotion = useReducedMotion();

  return (
    <section ref={ref} className="py-16 sm:py-20" style={{ background: 'var(--page-bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={!reducedMotion && inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-black text-blue-500 uppercase tracking-[0.28em] mb-5 px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <HelpCircle className="w-3 h-3" /> Quick Answers
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[3.25rem] font-black leading-tight tracking-tight mb-4"
            style={{ color: 'var(--text-heading)' }}>
            Got <span className="shimmer-text">questions?</span>
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Here are the most common things people ask us.
          </p>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial="hidden"
          animate={!reducedMotion && inView ? 'visible' : 'hidden'}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
        >
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
                style={{ background: open === i ? 'var(--hover-bg)' : 'transparent' }}
                aria-expanded={open === i}
              >
                <span className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-faint)' }} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          animate={!reducedMotion && inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <Link href="/faq"
            className="inline-flex items-center gap-2 text-sm font-bold hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-muted)' }}>
            View all FAQs <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
