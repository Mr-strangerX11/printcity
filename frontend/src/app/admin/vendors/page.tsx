'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, DollarSign, Plus, X, Loader2, Pencil, Store } from 'lucide-react';
import { vendorsApi, authApi } from '@/lib/api';
import { useVendors } from '@/hooks';
import { formatDate, getErrorMsg } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';

const emptyVendorForm = { name: '', email: '', password: '', storeName: '' };

const FIELD_CLS = 'w-full border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-heading)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/25';

function AdminVendorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status') ?? '';
  const { data: rawVendors, loading, refetch } = useVendors({ status: status || undefined });
  const vendors = rawVendors ?? [];

  const [editingCommission, setEditingCommission] = useState<{ id: string; rate: number } | null>(null);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [vendorForm, setVendorForm] = useState({ ...emptyVendorForm });
  const [creating, setCreating] = useState(false);

  // Edit details state
  const [editingVendor, setEditingVendor] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ storeName: '', description: '', logo: '', banner: '' });
  const [saving, setSaving] = useState(false);

  const openEdit = (v: any) => {
    setEditingVendor(v);
    setEditForm({
      storeName: v.storeName ?? '',
      description: v.description ?? '',
      logo: v.logo ?? '',
      banner: v.banner ?? '',
    });
  };

  const saveEdit = async () => {
    if (!editingVendor) return;
    if (!editForm.storeName.trim()) { toast.error('Store name is required'); return; }
    setSaving(true);
    try {
      await vendorsApi.updateDetails(editingVendor.id, editForm);
      toast.success('Vendor details updated');
      setEditingVendor(null);
      refetch();
    } catch (err: any) {
      toast.error(getErrorMsg(err, 'Failed to update'));
    } finally { setSaving(false); }
  };

  const approve = async (id: string) => {
    try { await vendorsApi.updateStatus(id, 'ACTIVE'); toast.success('Vendor approved!'); refetch(); }
    catch { toast.error('Failed'); }
  };

  const suspend = async (id: string) => {
    try { await vendorsApi.updateStatus(id, 'SUSPENDED'); toast.success('Vendor suspended'); refetch(); }
    catch { toast.error('Failed'); }
  };

  const updateCommission = async (id: string, rate: number) => {
    try {
      await vendorsApi.updateCommission(id, rate / 100);
      toast.success('Commission updated');
      setEditingCommission(null);
      refetch();
    } catch { toast.error('Failed'); }
  };

  const createVendor = async () => {
    if (!vendorForm.name || !vendorForm.email || !vendorForm.password || !vendorForm.storeName) {
      toast.error('All fields are required'); return;
    }
    setCreating(true);
    try {
      await authApi.createVendor(vendorForm);
      toast.success('Vendor account created!');
      setShowAddVendor(false);
      setVendorForm({ ...emptyVendorForm });
      refetch();
    } catch (err: any) {
      toast.error(getErrorMsg(err, 'Failed to create vendor'));
    } finally { setCreating(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[var(--text-heading)]">Vendors</h1>
        <button onClick={() => setShowAddVendor(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white rounded-xl px-4 py-2 hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
          <Plus className="w-4 h-4" /> Add Vendor
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', 'PENDING', 'ACTIVE', 'SUSPENDED'].map(s => (
          <button key={s} onClick={() => router.push(`/admin/vendors${s ? `?status=${s}` : ''}`)}
            className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
            style={status === s
              ? { background: 'linear-gradient(135deg,#7C3AED,#2563EB)', color: '#fff' }
              : { background: 'var(--surface)', border: '1px solid var(--border-color)', color: 'var(--text-body)' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--surface-alt)' }}>
                {['Store', 'Owner', 'Products', 'Commission', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wide
                    first:table-cell [&:nth-child(2)]:hidden [&:nth-child(2)]:md:table-cell
                    [&:nth-child(3)]:hidden [&:nth-child(3)]:sm:table-cell
                    [&:nth-child(4)]:hidden [&:nth-child(4)]:sm:table-cell
                    [&:nth-child(6)]:hidden [&:nth-child(6)]:lg:table-cell">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-4 rounded skeleton" /></td></tr>
                ))
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Store className="w-10 h-10 mx-auto mb-3 text-[var(--text-faint)] opacity-40" />
                    <p className="text-[var(--text-muted)] text-sm">No vendors found</p>
                  </td>
                </tr>
              ) : vendors.map((v: any) => (
                <tr key={v.id} className="hover:bg-[var(--hover-bg)] transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(v)}
                      className="text-left group">
                      <p className="font-semibold text-[var(--text-heading)] text-sm group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
                        {v.storeName}
                        <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-xs text-[var(--text-faint)]">{v.storeSlug}</p>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-body)] hidden md:table-cell">{v.user?.email}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-body)] hidden sm:table-cell">{v._count?.products ?? 0}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {editingCommission?.id === v.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" min="1" max="50" value={editingCommission.rate}
                          onChange={e => setEditingCommission({ id: v.id, rate: Number(e.target.value) })}
                          className="w-16 px-2 py-1 rounded-lg text-sm"
                          style={{ border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-heading)' }} />
                        <span className="text-xs text-[var(--text-faint)]">%</span>
                        <button onClick={() => updateCommission(v.id, editingCommission.rate)} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingCommission(null)} className="p-1 text-[var(--text-faint)] hover:bg-[var(--hover-bg)] rounded">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingCommission({ id: v.id, rate: (v.commissionRate * 100) })}
                        className="flex items-center gap-1 text-sm font-semibold text-[var(--text-body)] hover:text-purple-600 transition-colors">
                        <DollarSign className="w-3.5 h-3.5" />
                        {(v.commissionRate * 100).toFixed(0)}%
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} type="vendor" /></td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)] hidden lg:table-cell">{formatDate(v.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(v)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                        style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}>
                        Edit
                      </button>
                      {v.status === 'PENDING' && (
                        <button onClick={() => approve(v.id)}
                          className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded-lg hover:bg-green-100 transition-colors">
                          Approve
                        </button>
                      )}
                      {v.status === 'ACTIVE' && (
                        <button onClick={() => suspend(v.id)}
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                          Suspend
                        </button>
                      )}
                      {v.status === 'SUSPENDED' && (
                        <button onClick={() => approve(v.id)}
                          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                          Reinstate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Vendor Modal ── */}
      {editingVendor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="rounded-2xl p-6 w-full max-w-lg space-y-5 shadow-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-[var(--text-heading)] text-lg">Edit Vendor</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{editingVendor.storeSlug}</p>
              </div>
              <button onClick={() => setEditingVendor(null)}
                className="p-1.5 hover:bg-[var(--hover-bg)] rounded-lg text-[var(--text-faint)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">Store Name *</label>
                <input value={editForm.storeName}
                  onChange={e => setEditForm(p => ({ ...p, storeName: e.target.value }))}
                  placeholder="Store name"
                  className={FIELD_CLS} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">Description</label>
                <textarea value={editForm.description}
                  onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Store description (shown on store page)"
                  rows={3}
                  className={`${FIELD_CLS} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">Logo URL</label>
                <input value={editForm.logo}
                  onChange={e => setEditForm(p => ({ ...p, logo: e.target.value }))}
                  placeholder="https://res.cloudinary.com/..."
                  className={FIELD_CLS} />
                {editForm.logo && (
                  <Image src={editForm.logo} alt="logo preview" width={48} height={48} unoptimized
                    className="mt-2 h-12 w-12 rounded-xl object-cover border border-[var(--border-color)]" />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">Banner URL</label>
                <input value={editForm.banner}
                  onChange={e => setEditForm(p => ({ ...p, banner: e.target.value }))}
                  placeholder="https://res.cloudinary.com/..."
                  className={FIELD_CLS} />
              </div>
            </div>

            {/* Summary of other fields (read-only) */}
            <div className="p-3 rounded-xl space-y-1.5"
              style={{ background: 'var(--surface-alt)', border: '1px solid var(--border-color)' }}>
              <p className="text-xs font-bold text-[var(--text-faint)] uppercase tracking-wider mb-2">Read-only info</p>
              <p className="text-xs text-[var(--text-muted)]"><span className="font-semibold">Owner:</span> {editingVendor.user?.name} ({editingVendor.user?.email})</p>
              <p className="text-xs text-[var(--text-muted)]"><span className="font-semibold">Commission:</span> {(editingVendor.commissionRate * 100).toFixed(0)}% (edit in table)</p>
              <p className="text-xs text-[var(--text-muted)]"><span className="font-semibold">Status:</span> {editingVendor.status} (use Approve/Suspend buttons)</p>
              <p className="text-xs text-[var(--text-muted)]"><span className="font-semibold">Products:</span> {editingVendor._count?.products ?? 0}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditingVendor(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-body)] hover:bg-[var(--hover-bg)] transition-colors"
                style={{ border: '1px solid var(--border-color)' }}>
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Vendor Modal ── */}
      {showAddVendor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[var(--text-heading)] text-lg">Add Vendor</h3>
              <button onClick={() => { setShowAddVendor(false); setVendorForm({ ...emptyVendorForm }); }}
                className="p-1.5 hover:bg-[var(--hover-bg)] rounded-lg text-[var(--text-faint)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Jane Doe' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'vendor@example.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: 'Min. 8 characters' },
                { label: 'Store Name', key: 'storeName', type: 'text', placeholder: "Jane's Print Studio" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">{label} *</label>
                  <input type={type} placeholder={placeholder}
                    value={(vendorForm as any)[key]}
                    onChange={e => setVendorForm(p => ({ ...p, [key]: e.target.value }))}
                    className={FIELD_CLS} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setShowAddVendor(false); setVendorForm({ ...emptyVendorForm }); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-body)] hover:bg-[var(--hover-bg)] transition-colors"
                style={{ border: '1px solid var(--border-color)' }}>
                Cancel
              </button>
              <button onClick={createVendor} disabled={creating}
                className="flex-1 px-4 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                {creating ? 'Creating…' : 'Create Vendor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AdminVendorsContent />
    </Suspense>
  );
}
