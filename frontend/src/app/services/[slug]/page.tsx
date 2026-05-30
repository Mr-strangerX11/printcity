import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { Footer } from '@/components/layout/Footer';
import { getServiceBySlug, getAllServiceSlugs } from '@/lib/service-data';
import { QuoteForm } from './QuoteForm';
import { ServiceClient } from './ServiceClient';
import {
  CheckCircle2, Clock, Shield, Truck, Star,
  ArrowRight, Printer, Phone, MessageCircle,
  Package, Zap, Award, Users,
} from 'lucide-react';

export async function generateStaticParams() {
  return getAllServiceSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.title} | Print City Nepal`,
    description: service.description,
  };
}

const PROCESS_STEPS = [
  { icon: MessageCircle, num: '01', title: 'Send Requirements', desc: 'Tell us your specs — size, quantity, finishing, and deadline.' },
  { icon: Zap,           num: '02', title: 'Get Quote in 3 Hrs', desc: 'Our team replies with a clear, no-obligation price within 3 hours.' },
  { icon: Printer,       num: '03', title: 'We Print & Deliver', desc: 'Approve artwork, we print and deliver nationwide across Nepal.' },
];

const TRUST_STATS = [
  { value: '10,000+', label: 'Projects Completed' },
  { value: '3 Hrs',   label: 'Quote Response' },
  { value: 'Free',    label: 'Artwork Check' },
  { value: '500+',    label: 'Happy Clients' },
];

const WHY_CARDS = [
  { icon: Award,   title: 'Premium Quality',       desc: 'Commercial-grade presses delivering sharp, vibrant prints on every job.' },
  { icon: Clock,   title: 'Fast Turnaround',       desc: 'Express printing as fast as 24 hours — no compromise on quality.' },
  { icon: Shield,  title: 'Free Artwork Check',    desc: 'Our designers review your files before printing — no surprise reprints.' },
  { icon: Truck,   title: 'Nationwide Delivery',   desc: 'We deliver to Kathmandu, Pokhara, Biratnagar, and across Nepal.' },
  { icon: Users,   title: 'Trusted by Businesses', desc: 'From startups to corporates, schools and government offices.' },
  { icon: Package, title: 'Bulk Discounts',        desc: 'Better prices the more you order. Volume quotes available.' },
];

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const WHATSAPP_NUM = '9779800000000';
  const waLink = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(`Hi, I'm interested in ${service.title}. Please send me a quote.`)}`;

  return (
    <>
      <Navbar />
      <CategoryBar />

      <main className="min-h-screen" style={{ background: 'var(--page-bg)' }}>

        {/* ═══════════════════════════════════════════════════
            HERO  — dark split layout
        ═══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#0D0F1A]">
          {/* Background mesh */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-15"
              style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Left — text */}
              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-6 text-xs text-gray-400">
                  <span>Print City</span>
                  <span>/</span>
                  <span className="capitalize">{service.category.replace(/-/g, ' ')}</span>
                  <span>/</span>
                  <span className="text-purple-400">{service.title}</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 text-purple-300"
                  style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)' }}>
                  <Star className="w-3 h-3 fill-purple-400 text-purple-400" />
                  Nepal&apos;s Trusted Print Partner
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05] mb-4 tracking-tight">
                  {service.title.split(' ').map((word, i) => (
                    <span key={i} className={i === service.title.split(' ').length - 1 ? 'text-transparent bg-clip-text' : 'text-white'}
                      style={i === service.title.split(' ').length - 1 ? { backgroundImage: 'linear-gradient(90deg,#A78BFA,#60A5FA)' } : {}}>
                      {word}{' '}
                    </span>
                  ))}
                </h1>

                <p className="text-lg text-gray-400 font-medium mb-4">{service.subtitle}</p>
                <p className="text-gray-500 leading-relaxed mb-10 max-w-lg">{service.description}</p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="#quote"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
                    style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)' }}>
                    Get Free Quote in 3 Hours <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href={waLink} target="_blank" rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                    <svg className="w-4 h-4 fill-green-400" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp Us
                  </a>
                </div>

                {/* Mini trust row */}
                <div className="flex flex-wrap items-center gap-5 mt-8 pt-8 border-t border-white/10">
                  {['Free artwork check', '3-hr quote', 'Nationwide delivery'].map(t => (
                    <div key={t} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — visual card */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative w-full max-w-sm">
                  {/* Main card */}
                  <div className="relative rounded-3xl p-8 overflow-hidden"
                    style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}>
                    <div className="absolute inset-0 opacity-30"
                      style={{ backgroundImage: 'linear-gradient(45deg, rgba(124,58,237,0.3) 25%, transparent 25%, transparent 75%, rgba(124,58,237,0.3) 75%), linear-gradient(45deg, rgba(124,58,237,0.3) 25%, transparent 25%, transparent 75%, rgba(124,58,237,0.3) 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }} />
                    <div className="relative z-10 text-center space-y-5">
                      <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                        <Printer className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">You&apos;ll receive</p>
                        <p className="text-white font-black text-2xl">{service.title}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        {service.whatYouGet.slice(0,2).map(item => (
                          <div key={item} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto mb-1" />
                            <p className="text-white/70 text-[11px] leading-tight">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 px-4 py-2 rounded-2xl text-xs font-black text-white shadow-2xl"
                    style={{ background: 'linear-gradient(135deg,#059669,#10B981)' }}>
                    ✓ Free Artwork Check
                  </div>
                  <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-2xl text-xs font-black shadow-2xl"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
                    ⚡ 3-Hour Quote Response
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            STATS BAR
        ═══════════════════════════════════════════════════ */}
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x" style={{ color: 'var(--border-color)' }}>
              {TRUST_STATS.map(({ value, label }) => (
                <div key={label} className="text-center px-4">
                  <p className="text-2xl md:text-3xl font-black text-transparent bg-clip-text"
                    style={{ backgroundImage: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                    {value}
                  </p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">

          {/* ═══════════════════════════════════════════════
              OPTIONS GRID  — better design
          ═══════════════════════════════════════════════ */}
          <section>
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(37,99,235,0.15))', border: '1px solid rgba(124,58,237,0.2)' }}>
                <Package className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-purple-500">What We Offer</p>
                <h2 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text-heading)' }}>
                  Specifications & Options
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {service.options.map((opt, i) => {
                const colors = [
                  { bg: 'rgba(124,58,237,0.06)', border: 'rgba(124,58,237,0.2)', accent: '#7C3AED', tag: 'rgba(124,58,237,0.12)', tagText: '#A78BFA' },
                  { bg: 'rgba(37,99,235,0.06)',  border: 'rgba(37,99,235,0.2)',  accent: '#2563EB', tag: 'rgba(37,99,235,0.12)',  tagText: '#93C5FD' },
                  { bg: 'rgba(5,150,105,0.06)',  border: 'rgba(5,150,105,0.2)', accent: '#059669', tag: 'rgba(5,150,105,0.12)',  tagText: '#6EE7B7' },
                  { bg: 'rgba(217,119,6,0.06)',  border: 'rgba(217,119,6,0.2)', accent: '#D97706', tag: 'rgba(217,119,6,0.12)',  tagText: '#FCD34D' },
                ];
                const c = colors[i % colors.length];
                return (
                  <div key={opt.label} className="rounded-2xl p-5 flex flex-col gap-4"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: c.accent }}>
                      {opt.label}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {opt.items.map(item => (
                        <span key={item}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold leading-snug"
                          style={{ background: c.tag, color: c.tagText }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══════════════════════════════════════════════
              HOW IT WORKS  — 3 steps
          ═══════════════════════════════════════════════ */}
          <section>
            <div className="text-center mb-12">
              <p className="text-xs font-black uppercase tracking-widest text-purple-500 mb-2">Simple Process</p>
              <h2 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text-heading)' }}>
                How It Works
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connector line on desktop */}
              <div className="hidden md:block absolute top-10 left-[calc(16.67%+1.25rem)] right-[calc(16.67%+1.25rem)] h-px"
                style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.4), rgba(37,99,235,0.4))' }} />

              {PROCESS_STEPS.map(({ icon: Icon, num, title, desc }) => (
                <div key={num} className="relative flex flex-col items-center text-center p-6 rounded-2xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 relative z-10"
                    style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(37,99,235,0.15))', border: '1px solid rgba(124,58,237,0.25)' }}>
                    <Icon className="w-8 h-8 text-purple-500" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center text-white"
                      style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>{num}</span>
                  </div>
                  <h3 className="font-black text-base mb-2" style={{ color: 'var(--text-heading)' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ═══════════════════════════════════════════════
              WHY CHOOSE US  — 6 cards
          ═══════════════════════════════════════════════ */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-purple-500 mb-2">Why Us</p>
                <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: 'var(--text-heading)' }}>
                  Why Choose Print City?
                </h2>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {service.whyChoose}
                </p>
                <a href="#quote" className="inline-flex items-center gap-2 mt-6 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                  Get Your Free Quote <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {WHY_CARDS.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="p-4 rounded-2xl flex gap-3 transition-all hover:scale-[1.02]"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(124,58,237,0.1)' }}>
                      <Icon className="w-4.5 h-4.5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight mb-0.5" style={{ color: 'var(--text-heading)' }}>{title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════
              WHAT YOU GET  — visual cards
          ═══════════════════════════════════════════════ */}
          <section>
            <div className="rounded-3xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#0D0F1A 0%,#1a1040 50%,#0a1628 100%)', border: '1px solid rgba(124,58,237,0.25)' }}>
              <div className="p-8 md:p-12">
                <div className="text-center mb-10">
                  <p className="text-xs font-black uppercase tracking-widest text-purple-400 mb-2">Included</p>
                  <h2 className="text-2xl md:text-3xl font-black text-white">What You Get</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {service.whatYouGet.map((item, i) => (
                    <div key={item} className="flex items-center gap-4 p-5 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-black text-white"
                        style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                        {i + 1}
                      </div>
                      <p className="text-sm font-semibold text-white/85 leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════
              FAQ  — accordion (client component)
          ═══════════════════════════════════════════════ */}
          <ServiceClient category={service.category} serviceTitle={service.title} />

          {/* ═══════════════════════════════════════════════
              QUOTE FORM  — improved 2-col layout
          ═══════════════════════════════════════════════ */}
          <section id="quote" className="scroll-mt-32">
            <div className="rounded-3xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
              <div className="grid grid-cols-1 lg:grid-cols-5">

                {/* Left panel */}
                <div className="lg:col-span-2 p-8 md:p-10 flex flex-col justify-between"
                  style={{ background: 'linear-gradient(160deg,#7C3AED 0%,#2563EB 60%,#0ea5e9 100%)' }}>
                  <div>
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white/80 mb-6"
                      style={{ background: 'rgba(255,255,255,0.15)' }}>
                      GET A FREE QUOTE
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                      Get Your Quote<br />in 3 Hours
                    </h2>
                    <p className="text-white/70 text-sm leading-relaxed mb-8">
                      Submit your requirements — no obligation, no hidden fees. Our team responds within 3 working hours.
                    </p>

                    <div className="space-y-4">
                      {[
                        { icon: Zap,       label: '3-Hour Response',     desc: 'Fastest quote in Nepal' },
                        { icon: Shield,    label: 'No Obligation',       desc: 'Free quote, no commitment' },
                        { icon: Award,     label: '10k+ Projects Done',  desc: 'Trusted by businesses' },
                      ].map(({ icon: Icon, label, desc }) => (
                        <div key={label} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.15)' }}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{label}</p>
                            <p className="text-xs text-white/60">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp CTA at bottom */}
                  <a href={waLink} target="_blank" rel="noreferrer"
                    className="mt-10 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                    style={{ background: '#25D366', color: '#fff' }}>
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Chat on WhatsApp
                  </a>
                </div>

                {/* Right — form */}
                <div className="lg:col-span-3 p-8 md:p-10" style={{ background: 'var(--surface)' }}>
                  <QuoteForm serviceTitle={service.title} />
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════
              BOTTOM CTA BANNER
          ═══════════════════════════════════════════════ */}
          <section>
            <div className="rounded-3xl p-10 md:p-14 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#0D0F1A 0%,#1a1040 100%)', border: '1px solid rgba(124,58,237,0.25)' }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(124,58,237,0.2) 0%, transparent 60%)' }} />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-2">Ready to Print?</h2>
                  <p className="text-white/60 max-w-md">
                    Get a fast, competitive quote for your {service.title.toLowerCase()} order. We respond within 3 working hours.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  <a href="#quote"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#2563EB)' }}>
                    Get Free Quote <ArrowRight className="w-4 h-4" />
                  </a>
                  <a href={`tel:+${WHATSAPP_NUM}`}
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                    <Phone className="w-4 h-4" />
                    Call Us Now
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ── Floating WhatsApp button (mobile) ── */}
      <a href={waLink} target="_blank" rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl md:hidden transition-transform hover:scale-110 active:scale-95"
        style={{ background: '#25D366' }}>
        <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      <Footer />
    </>
  );
}
