'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye, EyeOff, Loader2, ArrowRight, ShieldCheck,
  Truck, Star, CheckCircle2, Mail, Lock,
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getErrorMsg } from '@/lib/utils';
import { LogoImage } from '@/components/ui/LogoImage';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
});
type FormData = z.infer<typeof schema>;

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'SSL Secured' },
  { icon: Truck,       label: '3–5 Day Delivery' },
  { icon: Star,        label: '4.9 ★ Rating' },
];

const FEATURES = [
  'Custom flyers, banners, ID cards & more',
  'eSewa, Khalti & bank transfer accepted',
  'Nationwide delivery across Nepal',
  'Free artwork check on every order',
];

export default function LoginPage() {
  const router   = useRouter();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      const { role } = res.data.data;
      await login();
      toast.success('Welcome back!');
      if (role === 'ADMIN') router.push('/admin');
      else if (role === 'VENDOR') router.push('/vendor/dashboard');
      else router.push('/dashboard');
    } catch (err: any) {
      toast.error(getErrorMsg(err, 'Invalid credentials'));
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--page-bg)]">

      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex flex-col w-[440px] xl:w-[500px] flex-shrink-0 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#3b0764 0%,#1e3a8a 55%,#0c4a6e 100%)' }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        {/* Glow blobs */}
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }} />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-12">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-14">
            <LogoImage width={130} height={44} className="h-9 w-auto brightness-0 invert" fallbackClassName="text-2xl font-black text-white" />
          </Link>

          {/* Headline */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-[11px] font-bold text-white/80 uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Orders shipping now
            </div>
            <h1 className="text-[2.6rem] xl:text-5xl font-black text-white leading-[1.05] tracking-tight mb-5">
              Nepal&apos;s #1<br />Custom Print<br />Marketplace
            </h1>
            <p className="text-white/55 text-[0.95rem] leading-relaxed mb-10">
              Design, order, and deliver premium prints — fast and easy.
            </p>

            {/* Feature checklist */}
            <div className="space-y-3">
              {FEATURES.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm text-white/70">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {[['10K+', 'Orders'], ['500+', 'Vendors'], ['3 Hr', 'Quote']].map(([n, l]) => (
              <div key={l}>
                <p className="text-2xl font-black text-white">{n}</p>
                <p className="text-[11px] text-white/45 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link href="/">
              <LogoImage width={140} height={48} className="h-10 w-auto dark:brightness-0 dark:invert" fallbackClassName="text-2xl font-black text-[var(--text-heading)]" />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-heading)] tracking-tight">Welcome back</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1.5">Sign in to your PrintCity account</p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-heading)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Link href="/forgot-password" className="text-xs text-purple-500 hover:text-purple-600 transition-colors font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm border transition-all bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-heading)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)', boxShadow: '0 4px 24px rgba(124,58,237,0.35)' }}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
              <span className="text-xs text-[var(--text-faint)]">New to PrintCity?</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            </div>

            <Link
              href="/register"
              className="flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-[var(--hover-bg)]"
              style={{ border: '1px solid var(--border-color)', color: 'var(--text-body)' }}
            >
              Create a free account
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-faint)' }}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            ))}
          </div>

          {/* Back link */}
          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-faint)' }}>
            <Link href="/" className="hover:text-[var(--text-muted)] transition-colors">← Back to Print City store</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
