import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { Footer } from '@/components/layout/Footer';
import { getServiceBySlug, getAllServiceSlugs } from '@/lib/service-data';
import { QuoteForm } from './QuoteForm';
import { CheckCircle2, Clock, Shield, Truck, ArrowRight, Printer } from 'lucide-react';

export async function generateStaticParams() {
  return getAllServiceSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.title} | Print City`,
    description: service.description,
  };
}

const GALLERY_COLORS = [
  'from-purple-500/20 to-blue-500/20',
  'from-blue-500/20 to-cyan-500/20',
  'from-cyan-500/20 to-teal-500/20',
  'from-teal-500/20 to-green-500/20',
  'from-pink-500/20 to-purple-500/20',
  'from-orange-500/20 to-red-500/20',
];

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <>
      <Navbar />
      <CategoryBar />

      <main className="min-h-screen" style={{ background: 'var(--page-bg)' }}>

        {/* ── Hero ─────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-20 md:py-28"
          style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 60%, #06B6D4 100%)' }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full bg-white/20 text-white mb-6">
              Print City Services
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-none mb-4 tracking-tight">
              {service.title}
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-medium mb-8">
              {service.subtitle}
            </p>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
              {service.description}
            </p>
            <a href="#quote"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.95)', color: '#7C3AED' }}>
              Get Free Quote in 3 Hours <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* ── Trust bar ────────────────────────────────── */}
        <div className="border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {[
                { icon: Clock,    label: '24hr Express Available' },
                { icon: Shield,   label: 'Free Artwork Check' },
                { icon: Truck,    label: 'Nationwide Delivery' },
                { icon: CheckCircle2, label: '10,000+ Projects Done' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-body)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

          {/* ── Options ──────────────────────────────────── */}
          <section>
            <h2 className="text-2xl md:text-3xl font-black mb-8" style={{ color: 'var(--text-heading)' }}>
              Sizes & Options
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {service.options.map(opt => (
                <div key={opt.label}
                  className="rounded-2xl p-5"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                  <h3 className="text-xs font-black uppercase tracking-widest text-purple-500 mb-3">{opt.label}</h3>
                  <ul className="space-y-1.5">
                    {opt.items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-body)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ── Why Choose ───────────────────────────────── */}
          <section
            className="rounded-3xl p-8 md:p-12"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(37,99,235,0.08) 100%)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                <Printer className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black mb-3" style={{ color: 'var(--text-heading)' }}>
                  Why Choose Print City?
                </h2>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-body)' }}>
                  {service.whyChoose}
                </p>
              </div>
            </div>
          </section>

          {/* ── Gallery ──────────────────────────────────── */}
          <section>
            <h2 className="text-2xl md:text-3xl font-black mb-8" style={{ color: 'var(--text-heading)' }}>
              Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GALLERY_COLORS.map((gradient, i) => (
                <div key={i}
                  className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
                  style={{ border: '1px solid var(--border-color)' }}>
                  <Printer className="w-10 h-10 opacity-30" style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          </section>

          {/* ── What You Get ─────────────────────────────── */}
          <section>
            <h2 className="text-2xl md:text-3xl font-black mb-8" style={{ color: 'var(--text-heading)' }}>
              What You Get
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {service.whatYouGet.map(item => (
                <div key={item}
                  className="flex items-center gap-3 p-5 rounded-2xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-body)' }}>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Quote Form ───────────────────────────────── */}
          <section id="quote">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              {/* Left info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-purple-500">Get a Quote</span>
                  <h2 className="text-3xl font-black mt-1" style={{ color: 'var(--text-heading)' }}>
                    Get Your Quote<br />in 3 Hours
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Submit your requirements — no obligation, no hidden fees.
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: '3-Hour Response', desc: 'Fast quote turnaround guaranteed' },
                    { label: 'No Obligation', desc: 'Free quote with no commitment' },
                    { label: '10k+ Projects', desc: 'Trusted by businesses nationwide' },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{label}</p>
                        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-3 rounded-3xl p-6 md:p-8"
                style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                <QuoteForm serviceTitle={service.title} />
              </div>
            </div>
          </section>

          {/* ── Ready to Print CTA ───────────────────────── */}
          <section
            className="rounded-3xl p-10 md:p-16 text-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 60%, #06B6D4 100%)' }}>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Ready to Print?</h2>
            <p className="text-white/75 mb-8 max-w-md mx-auto">
              Submit your requirements and get a fast, competitive quote.
            </p>
            <a href="#quote"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.95)', color: '#7C3AED' }}>
              Get Quotation In 3 Hours <ArrowRight className="w-4 h-4" />
            </a>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
