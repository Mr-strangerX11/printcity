'use client';

import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Gift, ArrowRight } from 'lucide-react';
import { useReducedMotion } from '@/hooks';

const REWARDS = [
  { emoji: '💰', text: '1 rupee spent = 1 loyalty point' },
  { emoji: '🔗', text: 'Referral rewards: Rs. 100 per friend' },
  { emoji: '🎂', text: 'Birthday bonus: 50 extra points' },
  { emoji: '⭐', text: 'Review submission: 10 points' },
];

const TIERS = [
  { name: 'Bronze', icon: '🥉', min: '0', benefit: 'Basic perks' },
  { name: 'Silver', icon: '🥈', min: '1,000', benefit: '5% discount' },
  { name: 'Gold', icon: '🥇', min: '5,000', benefit: '10% + free shipping' },
  { name: 'Platinum', icon: '💎', min: '10,000', benefit: 'All perks + priority' },
];

export default function LoyaltyRewardsSection() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const reducedMotion = useReducedMotion();

  return (
    <section ref={ref} className="py-16 sm:py-20 relative overflow-hidden" style={{ background: 'var(--page-bg)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'var(--orb-purple)', opacity: 0.12 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: reducedMotion ? 0 : Infinity }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={!reducedMotion && inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="inline-flex items-center gap-2 text-[11px] font-black text-purple-500 uppercase tracking-[0.28em] mb-5 px-3.5 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full"
          >
            <Gift className="w-3 h-3" /> Loyalty Program
          </motion.span>
          <h2 className="text-3xl sm:text-4xl md:text-[3.25rem] font-black leading-tight tracking-tight mb-4"
            style={{ color: 'var(--text-heading)' }}>
            Earn Points, Get <span className="shimmer-text">Rewards</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Every purchase brings you closer to amazing rewards. Join thousands of loyal customers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: How to earn */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={!reducedMotion && inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl p-8"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}
          >
            <h3 className="text-xl font-black mb-6" style={{ color: 'var(--text-heading)' }}>How to Earn Points</h3>
            <div className="space-y-3">
              {REWARDS.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--hover-bg)' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={!reducedMotion && inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                  whileHover={{ x: 6 }}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-body)' }}>{item.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={!reducedMotion && inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
            >
              <Link href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-2xl text-sm hover:opacity-90 transition-opacity">
                Start Earning Rewards <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Tier system */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={!reducedMotion && inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-black mb-6" style={{ color: 'var(--text-heading)' }}>Loyalty Tiers</h3>
            <div className="space-y-3">
              {TIERS.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={!reducedMotion && inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  whileHover={{ scale: 1.02, translateY: -2 }}
                >
                  <span className="text-3xl">{tier.icon}</span>
                  <div className="flex-1">
                    <p className="font-black text-sm" style={{ color: 'var(--text-heading)' }}>{tier.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>from {tier.min} pts</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--hover-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    {tier.benefit}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
