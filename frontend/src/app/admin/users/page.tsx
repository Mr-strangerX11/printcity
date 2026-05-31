'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { formatDate, getErrorMsg } from '@/lib/utils';
import {
  Search, RefreshCw, UserCheck, UserX, Shield,
  Store, ShoppingBag, ChevronLeft, ChevronRight, Users, Trash2, AlertTriangle, Pencil, X, Loader2,
} from 'lucide-react';

const ROLES = ['ALL', 'CUSTOMER', 'VENDOR', 'ADMIN'];
const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  VENDOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CUSTOMER: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};
const ROLE_ICON: Record<string, React.ReactNode> = {
  ADMIN: <Shield className="w-3 h-3" />,
  VENDOR: <Store className="w-3 h-3" />,
  CUSTOMER: <ShoppingBag className="w-3 h-3" />,
};
const FIELD_CLS = 'w-full border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-heading)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', isVerified: false });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (p = page, s = search, r = roleFilter) => {
    setLoading(true);
    try {
      const params: any = { page: p };
      if (s.trim()) params.search = s.trim();
      if (r !== 'ALL') params.role = r;
      const { data } = await adminApi.listUsers(params);
      const res = data.data;
      setUsers(res.items ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { load(1, search, roleFilter); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(1, search, roleFilter); };
  const handleRoleChange = (r: string) => { setRoleFilter(r); setPage(1); load(1, search, r); };
  const handlePageChange = (p: number) => { setPage(p); load(p, search, roleFilter); };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setEditForm({ name: user.name ?? '', phone: user.phone ?? '', isVerified: user.isVerified ?? false });
  };

  const saveEdit = async () => {
    if (!editingUser || !editForm.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const uid = editingUser._id ?? editingUser.id;
      await adminApi.updateUser(uid, editForm);
      setUsers(prev => prev.map(u => (u._id ?? u.id) === uid ? { ...u, ...editForm } : u));
      toast.success('User updated');
      setEditingUser(null);
    } catch (err: any) { toast.error(getErrorMsg(err, 'Failed to update')); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (user: any) => {
    const uid = user._id ?? user.id;
    setToggling(uid);
    try {
      await adminApi.toggleUserStatus(uid, !user.isActive);
      setUsers(prev => prev.map(u => (u._id ?? u.id) === uid ? { ...u, isActive: !u.isActive } : u));
      toast.success(`${user.name} ${user.isActive ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed to update user status'); }
    finally { setToggling(null); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const uid = confirmDelete._id ?? confirmDelete.id;
    setDeleting(true);
    try {
      await adminApi.deleteUser(uid);
      setUsers(prev => prev.filter(u => (u._id ?? u.id) !== uid));
      setTotal(prev => prev - 1);
      toast.success(`${confirmDelete.name} deleted`);
      setConfirmDelete(null);
    } catch { toast.error('Failed to delete user'); }
    finally { setDeleting(false); }
  };

  return (
    <>
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-heading)]">Users</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">{total.toLocaleString()} total</p>
        </div>
        <button onClick={() => load(page, search, roleFilter)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--hover-bg)]"
          style={{ border: '1px solid var(--border-color)', color: 'var(--text-body)' }}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border p-4 flex flex-col sm:flex-row gap-3"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/25 transition-all"
            style={{ border: '1px solid var(--input-border)', background: 'var(--input-bg)', color: 'var(--text-heading)' }} />
        </form>
        <div className="flex gap-2 flex-wrap">
          {ROLES.map(r => (
            <button key={r} onClick={() => handleRoleChange(r)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={roleFilter === r
                ? { background: 'linear-gradient(135deg,#7C3AED,#2563EB)', color: '#fff' }
                : { background: 'var(--surface-alt)', color: 'var(--text-body)', border: '1px solid var(--border-color)' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-[var(--text-faint)] animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-12 h-12 text-[var(--text-faint)] mb-3 opacity-40" />
            <p className="text-[var(--text-muted)] font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--surface-alt)' }}>
                  {['User', 'Role', 'Orders', 'Joined', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-[var(--text-faint)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {users.map(user => {
                  const uid = user._id ?? user.id;
                  return (
                    <tr key={uid} className="hover:bg-[var(--hover-bg)] transition-colors">
                      <td className="px-5 py-4">
                        <button onClick={() => openEdit(user)} className="flex items-center gap-3 text-left group">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                            {user.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[var(--text-heading)] truncate group-hover:text-purple-600 transition-colors flex items-center gap-1">
                              {user.name}
                              <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-xs text-[var(--text-faint)] truncate">{user.email}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit ${ROLE_BADGE[user.role] ?? ''}`}>
                            {ROLE_ICON[user.role]}{user.role}
                          </span>
                          {user.vendor && <span className="text-xs text-[var(--text-faint)] truncate max-w-[120px]">{user.vendor.storeName}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-[var(--text-body)] font-medium">{user._count?.orders ?? 0}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm text-[var(--text-muted)]">{formatDate(user.createdAt)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {user.role !== 'ADMIN' && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                              style={{ background: 'rgba(124,58,237,0.08)', color: '#7C3AED', border: '1px solid rgba(124,58,237,0.2)' }}>
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                            <button onClick={() => toggleStatus(user)} disabled={toggling === uid}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${
                                user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}>
                              {user.isActive ? <><UserX className="w-3.5 h-3.5" /> Deactivate</> : <><UserCheck className="w-3.5 h-3.5" /> Activate</>}
                            </button>
                            <button onClick={() => setConfirmDelete(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 gap-3"
            style={{ borderTop: '1px solid var(--border-color)', background: 'var(--surface-alt)' }}>
            <p className="text-sm text-[var(--text-muted)]">Page {page} of {totalPages} · {total} users</p>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}
                className="p-2 rounded-xl hover:bg-[var(--hover-bg)] disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4 text-[var(--text-body)]" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p < 1 || p > totalPages) return null;
                return (
                  <button key={p} onClick={() => handlePageChange(p)}
                    className="w-8 h-8 rounded-xl text-sm font-semibold transition-all"
                    style={p === page
                      ? { background: 'linear-gradient(135deg,#7C3AED,#2563EB)', color: '#fff' }
                      : { color: 'var(--text-body)' }}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}
                className="p-2 rounded-xl hover:bg-[var(--hover-bg)] disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4 text-[var(--text-body)]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* ── Edit User Modal ── */}
    {editingUser && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-[var(--text-heading)] text-lg">Edit User</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{editingUser.email}</p>
            </div>
            <button onClick={() => setEditingUser(null)}
              className="p-1.5 hover:bg-[var(--hover-bg)] rounded-lg text-[var(--text-faint)]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">Full Name *</label>
              <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                className={FIELD_CLS} placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-body)] mb-1.5">Phone</label>
              <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                className={FIELD_CLS} placeholder="+977 98XXXXXXXX" />
            </div>
            <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-[var(--hover-bg)] transition-colors"
              style={{ border: '1px solid var(--border-color)' }}>
              <input type="checkbox" checked={editForm.isVerified}
                onChange={e => setEditForm(p => ({ ...p, isVerified: e.target.checked }))}
                className="w-4 h-4 accent-purple-600" />
              <div>
                <p className="text-sm font-semibold text-[var(--text-heading)]">Email Verified</p>
                <p className="text-xs text-[var(--text-muted)]">Toggle to manually verify / unverify email</p>
              </div>
            </label>
            <div className="p-3 rounded-xl" style={{ background: 'var(--surface-alt)', border: '1px solid var(--border-color)' }}>
              <p className="text-xs font-bold text-[var(--text-faint)] uppercase tracking-wider mb-1.5">Read-only</p>
              <p className="text-xs text-[var(--text-muted)]"><span className="font-semibold">Role:</span> {editingUser.role}</p>
              <p className="text-xs text-[var(--text-muted)]"><span className="font-semibold">Status:</span> {editingUser.isActive ? 'Active' : 'Inactive'} (use Activate/Deactivate button)</p>
              <p className="text-xs text-[var(--text-muted)]"><span className="font-semibold">Joined:</span> {formatDate(editingUser.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setEditingUser(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-body)] hover:bg-[var(--hover-bg)] transition-colors"
              style={{ border: '1px solid var(--border-color)' }}>
              Cancel
            </button>
            <button onClick={saveEdit} disabled={saving}
              className="flex-1 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── Delete Confirm Modal ── */}
    {confirmDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="rounded-2xl shadow-2xl w-full max-w-sm p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-black text-[var(--text-heading)]">Delete User</h3>
              <p className="text-xs text-[var(--text-muted)]">Cannot be undone</p>
            </div>
          </div>
          <p className="text-sm text-[var(--text-body)] mb-6">
            Permanently delete{' '}
            <span className="font-bold text-[var(--text-heading)]">{confirmDelete.name}</span>{' '}
            ({confirmDelete.email})?
          </p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(null)} disabled={deleting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-body)] hover:bg-[var(--hover-bg)] disabled:opacity-50 transition-colors"
              style={{ border: '1px solid var(--border-color)' }}>
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
