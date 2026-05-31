'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Loader2, Camera, Store, FileImage, AlignLeft } from 'lucide-react';
import { vendorsApi, uploadsApi } from '@/lib/api';
import { toast } from 'sonner';
import { getErrorMsg } from '@/lib/utils';

const FIELD_CLS = 'w-full border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-heading)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all placeholder:text-[var(--text-faint)]';

export default function VendorSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    storeName: '',
    description: '',
    logo: '',
    banner: '',
  });

  useEffect(() => {
    vendorsApi.getProfile()
      .then(({ data }) => {
        const v = data.data;
        setForm({
          storeName: v.storeName ?? '',
          description: v.description ?? '',
          logo: v.logo ?? '',
          banner: v.banner ?? '',
        });
      })
      .catch(() => toast.error('Failed to load store settings'))
      .finally(() => setLoading(false));
  }, []);

  const uploadImage = async (
    file: File,
    field: 'logo' | 'banner',
    setUploading: (v: boolean) => void,
  ) => {
    setUploading(true);
    try {
      const { data } = await uploadsApi.upload(file);
      const url = data.data.secure_url;
      setForm(p => ({ ...p, [field]: url }));
      toast.success(`${field === 'logo' ? 'Logo' : 'Banner'} uploaded`);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.storeName.trim()) { toast.error('Store name is required'); return; }
    setSaving(true);
    try {
      await vendorsApi.updateProfile(form);
      toast.success('Store settings saved');
    } catch (err: any) { toast.error(getErrorMsg(err, 'Failed to save')); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="space-y-4 max-w-2xl">
      {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-heading)]">Store Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Update your store profile visible to customers</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* Store Name */}
        <div className="rounded-2xl border p-5 space-y-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-purple-500" />
            <h2 className="font-bold text-sm text-[var(--text-heading)]">Basic Info</h2>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">Store Name *</label>
            <input value={form.storeName}
              onChange={e => setForm(p => ({ ...p, storeName: e.target.value }))}
              placeholder="My Print Studio"
              className={FIELD_CLS} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">
              <span className="flex items-center gap-1.5"><AlignLeft className="w-3.5 h-3.5" /> Description</span>
            </label>
            <textarea value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Tell customers about your store, what you offer, and why they should buy from you…"
              rows={4}
              className={`${FIELD_CLS} resize-none`} />
          </div>
        </div>

        {/* Logo */}
        <div className="rounded-2xl border p-5 space-y-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Camera className="w-4 h-4 text-purple-500" />
            <h2 className="font-bold text-sm text-[var(--text-heading)]">Store Logo</h2>
          </div>
          <div className="flex items-start gap-4">
            {/* Preview */}
            <div className="w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center"
              style={{ background: 'var(--surface-alt)', border: '2px dashed var(--border-color)' }}>
              {form.logo ? (
                <Image src={form.logo} alt="logo" width={80} height={80} unoptimized className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-[var(--text-faint)]" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input value={form.logo} onChange={e => setForm(p => ({ ...p, logo: e.target.value }))}
                placeholder="Paste image URL or upload below"
                className={FIELD_CLS} />
              <input ref={logoRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'logo', setUploadingLogo); e.target.value = ''; }} />
              <button type="button" onClick={() => logoRef.current?.click()} disabled={uploadingLogo}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 hover:opacity-90"
                style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}>
                {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {uploadingLogo ? 'Uploading…' : 'Upload from device'}
              </button>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="rounded-2xl border p-5 space-y-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-1">
            <FileImage className="w-4 h-4 text-purple-500" />
            <h2 className="font-bold text-sm text-[var(--text-heading)]">Store Banner</h2>
          </div>
          {form.banner && (
            <div className="w-full h-28 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
              <Image src={form.banner} alt="banner" width={800} height={112} unoptimized className="w-full h-full object-cover" />
            </div>
          )}
          <input value={form.banner} onChange={e => setForm(p => ({ ...p, banner: e.target.value }))}
            placeholder="Paste banner image URL or upload below"
            className={FIELD_CLS} />
          <input ref={bannerRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'banner', setUploadingBanner); e.target.value = ''; }} />
          <button type="button" onClick={() => bannerRef.current?.click()} disabled={uploadingBanner}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 hover:opacity-90"
            style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}>
            {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileImage className="w-4 h-4" />}
            {uploadingBanner ? 'Uploading…' : 'Upload banner'}
          </button>
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-3.5 text-white font-bold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
