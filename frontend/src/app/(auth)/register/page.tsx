'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Printer, Sparkles } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getErrorMsg } from '@/lib/utils';

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

const FIELD_CLASS = 'w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all';
const FIELD_STYLE = { border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-heading)' };

export default function RegisterPage() {
  const router = useRouter();
  useAuth();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'CUSTOMER',
      });
      toast.success('Account created! Check your email for the verification code.');
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      toast.error(getErrorMsg(err, 'Registration failed'));
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--page-bg)' }}>

      {/* ── Brand panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#1e0545 0%,#1a237e 50%,#0d1b4b 100%)' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%,#7C3AED 0%,transparent 50%), radial-gradient(circle at 80% 20%,#2563EB 0%,transparent 50%)' }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
              <Printer className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">Print City</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Join thousands of<br />creators & customers
          </h2>
          <p className="text-blue-200 text-base leading-relaxed">
            Get access to premium print products, track orders in real time, and manage your designs all in one place.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            { icon: '🎨', title: 'Custom Designs', desc: 'Upload and sell your artwork' },
            { icon: '📦', title: 'Fast Delivery', desc: 'Orders delivered across Nepal' },
            { icon: '💎', title: 'Premium Quality', desc: 'Professional-grade print products' },
          ].map(f => (
            <div key={f.title} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-white font-bold text-sm">{f.title}</p>
                <p className="text-blue-300 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md mx-auto">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
              <Printer className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg text-[var(--text-heading)]">Print City</span>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Free Account</span>
            </div>
            <h1 className="text-3xl font-black text-[var(--text-heading)]">Create an account</h1>
            <p className="text-[var(--text-muted)] mt-1.5">Already a member?{' '}
              <Link href="/login" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">Full Name</label>
              <input {...register('name')} placeholder="Jane Doe" className={FIELD_CLASS} style={FIELD_STYLE} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className={FIELD_CLASS} style={FIELD_STYLE} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">Phone Number</label>
              <input {...register('phone')} type="tel" placeholder="+977 98XXXXXXXX" className={FIELD_CLASS} style={FIELD_STYLE} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                  className={`${FIELD_CLASS} pr-12`} style={FIELD_STYLE} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">Confirm Password</label>
              <div className="relative">
                <input {...register('confirmPassword')} type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password"
                  className={`${FIELD_CLASS} pr-12`} style={FIELD_STYLE} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3.5 text-white font-bold rounded-xl disabled:opacity-60 transition-all hover:opacity-90 flex items-center justify-center gap-2 mt-2 shadow-md"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--text-faint)] mt-6">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="hover:underline text-[var(--text-muted)]">Terms</Link> &{' '}
            <Link href="/privacy" className="hover:underline text-[var(--text-muted)]">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
