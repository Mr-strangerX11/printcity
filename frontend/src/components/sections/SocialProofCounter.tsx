'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Package, Users, Truck, Star } from 'lucide-react';
import { useReducedMotion } from '@/hooks';

const STATS = [
  { raw: 10000, suffix: '+', label: 'Products Listed', sub: 'and growing daily', icon: Package, color: '#7C3AED', glow: 'rgba(124,58,237,0.15)' },
  { raw: 500, suffix: '+', label: 'Active Vendors', sub: 'earning weekly payouts', icon: Users, color: '#2563EB', glow: 'rgba(37,99,235,0.15)' },
  { raw: 25000, suffix: '+', label: 'Orders Delivered', sub: 'shipped nationwide', icon: Truck, color: '#06B6D4', glow: 'rgba(6,182,212,0.15)' },
  { raw: 98, suffix: '%', label: 'Satisfaction Rate', sub: 'from verified buyers', icon: Star, color: '#10B981', glow: 'rgba(16,185,129,0.15)' },
];

function useCountUp(target: number, duration = 2000, started = false) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(undefined);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, started]);

  return started ? value : 0;
}

function StatCard({ stat, index, started, reducedMotion }: { stat: typeof STATS[0]; index: number; started: boolean; reducedMotion: boolean }) {
  const count = useCountUp(stat.raw, 2200 + index * 100, started);
  const Icon = stat.icon;

  const formatted = count >= 1000
    ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`
    : count.toString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={!reducedMotion && started ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: 'easeOut' }}
      className="group relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 overflow-hidden transition-all duration-300 hover:-translate-y-2"
      style={{
        background: `radial-gradient(ellipse 120% 80% at 10% 10%, ${stat.glow} 0%, var(--card-bg) 60%)`,
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${stat.glow} 0%, transparent 70%)` }} />

      <div className="relative">
        <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl mb-5 sm:mb-6"
          style={{ background: stat.color, boxShadow: `0 8px 24px ${stat.glow}` }}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        <p className="font-black leading-none mb-2 tracking-tight tabular-nums"
          style={{ fontSize: 'clamp(2rem,4.5vw,3.5rem)', color: 'var(--text-heading)' }}>
          {formatted}{stat.suffix}
        </p>
        <p className="text-sm sm:text-base font-bold mb-1" style={{ color: 'var(--text-body)' }}>{stat.label}</p>
        <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>{stat.sub}</p>

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          initial={{ width: '0%' }}
          animate={!reducedMotion && started ? { width: '100%' } : {}}
          transition={{ duration: 1.2, delay: 0.4 + index * 0.1 }}
          style={{ background: stat.color, opacity: 0.5 }}
        />
      </div>
    </motion.div>
  );
}

export default function SocialProofCounter() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const reducedMotion = useReducedMotion();

  return (
    <section ref={ref} className="py-16 sm:py-20 relative overflow-hidden" style={{ background: 'var(--surface-alt)' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full pointer-events-none blur-[60px]"
        style={{ background: 'var(--orb-purple)' }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={!reducedMotion && inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-black text-violet-500 dark:text-violet-400 uppercase tracking-[0.28em] mb-5 px-3.5 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-violet-500"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.2, repeat: reducedMotion ? 0 : Infinity }}
            />
            By the numbers
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[3.25rem] font-black leading-tight tracking-tight"
            style={{ color: 'var(--text-heading)' }}>
            Built for <span className="shimmer-text">creators</span> who mean business.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} started={inView} reducedMotion={reducedMotion} />
          ))}
        </div>
      </div>
    </section>
  );
}
