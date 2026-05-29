'use client';

import { useState, useRef } from 'react';
import { Send, CheckCircle, Loader2, Calendar, Upload, X, FileImage } from 'lucide-react';

interface Props {
  serviceTitle: string;
}

export function QuoteForm({ serviceTitle }: Props) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', message: '',
    artworkReady: '', quantity: '', deadline: '',
    needDesign: '',
  });
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setArtworkFile(f);
  };

  const removeFile = () => {
    setArtworkFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return;
    setSending(true);
    setError('');
    try {
      await new Promise(res => setTimeout(res, 1200));
      setSent(true);
    } catch {
      setError('Something went wrong. Please contact us directly.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-heading)' }}>Quote Request Sent!</h3>
        <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
          We'll respond within 3 working hours with a competitive quote for your {serviceTitle} order.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' }}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Email <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="you@company.com"
            className="w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' }}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="+1 000 000 0000"
            className="w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' }}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Quantity
          </label>
          <input
            value={form.quantity}
            onChange={e => set('quantity', e.target.value)}
            placeholder="e.g. 500 pieces"
            className="w-full px-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Message
        </label>
        <textarea
          rows={3}
          value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder="Tell us about your project, size, finishing preferences..."
          className="w-full px-4 py-2.5 text-sm rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' }}
        />
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Deadline
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
          <input
            type="date"
            value={form.deadline}
            onChange={e => set('deadline', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-heading)' }}
          />
        </div>
      </div>

      {/* Artwork Ready */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-muted)' }}>
          Artwork Ready?
        </label>
        <div className="flex gap-3 mb-4">
          {['Yes', 'No'].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => { set('artworkReady', v); set('needDesign', ''); setArtworkFile(null); }}
              className="flex-1 py-2.5 text-sm font-bold rounded-xl border-2 transition-all"
              style={{
                borderColor: form.artworkReady === v ? '#8B5CF6' : 'var(--input-border)',
                background: form.artworkReady === v ? 'rgba(139,92,246,0.12)' : 'var(--input-bg)',
                color: form.artworkReady === v ? '#8B5CF6' : 'var(--text-muted)',
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* YES → upload artwork */}
        {form.artworkReady === 'Yes' && (
          <div>
            {artworkFile ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <FileImage className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-heading)' }}>{artworkFile.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {(artworkFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <button type="button" onClick={removeFile}
                  className="p-1 rounded-lg hover:bg-red-500/10 transition-colors">
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full py-6 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-colors hover:border-purple-500/50 hover:bg-purple-500/5"
                style={{ borderColor: 'var(--input-border)' }}
              >
                <Upload className="w-6 h-6" style={{ color: 'var(--text-faint)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  Click to upload your artwork
                </span>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  PDF, AI, EPS, PNG, JPG — max 50 MB
                </span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.ai,.eps,.png,.jpg,.jpeg,.psd,.svg"
              onChange={handleFile}
              className="hidden"
            />
          </div>
        )}

        {/* NO → ask if we should design */}
        {form.artworkReady === 'No' && (
          <div className="rounded-xl p-4 space-y-3"
            style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
              Would you like us to design it for you?
            </p>
            <div className="flex gap-3">
              {['Yes, please design for me', "No, I'll provide it later"].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('needDesign', v)}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg border-2 transition-all leading-snug"
                  style={{
                    borderColor: form.needDesign === v ? '#8B5CF6' : 'rgba(139,92,246,0.3)',
                    background: form.needDesign === v ? 'rgba(139,92,246,0.15)' : 'transparent',
                    color: form.needDesign === v ? '#8B5CF6' : 'var(--text-muted)',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            {form.needDesign === 'Yes, please design for me' && (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                Great! Our design team will get in touch to discuss your requirements. Design charges apply — we'll include it in your quote.
              </p>
            )}
            {form.needDesign === "No, I'll provide it later" && (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                No problem — you can send your artwork to us after receiving the quote. We'll hold your order details.
              </p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 hover:opacity-90 active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB)', color: '#fff' }}
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {sending ? 'Sending…' : 'GET MY FREE QUOTE'}
      </button>

      <p className="text-center text-xs" style={{ color: 'var(--text-faint)' }}>
        We respond within 3 working hours
      </p>
    </form>
  );
}
