'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { productsApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useProducts, useCategories, useVendors } from '@/hooks';
import { toast } from 'sonner';

interface ProductForm {
  title: string;
  description: string;
  basePrice: string;
  categoryId: string;
  vendorId: string;
  tags: string;
  imageUrls: string;
}

const EMPTY_FORM: ProductForm = {
  title: '',
  description: '',
  basePrice: '',
  categoryId: '',
  vendorId: '',
  tags: '',
  imageUrls: '',
};

export default function AdminProductsPage() {
  const [status, setStatus] = useState('');
  const { data, loading, refetch } = useProducts({ status: status || undefined, limit: 50 });
  const products = data?.items ?? [];

  const { data: categories } = useCategories();
  const { data: vendorsData } = useVendors({ limit: 100 });
  const vendors = vendorsData ?? [];

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const field = (key: keyof ProductForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.basePrice) {
      toast.error('Title and price are required');
      return;
    }
    setSubmitting(true);
    try {
      await productsApi.create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        basePrice: parseFloat(form.basePrice),
        categoryId: form.categoryId || undefined,
        vendorId: form.vendorId || undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        imageUrls: form.imageUrls ? form.imageUrls.split(',').map(u => u.trim()).filter(Boolean) : [],
      });
      toast.success('Product created');
      setShowModal(false);
      setForm(EMPTY_FORM);
      refetch();
    } catch {
      toast.error('Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await productsApi.delete(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
      refetch();
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const approve = async (id: string) => {
    try {
      await productsApi.update(id, { status: 'ACTIVE' });
      toast.success('Product approved');
      refetch();
    } catch { toast.error('Failed'); }
  };

  const reject = async (id: string) => {
    try {
      await productsApi.update(id, { status: 'REJECTED' });
      toast.success('Product rejected');
      refetch();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">Products</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'DRAFT', 'ARCHIVED'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${status === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s ? s.replace(/_/g, ' ') : 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Vendor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              )) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-400">No products found</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {p.images?.[0] && <Image src={p.images[0].url} alt="" fill unoptimized className="object-cover" sizes="40px" />}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm line-clamp-2 max-w-[180px]">{p.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{p.vendor?.storeName ?? '—'}</td>
                  <td className="px-4 py-3 font-bold text-gray-900 text-sm hidden sm:table-cell">{formatPrice(p.basePrice)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} type="custom" /></td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.status === 'PENDING_APPROVAL' && <>
                        <button onClick={() => approve(p.id)} className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100">Approve</button>
                        <button onClick={() => reject(p.id)} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100">Reject</button>
                      </>}
                      {p.status === 'ACTIVE' && (
                        <button onClick={() => reject(p.id)} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-100">Archive</button>
                      )}
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">Add Product</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                <input {...field('title')} required placeholder="Product title"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea {...field('description')} rows={3} placeholder="Product description"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Base Price (NPR) *</label>
                  <input {...field('basePrice')} required type="number" min="0" step="0.01" placeholder="0.00"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <select {...field('categoryId')}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                    <option value="">None</option>
                    {(categories ?? []).map((c: any) => (
                      <option key={c._id ?? c.id} value={c._id ?? c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Vendor</label>
                <select {...field('vendorId')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                  <option value="">Auto-assign (first active vendor)</option>
                  {vendors.map((v: any) => (
                    <option key={v._id ?? v.id} value={v._id ?? v.id}>{v.storeName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Image URLs</label>
                <input {...field('imageUrls')} placeholder="https://... , https://... (comma-separated)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tags</label>
                <input {...field('tags')} placeholder="tag1, tag2, tag3 (comma-separated)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-black text-gray-900">Delete Product?</h2>
            <p className="text-sm text-gray-600">This will permanently remove the product, its variants, images, and wishlist entries. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
