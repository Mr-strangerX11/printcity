'use client';

import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { useReducedMotion } from '@/hooks';

const STORIES = [
  { avatar: '👩‍🎨', name: 'Priya Sharma', role: 'Graphic Designer', location: 'Kathmandu', earning: 'Rs. 50,000', period: 'in 3 months', quote: 'PrintCity handles everything. I just create and earn!' },
  { avatar: '👨‍💻', name: 'Arjun Thapa', role: 'Digital Artist', location: 'Pokhara', earning: 'Rs. 85,000', period: 'in 6 months', quote: 'My designs reach customers I could never reach alone. The platform just works.' },
  { avatar: '👩‍🎤', name: 'Sita Rai', role: 'Fashion Designer', location: 'Lalitpur', earning: 'Rs. 32,000', period: 'in 2 months', quote: 'Weekly payouts mean I can plan my life. No more waiting for cheques!' },
];

export default function VendorSuccessStories() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const reducedMotion = useReducedMotion();

  return (
    <section ref={ref} className="py-16 sm:py-20" style={{ background: 'var(--surface-alt)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={!reducedMotion && inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-black text-blue-500 uppercase tracking-[0.28em] mb-4 px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <TrendingUp className="w-3 h-3" /> Vendor Stories
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-[3.25rem] font-black leading-tight tracking-tight"
              style={{ color: 'var(--text-heading)' }}>
              Real people, <span className="shimmer-text">real income</span>
            </h2>
          </div>
          <Link href="/vendors"
            className="flex items-center gap-2 text-sm font-bold flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}>
            Meet all vendors <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STORIES.map((story, i) => (
            <motion.div
              key={story.name}
              className="p-6 rounded-2xl flex flex-col gap-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}
              initial={{ opacity: 0, y: 25 }}
              animate={!reducedMotion && inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ scale: 1.02, translateY: -8, boxShadow: '0 20px 40px rgba(124,58,237,0.15)' }}
            >
              {/* Profile */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  {story.avatar}
                </div>
                <div>
                  <p className="font-black text-sm" style={{ color: 'var(--text-heading)' }}>{story.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{story.role} · {story.location}</p>
                </div>
              </div>

              {/* Quote */}
              <p className="text-sm italic leading-relaxed flex-1" style={{ color: 'var(--text-muted)' }}>
                "{story.quote}"
              </p>

              {/* Earnings */}
              <div className="pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                <motion.p
                  className="text-2xl font-black"
                  style={{ color: 'var(--text-heading)' }}
                  animate={!reducedMotion && inView ? { scale: [1, 1.04, 1] } : {}}
                  transition={{ duration: 2, delay: 0.5 + i * 0.2, repeat: reducedMotion ? 0 : Infinity, repeatDelay: 3 }}
                >
                  {story.earning}
                </motion.p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{story.period}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={!reducedMotion && inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          <Link href="/register?role=VENDOR"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-black rounded-2xl text-sm hover:opacity-95 transition-opacity">
            Start Selling Free <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs mt-3" style={{ color: 'var(--text-faint)' }}>
            Zero upfront cost · We print & ship · Weekly payouts
          </p>
        </motion.div>
      </div>
    </section>
  );
}
