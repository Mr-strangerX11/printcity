'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const CATEGORY_FAQS: Record<string, { q: string; a: string }[]> = {
  'digital-print': [
    { q: 'What file format should I send for printing?', a: 'We accept PDF, AI, EPS, and high-resolution PNG/JPG (minimum 300 DPI). Vector files (AI, EPS) give the sharpest results. If you are unsure, send what you have — our team will check and advise for free.' },
    { q: 'What is the minimum order quantity?', a: 'Minimum quantities vary by product. For flyers and brochures, we start from 100 pieces. For business cards, minimum is 50. For certificates and tickets, even single pieces can be printed. Contact us for exact MOQs.' },
    { q: 'Can you design my artwork if I do not have one?', a: 'Yes! Our in-house design team can create your artwork from scratch. Design fees apply depending on complexity — we will include the design cost in your quote. Just describe what you need.' },
    { q: 'How long does printing take?', a: 'Standard turnaround is 2–5 working days depending on the product. Express 24-hour printing is available for most digital print products for an additional charge. We confirm timelines when you place the order.' },
  ],
  'large-format': [
    { q: 'What is the maximum size you can print?', a: 'For flex and vinyl, we can print any width from 60cm up to 5 metres wide and any length. For rigid boards (foam board, PVC), maximum is 1.2m × 2.4m. Custom sizes beyond this can be tiled and joined seamlessly.' },
    { q: 'Are your outdoor prints weatherproof?', a: 'Yes. We use UV-resistant inks and weatherproof materials for all outdoor applications. Our flex and vinyl prints are rated for 2–3 years outdoors. Additional UV lamination is available for extended durability.' },
    { q: 'Do you provide installation services?', a: 'Yes, we offer professional installation for flex banners, wall murals, hoardings, window graphics, and vehicle wraps. Installation is charged separately. We cover Kathmandu Valley and can arrange for other cities.' },
    { q: 'What resolution do I need for large format printing?', a: 'For large format, 72–150 DPI at actual print size is sufficient (not 300 DPI like digital print). If sending at A4 size as a proof, send at 300 DPI. Vector files (AI, EPS) are always ideal regardless of size.' },
  ],
  'stamp-bill-pad': [
    { q: 'How long does stamp making take?', a: 'Self-inking stamps are typically ready in 1–2 working days. Rush same-day service is available within Kathmandu for urgent requirements.' },
    { q: 'Are your PAN/VAT bills IRD Nepal compliant?', a: 'Yes. All our PAN and VAT bill designs follow Inland Revenue Department (IRD) Nepal format requirements, including all mandatory fields, fiscal year notation, and sequential serial numbering.' },
    { q: 'What is NCR paper for bill printing?', a: 'NCR (No Carbon Required) paper creates automatic duplicate or triplicate copies when you write on the top sheet — no carbon paper needed. Available in 2-copy (white + yellow) or 3-copy (white + yellow + pink) sets.' },
    { q: 'Can I get my company logo on the stamp?', a: 'Yes! We can include your company logo, name, address, phone number, and any text on the stamp. Send us your logo file and text details and we will prepare a free proof before manufacturing.' },
  ],
  'id-card-lanyard': [
    { q: 'What information should be on an ID card?', a: 'Typically: name, photo, designation/department, employee/student ID number, company/school name, and logo. We can also add barcode, QR code, or magnetic stripe. Send us your design or describe what you need.' },
    { q: 'What is the difference between Matt and PVC ID cards?', a: 'Matt ID cards have a non-glossy, premium surface that reduces fingerprint marks and has a more formal look. PVC ID cards are standard glossy finish — bright colours, waterproof, and durable. Both last 3–5 years with normal use.' },
    { q: 'Can RFID cards work with our existing access control system?', a: 'Most likely yes. We support Mifare 1K (13.56 MHz) and EM4100 (125 kHz) — the two most common formats used in Nepal. Share your system brand/model and we will confirm compatibility before printing.' },
    { q: 'What is the minimum order for lanyards?', a: 'Minimum order is 50 lanyards for all widths (16mm, 20mm, 25mm). For orders above 500 pieces, bulk pricing applies. Sample lanyards are available for approval before mass production.' },
  ],
  'bag-print': [
    { q: 'What is a non-woven fiber bag?', a: 'Non-woven bags are made from bonded polypropylene fibres — lightweight, strong, and reusable. They are the eco-friendly alternative to plastic bags and are widely used in retail, supermarkets, and events across Nepal.' },
    { q: 'How many times can a non-woven bag be reused?', a: 'Our 80gsm and 100gsm non-woven bags can handle 5–10kg loads and withstand 50–100 uses with normal handling. Laminated versions are even more durable and can be wiped clean.' },
    { q: 'Can I get my logo printed on both sides?', a: 'Yes! Double-sided printing is available for both fiber bags and paper bags. For non-woven bags, both sides can have different designs or colours. We recommend sharing your logo in vector format for the sharpest result.' },
    { q: 'What is the minimum order for bags?', a: 'Minimum is 100 bags for both fiber and paper bags. Bulk pricing starts from 500 units. For custom sizes and special requests, quantities can be discussed.' },
  ],
  'apparel-printing': [
    { q: 'What printing method is best for T-shirts?', a: 'DTG (Direct-to-Garment) is best for full-colour detailed designs on cotton, especially for small quantities. Screen printing is more cost-effective for large quantities with simple designs. Sublimation works on polyester for all-over prints.' },
    { q: 'How many washes does the print last?', a: 'With proper care (wash inside out, cold water, no bleach), DTG prints last 30–50 washes; screen prints last 50+ washes. Sublimation is permanent and never fades. We recommend cold wash for all printed garments.' },
    { q: 'Can I mix sizes in one order?', a: 'Yes, you can mix sizes (XS to 5XL) within a single order. Just specify the size breakdown when ordering. There is no additional charge for size mixing as long as the total quantity meets the minimum.' },
    { q: 'Do you supply the garments or do we?', a: 'We can supply blank garments (T-shirts, tote bags) from our stock, or you can supply your own garments for us to print. We work with both approaches. For supplied garments, please confirm fabric composition before printing.' },
  ],
};

