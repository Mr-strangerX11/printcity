'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Loader2, User, Mail, Phone, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authApi, uploadsApi } from '@/lib/api';
import { toast } from 'sonner';
import { getErrorMsg } from '@/lib/utils';

const FIELD_CLS = 'w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all';
const FIELD_STYLE = { border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-heading)' };

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { data } = await uploadsApi.upload(file);
      const url = data.data.secure_url;
      setAvatar(url);
      await authApi.updateProfile({ avatar: url });
      await refreshUser();
      toast.success('Profile photo updated');
    } catch { toast.error('Failed to upload photo'); }
    finally { setUploadingAvatar(false); e.target.value = ''; }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSavingInfo(true);
    try {
      await authApi.updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (err: any) { toast.error(getErrorMsg(err, 'Failed to update profile')); }
    finally { setSavingInfo(false); }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) { toast.error('Fill in all password fields'); return; }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setSavingPassword(true);
    try {
      await authApi.updateProfile({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) { toast.error(getErrorMsg(err, 'Failed to change password')); }
    finally { setSavingPassword(false); }
  };

  const initials = (user?.name ?? 'U').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-heading)]">Profile</h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">Manage your personal information and password</p>
      </div>

      {/* ── Avatar ── */}
      <div className="rounded-2xl border p-6"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
        <h2 className="font-black text-[var(--text-heading)] mb-5">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {avatar ? (
              <Image src={avatar} alt={user?.name ?? 'avatar'} width={80} height={80} unoptimized
                className="w-20 h-20 rounded-2xl object-cover"
                style={{ border: '2px solid var(--border-color)' }} />
            ) : (
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                <span className="text-white text-xl font-black">{initials}</span>
              </div>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 w-8 h-8 text-white rounded-xl flex items-center justify-center disabled:opacity-60 transition-all hover:opacity-90 shadow-sm"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
              {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-semibold text-[var(--text-heading)]">{user?.name}</p>
            <p className="text-sm text-[var(--text-muted)] capitalize">{user?.role?.toLowerCase()}</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}
              className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-700 disabled:opacity-60 transition-colors">
              {uploadingAvatar ? 'Uploading…' : 'Change photo'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Personal Info ── */}
      <form onSubmit={handleSaveInfo} className="rounded-2xl border p-6 space-y-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
        <h2 className="font-black text-[var(--text-heading)]">Personal Information</h2>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Your full name" className={FIELD_CLS} style={FIELD_STYLE} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" className={FIELD_CLS} style={FIELD_STYLE} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+977 98XXXXXXXX" className={FIELD_CLS} style={FIELD_STYLE} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-[var(--text-faint)]">
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
          </p>
          <button type="submit" disabled={savingInfo}
            className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
            {savingInfo ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {savingInfo ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* ── Password Change ── */}
      <form onSubmit={handleSavePassword} className="rounded-2xl border p-6 space-y-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <h2 className="font-black text-[var(--text-heading)]">Change Password</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Leave blank to keep your current password</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password" className={FIELD_CLS} style={FIELD_STYLE} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'New Password', value: newPassword, setter: setNewPassword, placeholder: 'Min. 6 characters', match: true },
            { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, placeholder: 'Repeat new password', match: false },
          ].map(({ label, value, setter, placeholder, match }) => (
            <div key={label}>
              <label className="block text-sm font-semibold text-[var(--text-body)] mb-1.5">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                <input type="password" value={value} onChange={e => setter(e.target.value)}
                  placeholder={placeholder} className={FIELD_CLS}
                  style={{
                    ...FIELD_STYLE,
                    borderColor: !match && confirmPassword && newPassword !== confirmPassword
                      ? 'rgb(239,68,68)' : 'var(--input-border)',
                  }} />
              </div>
              {!match && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={savingPassword}
            className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {savingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
