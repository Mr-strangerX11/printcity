'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye, EyeOff, Loader2, ArrowRight,
  Mail, Lock, User, Phone, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { getErrorMsg } from '@/lib/utils';
import { LogoImage } from '@/components/ui/LogoImage';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const INPUT_CLASS = 'w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-heading)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50';

const BRAND_PERKS = [
  { emoji: '🎨', title: 'Custom Designs', desc: 'Upload your artwork and bring it to life' },
  { emoji: '📦', title: 'Fast Delivery', desc: 'Premium prints delivered across Nepal' },
  { emoji: '💎', title: 'Earn as Vendor', desc: 'Zero upfront cost — weekly payouts' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailWarning, setEmailWarning] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'CUSTOMER',
      });

      const payload = res?.data?.data ?? res?.data ?? {};
      if (payload.emailDeliveryFailed) {
        setEmailWarning(true);
        toast.warning(
          'Account created! Verification email failed to send — use "Resend code" on the next page.',
          { duration: 6000 },
        );
      } else {
        toast.success('Account created! Check your email for the verification code.');
      }
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      toast.error(getErrorMsg(err, 'Registration failed'));
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--page-bg)]">

      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex flex-col w-[420px] xl:w-[480px] flex-shrink-0 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg,#1e0545 0%,#1a237e 55%,#0d1b4b 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 80%,#7C3AED 0%,transparent 50%), radial-gradient(circle at 80% 15%,#2563EB 0%,transparent 50%)',
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-12">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-14">
            <LogoImage width={130} height={44} className="h-9 w-auto brightness-0 invert" fallbackClassName="text-2xl font-black text-white" />
          </Link>

          {/* Headline */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-[11px] font-bold text-white/80 uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Free account — no credit card
            </div>
            <h1 className="text-[2.4rem] xl:text-5xl font-black text-white leading-[1.05] tracking-tight mb-5">
              Join thousands<br />of creators &<br />customers
            </h1>
            <p className="text-blue-200/70 text-[0.95rem] leading-relaxed mb-10">
              Access premium prints, track orders in real time, and manage your designs all in one place.
            </p>

            {/* Perks */}
            <div className="space-y-3">
              {BRAND_PERKS.map(p => (
                <div
                  key={p.title}
                  className="flex items-center gap-3 p-3.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                  <div>
                    <p className="text-white font-bold text-sm">{p.title}</p>
                    <p className="text-blue-300/70 text-xs mt-0.5">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust note */}
          <div className="flex items-center gap-2 mt-8 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-white/50 text-xs">No spam. Unsubscribe any time. Your data stays private.</p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[440px]">

          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link href="/">
              <LogoImage width={140} height={48} className="h-10 w-auto dark:brightness-0 dark:invert" fallbackClassName="text-2xl font-black text-[var(--text-heading)]" />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[11px] font-bold text-purple-500 uppercase tracking-widest">
                ✦ Free Account
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-heading)] tracking-tight">Create an account</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1.5">
              Already a member?{' '}
              <Link href="/login" className="text-purple-500 font-semibold hover:text-purple-600 transition-colors">Sign in</Link>
            </p>
          </div>

          {/* Email warning banner */}
          {emailWarning && (
            <div className="flex items-start gap-3 p-4 mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Verification email failed to send</p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                  Your account is ready. Click &quot;Resend code&quot; on the next page to get your verification OTP.
                </p>
              </div>
            </div>
          )}

          {/* Card */}
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Full name */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                  <input {...register('name')} placeholder="Jane Doe" autoComplete="name" className={INPUT_CLASS} />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                  <input {...register('email')} type="email" placeholder="you@example.com" autoComplete="email" className={INPUT_CLASS} />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                  <input {...register('phone')} type="tel" placeholder="+977 98XXXXXXXX" autoComplete="tel" className={INPUT_CLASS} />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              {/* Passwords — side by side on wider screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                    <input
                      {...register('password')}
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min. 8 chars"
                      autoComplete="new-password"
                      className={`${INPUT_CLASS} pr-11`}
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

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                    Confirm <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                    <input
                      {...register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      className={`${INPUT_CLASS} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)', boxShadow: '0 4px 24px rgba(124,58,237,0.35)' }}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-[var(--text-faint)] mt-5">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="hover:underline text-[var(--text-muted)]">Terms</Link>{' '}&amp;{' '}
            <Link href="/privacy" className="hover:underline text-[var(--text-muted)]">Privacy Policy</Link>
          </p>
          <p className="text-center text-xs mt-3" style={{ color: 'var(--text-faint)' }}>
            <Link href="/" className="hover:text-[var(--text-muted)] transition-colors">← Back to Print City store</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
