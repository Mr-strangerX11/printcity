'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { Footer } from '@/components/layout/Footer';
import { QuoteForm } from '../[slug]/QuoteForm';
import {
  CheckCircle2, Clock, Shield, Truck, ArrowRight,
  ShoppingCart, Palette, Ruler,
} from 'lucide-react';

// ── Color palette ───────────────────────────────────────────────────────────
const COLORS = [
  // Row 1 - darks
  { name: 'Black',           hex: '#1a1a1a' },
  { name: 'Navy',            hex: '#1B3A6B' },
  { name: 'Teal',            hex: '#007A7A' },
  { name: 'Cyan',            hex: '#00B4C8' },
  { name: 'Forest Green',    hex: '#2D5A27' },
  { name: 'Dark Green',      hex: '#1B4332' },
  { name: 'Kelly Green',     hex: '#4CB944' },
  { name: 'Dark Navy',       hex: '#0D1B3E' },
  { name: 'Sky Blue',        hex: '#5DADE2' },
  { name: 'Royal Blue',      hex: '#2563EB' },
  { name: 'Charcoal',        hex: '#3D3D3D' },
  { name: 'Dark Maroon',     hex: '#5C0A00' },
  { name: 'Maroon',          hex: '#800000' },
  { name: 'Brown',           hex: '#6B3A2A' },
  { name: 'Dark Grey',       hex: '#555555' },
  { name: 'Purple',          hex: '#7C3AED' },
  { name: 'Dusty Blue',      hex: '#7BAFD4' },
  { name: 'Sage',            hex: '#8A9E7A' },
  { name: 'Dark Red',        hex: '#8B0000' },
  { name: 'Mauve',           hex: '#9B7B8C' },
  { name: 'Dusty Rose',      hex: '#C4768C' },
  // Row 2 - mids
  { name: 'Olive',           hex: '#6B6B3A' },
  { name: 'Baby Blue',       hex: '#A8D8EA' },
  { name: 'Tan',             hex: '#C4A882' },
  { name: 'Steel Grey',      hex: '#808080' },
  { name: 'Rust',            hex: '#B85C38' },
  { name: 'Camel',           hex: '#C19A6B' },
  { name: 'Khaki',           hex: '#C2B280' },
  { name: 'Army Green',      hex: '#4B5320' },
  { name: 'Dusty Teal',      hex: '#7FADA0' },
  { name: 'Silver',          hex: '#A8A9AD' },
  { name: 'Latte',           hex: '#C9AE8C' },
  { name: 'Sand',            hex: '#E2C899' },
  { name: 'Light Olive',     hex: '#B5B272' },
  { name: 'Red',             hex: '#E63946' },
  { name: 'Light Silver',    hex: '#C8C8C8' },
  { name: 'Cream',           hex: '#F5F0E8' },
  { name: 'Light Blue',      hex: '#BFDFEF' },
  { name: 'Pale Pink',       hex: '#F5C2CC' },
  { name: 'Bright Red',      hex: '#FF2B2B' },
  // Row 3 - lights
  { name: 'White',           hex: '#FFFFFF' },
  { name: 'Off White',       hex: '#F5F5F0' },
  { name: 'Light Grey',      hex: '#E5E5E5' },
  { name: 'Pink',            hex: '#F4A9B9' },
  { name: 'Peach',           hex: '#FFCBA4' },
  { name: 'Yellow',          hex: '#FFD700' },
  { name: 'Gold',            hex: '#E8B84B' },
  { name: 'Hot Pink',        hex: '#FF69B4' },
  { name: 'Light Pink',      hex: '#FFC0CB' },
  { name: 'Lavender',        hex: '#E6CCFF' },
];

const SIZES = ['XS', 'SML', 'MED', 'LRG', 'XLG', '2XL', '3XL', '4XL', '5XL'];

const VIEWS = ['Front', 'Back', 'Left sleeve', 'Right sleeve'] as const;

