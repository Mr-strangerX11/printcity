'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, KeyRound, Eye, EyeOff, CheckCircle2, Printer } from 'lucide-react';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { getErrorMsg } from '@/lib/utils';

const FIELD_CLASS = 'w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all';
const FIELD_STYLE = { border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-heading)' };

type Step = 'email' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      toast.success('Reset code sent — check your inbox');
      setStep('reset');
    } catch (err: any) {
      toast.error(getErrorMsg(err, 'Failed to send reset code'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(email, otp.trim(), newPassword);
      setStep('done');
    } catch (err: any) {
      toast.error(getErrorMsg(err, 'Invalid or expired code'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--page-bg)' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
            <Printer className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-lg text-[var(--text-heading)]">Print City</span>
        </div>

        <div className="rounded-2xl border p-8"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>

          {/* ── Step 1: Enter email ── */}
          {step === 'email' && (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(124,58,237,0.1)' }}>
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <h1 className="text-2xl font-black text-[var(--text-heading)]">Forgot password?</h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Enter your email and we'll send a 6-digit reset code.
                </p>
              </div>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">Email address</label>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={FIELD_CLASS} style={FIELD_STYLE}
                  />
                </div>
                <button type="submit" disabled={loading || !email.trim()}
                  className="w-full py-3 text-white font-bold rounded-xl disabled:opacity-60 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Sending…' : 'Send reset code'}
                </button>
              </form>
            </>
          )}

          {/* ── Step 2: Enter OTP + new password ── */}
          {step === 'reset' && (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(124,58,237,0.1)' }}>
                  <KeyRound className="w-6 h-6 text-purple-600" />
                </div>
                <h1 className="text-2xl font-black text-[var(--text-heading)]">Enter reset code</h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  We sent a 6-digit code to <strong className="text-[var(--text-body)]">{email}</strong>
                </p>
              </div>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">6-digit code</label>
                  <input
                    type="text" inputMode="numeric" maxLength={6} required
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className={`${FIELD_CLASS} font-mono tracking-[0.4em] text-center text-lg`}
                    style={FIELD_STYLE}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'} required minLength={8}
                      value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className={`${FIELD_CLASS} pr-12`} style={FIELD_STYLE}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">Confirm password</label>
                  <input
                    type={showPass ? 'text' : 'password'} required
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className={FIELD_CLASS} style={FIELD_STYLE}
                  />
                </div>
                <button type="submit" disabled={loading || otp.length < 6 || !newPassword}
                  className="w-full py-3 text-white font-bold rounded-xl disabled:opacity-60 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
                <button type="button" onClick={() => setStep('email')}
                  className="w-full text-sm text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors text-center">
                  ← Use a different email
                </button>
              </form>
            </>
          )}

          {/* ── Step 3: Done ── */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(34,197,94,0.1)' }}>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text-heading)] mb-2">Password reset!</h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">You can now sign in with your new password.</p>
              <button onClick={() => router.push('/login')}
                className="w-full py-3 text-white font-bold rounded-xl hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                Go to Login
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-[var(--text-faint)] mt-6">
          Remember your password?{' '}
          <Link href="/login" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
