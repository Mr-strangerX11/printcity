'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Printer, CheckCircle2, ArrowRight } from 'lucide-react';
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

const FEATURES = [
  'Custom flyers, banners, ID cards & more',
  'eSewa, Khalti & bank transfer accepted',
  'Nationwide delivery across Nepal',
  'Free artwork check on every order',
];

export default function LoginPage() {
  const router = useRouter();
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
    <div className="min-h-screen flex">

      {/* ── Left — brand panel ── */}
      <div className="hidden lg:flex flex-col w-[480px] flex-shrink-0 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#4C1D95 0%,#1e3a8a 50%,#0c4a6e 100%)' }}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-16">
            <LogoImage width={120} height={40} className="h-9 w-auto brightness-0 invert" fallbackClassName="text-2xl font-black text-white" />
          </Link>

          {/* Tagline */}
          <div className="flex-1">
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Nepal&apos;s<br />Premier Print<br />Marketplace
            </h1>
            <p className="text-white/60 text-base mb-10">
              Design, order, and deliver custom prints — fast and easy.
            </p>

            {/* Feature list */}
            <div className="space-y-3">
              {FEATURES.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  </div>
                  <span className="text-sm text-white/75">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stat */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
            {[['10K+','Orders'], ['500+','Clients'], ['3 Hrs','Quote']].map(([n, l]) => (
              <div key={l}>
                <p className="text-2xl font-black text-white">{n}</p>
                <p className="text-xs text-white/50">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10" style={{ background: 'var(--page-bg)' }}>
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link href="/">
              <LogoImage width={140} height={48} className="h-10 w-auto dark:brightness-0 dark:invert" fallbackClassName="text-2xl font-black text-[var(--text-heading)]" />
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-[var(--text-heading)]">Welcome back</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Sign in to your PrintCity account</p>
          </div>

          <div className="rounded-2xl p-6 sm:p-8 space-y-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm border transition-all bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-heading)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Link href="/forgot-password" className="text-xs text-purple-500 hover:text-purple-600 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 pr-11 py-2.5 rounded-xl text-sm border transition-all bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-heading)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-[var(--text-muted)]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
                Sign up free
              </Link>
            </p>
          </div>

          {/* Back to store */}
          <p className="text-center text-xs text-[var(--text-faint)] mt-6">
            <Link href="/" className="hover:text-[var(--text-muted)] transition-colors">
              ← Back to Print City store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