const SIZE_GUIDE = {
  headers: ['XS', 'SML', 'MED', 'LRG', 'XLG', '2XL', '3XL', '4XL', '5XL'],
  rows: [
    { label: 'Body Width (cm)',  values: [43, 47, 52, 56.5, 61, 64, 68, 75, 80] },
    { label: 'Body Length (cm)', values: [68, 71, 75, 78.5, 82, 83.5, 85, 87, 89] },
  ],
};

type Tab = 'sizing' | 'shipping' | 'images';

export default function TShirtPrintingPage() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(SIZES.map(s => [s, 0]))
  );
  const [activeView, setActiveView] = useState<typeof VIEWS[number]>('Front');
  const [activeTab, setActiveTab] = useState<Tab>('sizing');

  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);

  const setQty = (size: string, val: string) => {
    const n = Math.max(0, parseInt(val) || 0);
    setQuantities(prev => ({ ...prev, [size]: n }));
  };

  return (
    <>
      <Navbar />
      <CategoryBar />

      <main className="min-h-screen" style={{ background: 'var(--page-bg)' }}>

        {/* ── Product Configurator ───────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left — Image + View Switcher */}
            <div>
              {/* Main image */}
              <div
                className="rounded-2xl flex items-center justify-center aspect-square relative overflow-hidden mb-4"
                style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}
              >
                {/* T-shirt silhouette colored by selection */}
                <div className="relative flex items-center justify-center w-full h-full p-12">
                  <svg viewBox="0 0 200 220" className="w-full h-full max-w-xs drop-shadow-xl" fill="none">
                    {/* Collar */}
                    <path d="M80 20 Q100 35 120 20" stroke="#00000020" strokeWidth="2" fill="none"/>
                    {/* Body */}
                    <path
                      d="M30 55 L10 90 L40 95 L40 200 L160 200 L160 95 L190 90 L170 55 L130 70 Q100 82 70 70 Z"
                      fill={selectedColor.hex}
                      stroke={selectedColor.hex === '#FFFFFF' || selectedColor.hex === '#F5F5F0' ? '#ddd' : 'none'}
                      strokeWidth="1"
                    />
                    {/* Collar detail */}
                    <path
                      d="M70 70 Q100 82 130 70 Q115 45 100 42 Q85 45 70 70 Z"
                      fill={selectedColor.hex}
                      stroke={selectedColor.hex === '#FFFFFF' || selectedColor.hex === '#F5F5F0' ? '#ddd' : 'none'}
                      strokeWidth="1"
                    />
                    {/* Neck curve */}
                    <path d="M78 66 Q100 80 122 66" fill="none" stroke="#00000015" strokeWidth="2"/>
                  </svg>
                  {/* View badge */}
                  <span className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: 'var(--hover-bg)', color: 'var(--text-muted)' }}>
                    {activeView}
                  </span>
                </div>

                {/* Google Reviews badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <div>
                    <div className="flex items-center gap-0.5">
                      <span className="text-xs font-black" style={{ color: 'var(--text-heading)' }}>4.9</span>
                      <span className="text-yellow-400 text-xs">★★★★★</span>
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>171 reviews</p>
                  </div>
                </div>
              </div>

              {/* View thumbnails */}
              <div className="grid grid-cols-4 gap-2">
                {VIEWS.map(view => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                    style={{
                      border: `2px solid ${activeView === view ? '#7C3AED' : 'var(--border-color)'}`,
                      background: activeView === view ? 'rgba(124,58,237,0.08)' : 'var(--surface)',
                    }}
                  >
                    <svg viewBox="0 0 60 70" className="w-10 h-10" fill="none">
                      <path
                        d="M10 18 L2 30 L13 32 L13 66 L47 66 L47 32 L58 30 L50 18 L38 23 Q30 27 22 23 Z"
                        fill={selectedColor.hex}
                        stroke={selectedColor.hex === '#FFFFFF' ? '#ddd' : 'none'}
                        strokeWidth="1"
                      />
                      <path d="M22 23 Q30 27 38 23 Q34 12 30 11 Q26 12 22 23 Z" fill={selectedColor.hex} stroke={selectedColor.hex === '#FFFFFF' ? '#ddd' : 'none'} strokeWidth="1"/>
                    </svg>
                    <span className="text-[10px] font-medium" style={{ color: activeView === view ? '#7C3AED' : 'var(--text-faint)' }}>
                      {view}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right — Product details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--text-heading)' }}>
                  T-SHIRT PRINTING
                </h1>
                <ul className="space-y-1">
                  {[
                    'Regular fit', 'Crew neck', 'Mid weight, 180 GSM, 28-singles',
                    '100% combed cotton (marles 15% viscose)',
                    'Neck ribbing, side seamed, shoulder to shoulder tape, double needle hems',
                    'Preshrunk to minimise shrinkage',
                  ].map(spec => (
                    <li key={spec} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-body)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Color picker */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  COLOR
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COLORS.map(color => (
                    <button
                      key={color.hex}
                      title={color.name}
                      onClick={() => setSelectedColor(color)}
                      className="w-6 h-6 rounded-sm transition-all hover:scale-110"
                      style={{
                        background: color.hex,
                        border: selectedColor.hex === color.hex
                          ? '2px solid #7C3AED'
                          : color.hex === '#FFFFFF' || color.hex === '#F5F5F0'
                            ? '1px solid #ccc'
                            : '1px solid transparent',
                        outline: selectedColor.hex === color.hex ? '2px solid rgba(124,58,237,0.3)' : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-body)' }}>{selectedColor.name}</p>
              </div>

              {/* Size quantities */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                  SIZE
                </p>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <div key={size} className="flex items-center gap-1">
                      <span className="text-xs font-bold w-7 text-right" style={{ color: 'var(--text-body)' }}>{size}</span>
                      <input
                        type="number"
                        min={0}
                        value={quantities[size]}
                        onChange={e => setQty(size, e.target.value)}
                        className="w-14 text-center text-sm py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                        style={{
                          background: 'var(--input-bg)',
                          border: quantities[size] > 0 ? '1.5px solid #7C3AED' : '1px solid var(--input-border)',
                          color: 'var(--text-heading)',
                        }}
                      />
                    </div>
                  ))}
                </div>
                {totalQty > 0 && (
                  <p className="text-xs mt-2 text-purple-500 font-semibold">Total: {totalQty} pieces</p>
                )}
              </div>

              {/* Start Designing */}
              <Link
                href="/design-studio"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: '#111', color: '#fff' }}
              >
                <Palette className="w-4 h-4" />
                Start Designing
              </Link>

              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Printed from <span className="font-bold" style={{ color: 'var(--text-heading)' }}>Rs. 850</span> per piece*
              </p>

              {/* Tabs */}
              <div>
                <div className="flex gap-0 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  {([['sizing', 'Sizing Details'], ['shipping', 'Shipping'], ['images', 'More Images']] as [Tab, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors -mb-px"
                      style={{
                        borderBottomColor: activeTab === key ? '#7C3AED' : 'transparent',
                        color: activeTab === key ? '#7C3AED' : 'var(--text-muted)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="pt-4">
                  {activeTab === 'sizing' && (
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>SIZE GUIDE</p>
                      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-color)' }}>
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ background: 'var(--hover-bg)' }}>
                              <td className="px-3 py-2 font-semibold" style={{ color: 'var(--text-muted)' }}></td>
                              {SIZE_GUIDE.headers.map(h => (
                                <td key={h} className="px-3 py-2 font-bold text-center" style={{ color: 'var(--text-body)' }}>{h}</td>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {SIZE_GUIDE.rows.map(row => (
                              <tr key={row.label} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <td className="px-3 py-2 font-semibold whitespace-nowrap" style={{ color: 'var(--text-body)' }}>{row.label}</td>
                                {row.values.map((v, i) => (
                                  <td key={i} className="px-3 py-2 text-center" style={{ color: 'var(--text-muted)' }}>{v}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {activeTab === 'shipping' && (
                    <div className="space-y-2">
                      {[
                        ['Standard', '3–5 working days', 'Rs. 150'],
                        ['Express', '1–2 working days', 'Rs. 350'],
                        ['Same Day', 'Available in Kathmandu', 'Contact us'],
                      ].map(([type, time, price]) => (
                        <div key={type} className="flex items-center justify-between p-3 rounded-xl text-sm"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                          <span className="font-semibold" style={{ color: 'var(--text-heading)' }}>{type}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{time}</span>
                          <span className="font-bold text-purple-500">{price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'images' && (
                    <div className="grid grid-cols-3 gap-2">
                      {['from-purple-500/20 to-blue-500/20', 'from-blue-500/20 to-cyan-500/20', 'from-cyan-500/20 to-teal-500/20'].map(g => (
                        <div key={g} className={`aspect-square rounded-xl bg-gradient-to-br ${g} flex items-center justify-center`}
                          style={{ border: '1px solid var(--border-color)' }}>
                          <Ruler className="w-6 h-6 opacity-30" style={{ color: 'var(--text-muted)' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Trust bar ────────────────────────────────── */}
        <div className="border-y" style={{ background: 'var(--surface)', borderColor: 'var(--border-color)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {[
                { icon: Clock,       label: '24hr Express Available' },
                { icon: Shield,      label: 'Free Artwork Check' },
                { icon: Truck,       label: 'Nationwide Delivery' },
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

          {/* ── Printing methods ─────────────────────────── */}
          <section>
            <h2 className="text-2xl md:text-3xl font-black mb-8" style={{ color: 'var(--text-heading)' }}>
              Printing Methods & Options
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Printing Methods', items: ['DTG (Direct-to-Garment)', 'Screen printing', 'Heat transfer', 'Sublimation'] },
                { label: 'Fabric', items: ['100% cotton', 'Polyester blend', 'Dry-fit performance'] },
                { label: 'Sizes', items: ['XS to 5XL', 'Kids sizes available', 'Custom on request'] },
                { label: 'Colours', items: ['Full colour print', 'Pantone-matched available', '50+ garment colours'] },
              ].map(opt => (
                <div key={opt.label} className="rounded-2xl p-5"
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
                <ShoppingCart className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black mb-3" style={{ color: 'var(--text-heading)' }}>
                  Why Choose Print City?
                </h2>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-body)' }}>
                  Minimum 10 pieces per order. We offer free sample prints for bulk orders and provide Pantone-accurate colour matching for brand consistency. From corporate uniforms and team jerseys to event merchandise and branded giveaways — Print City delivers high-quality custom T-shirt printing with fast turnaround.
                </p>
              </div>
            </div>
          </section>

          {/* ── What You Get ─────────────────────────────── */}
          <section>
            <h2 className="text-2xl md:text-3xl font-black mb-8" style={{ color: 'var(--text-heading)' }}>
              What You Get
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Full colour garment printing', 'Free artwork check', '5–7 working days turnaround'].map(item => (
                <div key={item} className="flex items-center gap-3 p-5 rounded-2xl"
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
                    { label: '3-Hour Response',  desc: 'Fast quote turnaround guaranteed' },
                    { label: 'No Obligation',    desc: 'Free quote with no commitment' },
                    { label: '10k+ Projects',    desc: 'Trusted by businesses nationwide' },
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
              <div className="lg:col-span-3 rounded-3xl p-6 md:p-8"
                style={{ background: 'var(--surface)', border: '1px solid var(--border-color)' }}>
                <QuoteForm serviceTitle="T-SHIRT PRINTING" />
              </div>
            </div>
          </section>

          {/* ── CTA ──────────────────────────────────────── */}
          <section
            className="rounded-3xl p-10 md:p-16 text-center"
            style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 60%, #06B6D4 100%)' }}>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Ready to Print?</h2>
            <p className="text-white/75 mb-8 max-w-md mx-auto">
              Start designing your custom T-shirts or get a fast quote today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/design-studio"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 shadow-2xl"
                style={{ background: 'rgba(255,255,255,0.95)', color: '#7C3AED' }}>
                <Palette className="w-4 h-4" /> Start Designing
              </Link>
              <a href="#quote"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-105 border-2 border-white/40 text-white hover:bg-white/10">
                Get Quotation <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