const DEFAULT_FAQS = [
  { q: 'How do I place an order?', a: 'Fill the quote form on this page with your requirements. Our team will respond within 3 working hours with a quote. Once you approve, we start production.' },
  { q: 'Do you deliver nationwide?', a: 'Yes, we deliver across Nepal — Kathmandu Valley same/next day, and other cities within 2–4 working days via courier. Delivery charges apply outside Kathmandu.' },
  { q: 'What payment methods do you accept?', a: 'We accept eSewa, Khalti, bank transfer, and cash. For bulk orders, 50% advance is required. Full payment before dispatch for new customers.' },
  { q: 'Can I see a proof before printing?', a: 'Yes! We send a digital soft proof for approval before any order goes to print. For colour-critical jobs, a physical proof print is available at an additional cost.' },
];

interface Props {
  category: string;
  serviceTitle: string;
}

export function ServiceClient({ category, serviceTitle }: Props) {
  const faqs = CATEGORY_FAQS[category] ?? DEFAULT_FAQS;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <HelpCircle className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-purple-500">Got Questions?</p>
          <h2 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--text-heading)' }}>
            Frequently Asked Questions
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i}
            className="rounded-2xl overflow-hidden transition-all"
            style={{
              background: 'var(--surface)',
              border: `1px solid ${open === i ? 'rgba(124,58,237,0.35)' : 'var(--border-color)'}`,
            }}>
            <button
              className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-bold text-sm leading-snug flex-1" style={{ color: 'var(--text-heading)' }}>
                {faq.q}
              </span>
              <ChevronDown
                className="w-5 h-5 flex-shrink-0 transition-transform duration-200"
                style={{
                  color: 'var(--text-faint)',
                  transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>
            {open === i && (
              <div className="px-6 pb-5">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
