export interface ServiceOption {
  label: string;
  items: string[];
}

export interface ServiceData {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  options: ServiceOption[];
  whyChoose: string;
  whatYouGet: string[];
}

const SERVICES: ServiceData[] = [

  // ── DIGITAL PRINT ────────────────────────────────────────────
  {
    slug: 'flyer',
    title: 'FLYER PRINTING',
    subtitle: 'Professional Flyer Printing in Nepal at Competitive Prices',
    description:
      'Print City offers high-quality flyer printing across Nepal at competitive prices. Whether you need promotional flyers for a product launch, event marketing, or brand awareness campaign, our full-colour digital printing delivers sharp, vibrant results every time.',
    category: 'digital-print',
    options: [
      { label: 'Sizes Available', items: ['A4', 'A5', 'A6', 'DL', 'Custom sizes'] },
      { label: 'Paper Stocks', items: ['100gsm offset paper', '128gsm gloss art card', '170gsm art card', '250gsm art card'] },
      { label: 'Finishing Options', items: ['Gloss lamination', 'Matte lamination', 'Spot UV', 'Die-cut'] },
      { label: 'Printing', items: ['Single-sided or double-sided', 'Full colour CMYK'] },
    ],
    whyChoose:
      'With fast turnaround, free artwork checks, and delivery across Nepal, Print City is trusted by businesses of all sizes. From 100 copies to 100,000 — we handle every order with care and precision.',
    whatYouGet: ['Full colour CMYK printing', 'Free artwork check before printing', '2–4 working days turnaround'],
  },
  {
    slug: 'visiting-card',
    title: 'VISITING CARD PRINTING',
    subtitle: 'Premium Visiting Cards That Make a Lasting Impression',
    description:
      'First impressions matter. Print City produces premium visiting cards with luxurious finishes and precise cutting, so your card stands out in every meeting and networking event across Nepal.',
    category: 'digital-print',
    options: [
      { label: 'Standard Size', items: ['90mm × 54mm (standard)', '85mm × 55mm', 'Custom sizes available'] },
      { label: 'Paper Stocks', items: ['300gsm art card', '350gsm art card', '400gsm ultra-thick', 'PVC card'] },
      { label: 'Finishing', items: ['Gloss lamination', 'Matte lamination', 'Spot UV', 'Embossing', 'Foil stamping', 'Rounded corners'] },
      { label: 'Printing', items: ['Single-sided or double-sided', 'Full colour CMYK'] },
    ],
    whyChoose:
      'From minimalist monochrome to full-bleed colour, we bring your brand identity to life on every card. Express options available for urgent requirements.',
    whatYouGet: ['Premium cardstock printing', 'Free artwork check', '2–3 working days turnaround'],
  },
  {
    slug: 'note-book',
    title: 'NOTE BOOK PRINTING',
    subtitle: 'Custom Branded Notebooks for Corporate & Schools',
    description:
      'Print City produces custom printed notebooks ideal for corporate gifting, school events, seminars, and brand promotions. Available in a range of sizes with full-colour covers and quality inner pages.',
    category: 'digital-print',
    options: [
      { label: 'Sizes', items: ['A4', 'A5', 'A6', 'B5', 'Custom sizes'] },
      { label: 'Cover', items: ['300gsm art card cover', 'Full colour CMYK', 'Gloss / matte lamination'] },
      { label: 'Inner Pages', items: ['70gsm offset paper', '80gsm offset paper', 'Ruled / blank / dotted'] },
      { label: 'Binding', items: ['Spiral binding', 'Saddle-stitch', 'Perfect bound', 'Case bound'] },
    ],
    whyChoose:
      'Fully customisable with your logo, brand colours, and messaging. Bulk discounts available from 100 units. Perfect for corporate gifts and educational institutions.',
    whatYouGet: ['Full colour cover printing', 'Free artwork check', '5–7 working days turnaround'],
  },
  {
    slug: 'certificate',
    title: 'CERTIFICATE PRINTING',
    subtitle: 'Professional Certificate Printing for Every Occasion',
    description:
      'Print City prints high-quality certificates for academic institutions, corporate organisations, training centres, and events across Nepal. We ensure every certificate looks official, professional, and impressive.',
    category: 'digital-print',
    options: [
      { label: 'Sizes', items: ['A4 (standard)', 'A3', 'Custom sizes'] },
      { label: 'Paper Stocks', items: ['120gsm bond paper', '200gsm art card', '250gsm art card', 'Parchment / ivory paper'] },
      { label: 'Finishing', items: ['Gold / silver foil border', 'Embossing', 'Gloss / matte lamination', 'Hologram sticker'] },
      { label: 'Special Features', items: ['Security seal printing', 'Gold border printing', 'Serial numbering'] },
    ],
    whyChoose:
      'Trusted by schools, colleges, and corporate houses across Nepal. Our certificates are printed with precision borders, gold foil options, and security features to prevent duplication.',
    whatYouGet: ['Premium quality certificate print', 'Free artwork check', '2–4 working days turnaround'],
  },
  {
    slug: 'cable-stickers',
    title: 'CABLE / LABEL STICKER PRINTING',
    subtitle: 'Durable Cable Labels and Custom Stickers for Every Use',
    description:
      'Print City prints custom cable labels, product labels, barcode stickers, and promotional stickers in any shape and size. Ideal for manufacturing, retail, warehouses, and office labelling needs.',
    category: 'digital-print',
    options: [
      { label: 'Types', items: ['Cable / wire labels', 'Product labels', 'Barcode / QR stickers', 'Promotional stickers'] },
      { label: 'Materials', items: ['White vinyl', 'Transparent vinyl', 'Matte vinyl', 'Waterproof vinyl'] },
      { label: 'Shapes', items: ['Round', 'Rectangle', 'Square', 'Custom die-cut'] },
      { label: 'Sizes', items: ['Any size from 10mm', 'Custom dimensions available'] },
    ],
    whyChoose:
      'Our stickers and labels are UV-resistant, waterproof, and scratch-proof — suitable for indoor and outdoor use. Minimum order from just 50 pieces with fast turnaround.',
    whatYouGet: ['Full colour CMYK printing', 'Free artwork check', '2–4 working days turnaround'],
  },
  {
    slug: 'marriage-card-print',
    title: 'MARRIAGE CARD PRINTING',
    subtitle: 'Beautiful Wedding Invitation Cards Printed in Nepal',
    description:
      'Make your special day unforgettable with elegantly printed marriage cards from Print City. We offer a full range of designs from traditional Nepali styles to modern minimalist layouts — all printed on premium quality cardstock.',
    category: 'digital-print',
    options: [
      { label: 'Card Sizes', items: ['A5 folded', 'DL', 'Square (148×148mm)', 'Custom sizes'] },
      { label: 'Paper Stocks', items: ['300gsm art card', '350gsm ivory card', 'Pearlescent board', 'Textured board'] },
      { label: 'Finishing', items: ['Gold / silver foil stamping', 'Embossing', 'Gloss / matte lamination', 'Ribbon tie', 'Laser cut'] },
      { label: 'Styles', items: ['Traditional Nepali design', 'Modern minimalist', 'Hindu / Buddhist themes', 'Fully custom design'] },
    ],
    whyChoose:
      'We offer design assistance for couples who need help creating their perfect invitation. Rush printing available for last-minute requirements. Envelopes available with every order.',
    whatYouGet: ['Premium quality card printing', 'Free design consultation', '3–5 working days turnaround'],
  },
  {
    slug: 'invitation-card-print',
    title: 'INVITATION CARD PRINTING',
    subtitle: 'Custom Invitation Cards for Every Event',
    description:
      'From birthday parties and baby showers to corporate events and cultural celebrations — Print City prints beautiful invitation cards tailored to every occasion. Choose from our templates or submit your own design.',
    category: 'digital-print',
    options: [
      { label: 'Card Types', items: ['Birthday invitations', 'Corporate event invites', 'Festival / cultural cards', 'Baby shower cards', 'Graduation invitations'] },
      { label: 'Sizes', items: ['A5', 'A6', 'DL', 'Square', 'Custom'] },
      { label: 'Paper Stocks', items: ['300gsm art card', '350gsm art card', 'Pearlescent board'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Foil stamping', 'Embossing', 'Die-cut shapes'] },
    ],
    whyChoose:
      'Whether you need 50 personal invitations or 5,000 corporate invites, our team delivers consistent quality every time. Template designs available for quick ordering.',
    whatYouGet: ['Full colour printing', 'Free artwork check', '2–4 working days turnaround'],
  },
  {
    slug: 'calendar-print',
    title: 'CALENDAR PRINTING',
    subtitle: 'Custom Calendars for Business & Corporate Gifting',
    description:
      'Keep your brand visible all year round with custom printed calendars. Perfect for corporate gifting, promotional giveaways, and office use — personalised with your logo, images, and branding. Available in both English (AD) and Nepali (BS) formats.',
    category: 'digital-print',
    options: [
      { label: 'Types', items: ['Wall calendars', 'Desk calendars', 'Pocket calendars', 'Planner calendars', 'Nepali calendar (BS)'] },
      { label: 'Sizes', items: ['A2', 'A3', 'A4', 'A5', 'Custom'] },
      { label: 'Binding', items: ['Wire-O binding', 'Spiral binding', 'Saddle-stitch', 'Single sheet'] },
      { label: 'Paper', items: ['130gsm gloss art paper', '170gsm gloss art paper', '200gsm cover pages'] },
    ],
    whyChoose:
      'Fully customisable monthly layouts with your photos, company events, and branding. We support both AD and BS calendar formats. Bulk discounts from 50 units with delivery across Nepal.',
    whatYouGet: ['Full colour printing', 'Free artwork check', '5–7 working days turnaround'],
  },
  {
    slug: 'brochure-printing',
    title: 'BROCHURE PRINTING',
    subtitle: 'Premium Brochure Printing for Every Business',
    description:
      'Make a lasting impression with professionally printed brochures. From tri-fold leaflets to multi-page booklets, Print City delivers crisp, full-colour brochures that showcase your brand beautifully across Nepal.',
    category: 'digital-print',
    options: [
      { label: 'Sizes Available', items: ['A4', 'A5', 'DL', 'Custom sizes'] },
      { label: 'Fold Types', items: ['Bi-fold', 'Tri-fold', 'Z-fold', 'Gate fold'] },
      { label: 'Paper Stocks', items: ['130gsm gloss art paper', '170gsm art paper', '200gsm art card'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Spot UV', 'Soft-touch coating'] },
    ],
    whyChoose:
      'Our digital presses ensure consistent colour accuracy across every brochure. Free design consultation and fast turnaround to meet your campaign deadlines.',
    whatYouGet: ['Full colour CMYK printing', 'Free artwork check', '3–5 working days turnaround'],
  },
  {
    slug: 'ticket-printing',
    title: 'TICKET PRINTING',
    subtitle: 'Secure, Customised Tickets for Every Event',
    description:
      'From concert tickets and sports event passes to raffle tickets and admission cards, Print City produces tamper-evident, professionally printed tickets for every occasion across Nepal.',
    category: 'digital-print',
    options: [
      { label: 'Types', items: ['Event tickets', 'Raffle / lottery tickets', 'Admission passes', 'Concert tickets', 'Sports event passes'] },
      { label: 'Security Features', items: ['Sequential numbering', 'Barcode / QR code', 'Perforated tear-off stub', 'Hologram sticker'] },
      { label: 'Paper Stocks', items: ['200gsm art card', '300gsm art card', 'Security paper'] },
      { label: 'Sizes', items: ['Standard DL', 'A6', 'Custom strip tickets'] },
    ],
    whyChoose:
      'Our tickets include optional security features to prevent counterfeiting. Available with express turnaround for last-minute events. Numbered rolls available for large events.',
    whatYouGet: ['Full colour CMYK printing', 'Free artwork check', '2–4 working days turnaround'],
  },
  {
    slug: 'corporate-folder',
    title: 'CORPORATE FOLDER PRINTING',
    subtitle: 'Branded Presentation Folders for a Professional Look',
    description:
      'Make every client meeting count with premium printed corporate folders. Showcase your professionalism and keep documents organised with custom-branded presentation folders — perfect for proposals, reports, and meetings.',
    category: 'digital-print',
    options: [
      { label: 'Sizes', items: ['A4 (standard)', 'A5', 'Custom sizes'] },
      { label: 'Paper Stocks', items: ['350gsm art card', '400gsm art card'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Spot UV', 'Foil stamping', 'Embossing'] },
      { label: 'Features', items: ['Business card slot', 'Inner pockets', 'CD pocket option', 'Custom die-cut'] },
    ],
    whyChoose:
      'Our corporate folders are sturdy, elegantly finished, and tailored to your brand identity. Premium finishes available for executive presentations and board meetings.',
    whatYouGet: ['Full colour CMYK printing', 'Free artwork check', '5–7 working days turnaround'],
  },
  {
    slug: 'customized-printing',
    title: 'CUSTOMIZED PRINTING',
    subtitle: 'Bespoke Printing Solutions for Any Requirement',
    description:
      'Have a unique printing requirement? Print City handles fully customised print projects — from unusual sizes and specialty materials to complex finishing. Tell us what you need and we will make it happen.',
    category: 'digital-print',
    options: [
      { label: 'Substrates', items: ['Paper', 'Cardstock', 'Vinyl', 'Fabric', 'Synthetic materials'] },
      { label: 'Finishing', items: ['Any standard or specialty finish on request'] },
      { label: 'Sizes', items: ['Fully custom — any dimension'] },
      { label: 'Quantities', items: ['From 1 unit to 100,000+'] },
    ],
    whyChoose:
      'Our experienced team will advise on the best materials and methods for your unique project. Request a free consultation and quote today — no obligation.',
    whatYouGet: ['Custom specifications', 'Free consultation & artwork check', 'Turnaround discussed per project'],
  },
  {
    slug: 'document-printing',
    title: 'DOCUMENT PRINTING',
    subtitle: 'Fast, Reliable Document Printing Across Nepal',
    description:
      'Print City offers professional document printing for businesses, law firms, government offices, and individuals. From single-page documents to large bound reports, we handle every print job with speed and accuracy.',
    category: 'digital-print',
    options: [
      { label: 'Document Types', items: ['Reports & presentations', 'Legal documents', 'Manuals & handbooks', 'Training materials', 'Proposals'] },
      { label: 'Paper Stocks', items: ['70gsm offset', '80gsm offset', '100gsm bond', '120gsm'] },
      { label: 'Binding', items: ['Spiral / comb binding', 'Staple binding', 'Perfect binding', 'Hardcover binding'] },
      { label: 'Options', items: ['Black & white or full colour', 'Single or double-sided', 'Tabs & dividers'] },
    ],
    whyChoose:
      'Same-day and express document printing available for urgent requirements. We handle high-volume printing efficiently with consistent quality across every page.',
    whatYouGet: ['B&W or full colour printing', 'Free quality check', 'Same-day turnaround available'],
  },

  // ── LARGE FORMAT ─────────────────────────────────────────────
  {
    slug: 'flex-print',
    title: 'FLEX PRINT',
    subtitle: 'Large Format Flex Banners & Hoardings Across Nepal',
    description:
      'Print City offers premium quality flex printing for banners, hoardings, signboards, and outdoor advertising. Our wide-format flex printers produce sharp, weather-resistant prints that last for years outdoors.',
    category: 'large-format',
    options: [
      { label: 'Materials', items: ['280gsm flex banner', '440gsm frontlit flex', '510gsm backlit flex', 'Mesh flex (windproof)'] },
      { label: 'Sizes', items: ['Any size — no maximum limit', 'Standard and custom widths'] },
      { label: 'Finishing', items: ['Hemmed edges with grommets', 'Pole pockets', 'Keder edge', 'Ready to hang'] },
      { label: 'Applications', items: ['Hoardings / billboards', 'Shop signboards', 'Event banners', 'Construction hoardings'] },
    ],
    whyChoose:
      'Our flex prints use UV-resistant inks that remain vibrant for 2–3 years outdoors. We offer both solvent and eco-solvent printing for high durability. Delivery and installation available across Nepal.',
    whatYouGet: ['Full colour outdoor printing', 'UV-resistant inks', '1–3 working days turnaround'],
  },
  {
    slug: 'vinyl-sticker-print',
    title: 'VINYL / STICKER PRINT',
    subtitle: 'High-Quality Vinyl Sticker Printing for All Surfaces',
    description:
      'Print City prints custom vinyl stickers for vehicles, shops, glass, walls, and outdoor signage. Our vinyl prints are durable, weatherproof, and stick firmly to any clean surface.',
    category: 'large-format',
    options: [
      { label: 'Materials', items: ['Gloss vinyl', 'Matte vinyl', 'Transparent vinyl', 'Reflective vinyl', 'Floor vinyl'] },
      { label: 'Applications', items: ['Vehicle branding', 'Shop window graphics', 'Wall stickers', 'Floor graphics', 'Outdoor signage'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Contour cut', 'Kiss cut', 'Full bleed cut'] },
      { label: 'Sizes', items: ['Any size — from 50mm to 10+ metres', 'Custom dimensions'] },
    ],
    whyChoose:
      'Our vinyl films are sourced from leading brands with a guaranteed lifespan of 3–5 years outdoors. Professional installation team available for vehicle wraps and large applications.',
    whatYouGet: ['Full colour vinyl printing', 'Weatherproof materials', '1–3 working days turnaround'],
  },
  {
    slug: 'canvas-print',
    title: 'CANVAS PRINT',
    subtitle: 'Premium Canvas Printing for Art, Décor & Business',
    description:
      'Transform your photos, artwork, or designs into stunning canvas prints. Print City produces gallery-quality canvas prints for homes, offices, hotels, and art galleries across Nepal.',
    category: 'large-format',
    options: [
      { label: 'Canvas Materials', items: ['300gsm poly-cotton canvas', '380gsm cotton canvas', 'Satin canvas'] },
      { label: 'Sizes', items: ['A3', 'A2', 'A1', 'A0', 'Custom panoramic sizes'] },
      { label: 'Mounting Options', items: ['Stretched on wooden frame', 'Rolled (unframed)', 'Mounted on board'] },
      { label: 'Finishing', items: ['Gloss / matte varnish coating', 'Gallery wrap edges'] },
    ],
    whyChoose:
      'Our canvas prints use archival-quality inks that resist fading for 50+ years. Perfect for interior decoration, photography studios, and corporate office artwork.',
    whatYouGet: ['Gallery-quality canvas printing', 'Free artwork check', '3–5 working days turnaround'],
  },
  {
    slug: 'mural-print',
    title: 'MURAL PRINT',
    subtitle: 'Custom Wall Mural Printing & Installation in Nepal',
    description:
      'Transform any blank wall into a stunning visual statement with Print City\'s custom mural printing. From office feature walls and hotel lobbies to retail spaces and schools — we print and install murals of any size.',
    category: 'large-format',
    options: [
      { label: 'Materials', items: ['Premium wall vinyl', 'Non-woven wallpaper', 'Fabric wall wrap', 'Removable wall vinyl'] },
      { label: 'Sizes', items: ['Any wall size — ceiling to floor', 'Custom panel layouts'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Textured finish', 'Anti-scratch coating'] },
      { label: 'Applications', items: ['Office feature walls', 'Retail store walls', 'Hotel lobbies', 'Schools & universities', 'Restaurants'] },
    ],
    whyChoose:
      'Our professional installation team ensures seamless, bubble-free mural installation. Site survey included for large projects. Removable options available for rental spaces.',
    whatYouGet: ['Full colour mural print', 'Professional installation', 'Turnaround discussed per project'],
  },
  {
    slug: 'one-way-vision',
    title: 'ONE WAY VISION',
    subtitle: 'Perforated Window Graphics for Privacy & Advertising',
    description:
      'One Way Vision (perforated vinyl) lets you display full-colour graphics on glass surfaces while allowing clear visibility from inside. Perfect for shop windows, vehicle windows, and office partitions.',
    category: 'large-format',
    options: [
      { label: 'Material', items: ['50/50 perforated vinyl (50% ink, 50% hole)', '60/40 perforated vinyl'] },
      { label: 'Applications', items: ['Shop window advertising', 'Vehicle rear windows', 'Glass office partitions', 'Bus & taxi windows'] },
      { label: 'Finishing', items: ['Gloss lamination for durability', 'Custom cut to size'] },
      { label: 'Visibility', items: ['Clear view from inside', 'Full colour print visible outside'] },
    ],
    whyChoose:
      'One Way Vision transforms unused glass surfaces into powerful advertising space while maintaining natural light and privacy inside. UV-resistant inks guaranteed for outdoor durability.',
    whatYouGet: ['Full colour perforated print', 'Free artwork check', '2–3 working days turnaround'],
  },
  {
    slug: 'pull-up-banner',
    title: 'PULL-UP BANNER',
    subtitle: 'Retractable Pull-Up Banners for Events & Exhibitions',
    description:
      'Portable, professional, and reusable — pull-up banners are the go-to display solution for trade shows, exhibitions, retail stores, and corporate events in Nepal. Set up in seconds, pack away effortlessly.',
    category: 'large-format',
    options: [
      { label: 'Standard Sizes', items: ['850×2000mm', '1000×2000mm', '1200×2000mm', 'Custom sizes'] },
      { label: 'Materials', items: ['Premium polyester film', 'Gloss / matte finish'] },
      { label: 'Stand Options', items: ['Standard aluminium retractable base', 'Heavy-duty premium stand', 'Double-sided stand'] },
      { label: 'Includes', items: ['Printed graphic', 'Retractable aluminium base', 'Carry bag'] },
    ],
    whyChoose:
      'Our pull-up banners are lightweight, durable, and print-ready within 24–48 hours. Replacement graphics available when you rebrand. Ideal for Nepal trade fairs and exhibitions.',
    whatYouGet: ['Full colour graphic print', 'Free artwork check', '1–2 working days turnaround'],
  },
  {
    slug: 'display-standee',
    title: 'DISPLAY STANDEE',
    subtitle: 'Custom Display Standees for Shops, Events & Promotions',
    description:
      'Create a striking presence in your store or at events with custom display standees. From life-size cut-outs to branded A-frame signs, our standees draw attention and communicate your message clearly.',
    category: 'large-format',
    options: [
      { label: 'Types', items: ['Life-size standee', 'A-frame standee', 'L-shaped floor standee', 'Counter standee', 'X-banner standee'] },
      { label: 'Material', items: ['5mm foam board', '3mm PVC board', 'Corrugated plastic', 'Acrylic'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Custom die-cut shape'] },
      { label: 'Sizes', items: ['Tabletop (30cm)', 'Full-height (up to 2.4m)', 'Custom dimensions'] },
    ],
    whyChoose:
      'We offer precision die-cutting to any shape, ensuring your standee perfectly matches your design. Ideal for product launches, promotional campaigns, and shop entrances.',
    whatYouGet: ['Full colour printing', 'Free artwork check', '2–4 working days turnaround'],
  },
  {
    slug: 'installation-service',
    title: 'INSTALLATION SERVICE',
    subtitle: 'Professional Print Installation Across Nepal',
    description:
      'Print City offers end-to-end installation services for large-format graphics, wall wraps, window graphics, hoardings, and more. Our experienced installers ensure a flawless finish every time.',
    category: 'large-format',
    options: [
      { label: 'Installation Types', items: ['Wall murals & wraps', 'Window graphics', 'Hoarding installation', 'Flex banner hanging', 'Signboard installation'] },
      { label: 'Locations', items: ['Retail stores', 'Offices', 'Events & exhibitions', 'Outdoor hoardings', 'Vehicle branding'] },
      { label: 'Materials', items: ['Cast vinyl', 'Calendered vinyl', 'Flex banners', 'Mesh banners'] },
      { label: 'Service', items: ['Site survey available', 'Weekend & after-hours installation', 'Nationwide coverage'] },
    ],
    whyChoose:
      'Our trained installation team handles jobs of any scale — from a single window sticker to a full building hoarding — delivering precision and speed across Nepal.',
    whatYouGet: ['Print + professional installation', 'Site survey available', 'Turnaround discussed per project'],
  },

  // ── STAMP / BILL PAD ─────────────────────────────────────────
  {
    slug: 'circle-self-ink-stamp',
    title: 'CIRCLE SELF INK STAMP',
    subtitle: 'Round Self-Inking Stamps for Offices & Businesses',
    description:
      'Print City produces high-quality round self-inking stamps ideal for offices, banks, schools, and businesses across Nepal. Our stamps provide thousands of clean impressions without the need for a separate ink pad.',
    category: 'stamp-bill-pad',
    options: [
      { label: 'Sizes', items: ['20mm diameter', '30mm diameter', '40mm diameter', '50mm diameter', 'Custom sizes'] },
      { label: 'Ink Colours', items: ['Blue', 'Red', 'Black', 'Green', 'Violet'] },
      { label: 'Text Options', items: ['Company name & address', 'Logo inclusion', 'Multi-line text', 'Nepali / English text'] },
      { label: 'Impressions', items: ['10,000+ clear impressions', 'Replaceable ink pad'] },
    ],
    whyChoose:
      'Our self-inking stamps are durable, portable, and refillable — saving you time and money on ink pad replacement. Delivered within 1–2 working days across Nepal.',
    whatYouGet: ['Custom text engraving', 'Replaceable ink cartridge', '1–2 working days turnaround'],
  },
  {
    slug: 'rectangle-self-ink-stamp',
    title: 'RECTANGLE SELF INK STAMP',
    subtitle: 'Rectangular Self-Inking Stamps for Professional Use',
    description:
      'Print City\'s rectangular self-inking stamps are the most popular choice for offices, retail shops, and government offices. They are ideal for address stamps, "PAID", "RECEIVED", "CONFIDENTIAL", and custom office stamps.',
    category: 'stamp-bill-pad',
    options: [
      { label: 'Popular Sizes', items: ['20×38mm', '26×59mm', '37×70mm', '47×80mm', 'Custom sizes'] },
      { label: 'Ink Colours', items: ['Blue', 'Red', 'Black', 'Green', 'Violet'] },
      { label: 'Text Options', items: ['Company name & address', 'Logo inclusion', 'PAID / RECEIVED / CANCELLED', 'Nepali / English text'] },
      { label: 'Impressions', items: ['10,000+ clear impressions', 'Replaceable ink pad'] },
    ],
    whyChoose:
      'Rectangle self-inking stamps are the most versatile office tool. Used by businesses, banks, courts, and schools throughout Nepal. Express delivery available within Kathmandu.',
    whatYouGet: ['Custom text engraving', 'Replaceable ink cartridge', '1–2 working days turnaround'],
  },
  {
    slug: 'b-w-pan-bill-printing',
    title: 'B/W PAN BILL PRINTING',
    subtitle: 'Black & White PAN Bill Printing for Nepali Businesses',
    description:
      'Print City offers professional black and white PAN bill printing for businesses registered under the Inland Revenue Department of Nepal. Our PAN bills are printed in compliance with IRD requirements and are ready for official use.',
    category: 'stamp-bill-pad',
    options: [
      { label: 'Bill Types', items: ['PAN bill (non-VAT)', 'Cash memo / receipt', 'Credit bill', 'Retail bill'] },
      { label: 'Printing', items: ['Black & white single colour', 'Sequential serial numbering'] },
      { label: 'Sizes', items: ['A5 (standard)', 'A4', 'Custom sizes'] },
      { label: 'Copies', items: ['Single copy', 'Duplicate (2-copy NCR)', 'Triplicate (3-copy NCR)'] },
    ],
    whyChoose:
      'Our PAN bills meet IRD Nepal format requirements. Available with sequential numbering, booklet binding, and NCR (No Carbon Required) duplicate copies for efficient record-keeping.',
    whatYouGet: ['IRD-compliant PAN bill format', 'Sequential numbering', '2–3 working days turnaround'],
  },
  {
    slug: 'color-pan-bill-printing',
    title: 'COLOR PAN BILL PRINTING',
    subtitle: 'Full Colour PAN Bill Printing with Your Branding',
    description:
      'Stand out from competitors with professionally designed full-colour PAN bills featuring your company logo, brand colours, and contact information. Print City ensures IRD-compliance while delivering visually impressive billing documents.',
    category: 'stamp-bill-pad',
    options: [
      { label: 'Bill Types', items: ['PAN bill (non-VAT)', 'Coloured cash memo', 'Branded receipt', 'Service bill'] },
      { label: 'Printing', items: ['Full colour CMYK', 'Company logo & branding', 'Sequential serial numbering'] },
      { label: 'Sizes', items: ['A5 (standard)', 'A4', 'Custom sizes'] },
      { label: 'Copies', items: ['Single copy', 'Duplicate NCR (2-copy)', 'Triplicate NCR (3-copy)'] },
    ],
    whyChoose:
      'A colourful, branded PAN bill improves your professional image and helps customers recognise your business. All bills printed with IRD-required fields and sequential numbering.',
    whatYouGet: ['Full colour branding + IRD format', 'Sequential numbering', '2–3 working days turnaround'],
  },
  {
    slug: 'b-w-vat-bill-printing',
    title: 'B/W VAT BILL PRINTING',
    subtitle: 'Black & White VAT Bill Printing per IRD Nepal Standards',
    description:
      'Print City prints professional black and white VAT bills for VAT-registered businesses in Nepal. Our VAT bills are formatted in compliance with the Inland Revenue Department (IRD) Nepal requirements — including all mandatory fields.',
    category: 'stamp-bill-pad',
    options: [
      { label: 'Bill Types', items: ['VAT invoice (standard)', 'Tax invoice', 'VAT credit note', 'VAT debit note'] },
      { label: 'Printing', items: ['Black & white single colour', 'IRD-required format', 'Sequential serial numbering'] },
      { label: 'Sizes', items: ['A4 (standard)', 'A5', 'Custom sizes'] },
      { label: 'Copies', items: ['Duplicate NCR (2-copy)', 'Triplicate NCR (3-copy)', 'Single copy'] },
    ],
    whyChoose:
      'All our VAT bills include mandatory IRD fields: VAT number, fiscal year, customer details, and item breakdown. Available as NCR duplicate/triplicate copies for easy record-keeping.',
    whatYouGet: ['IRD-compliant VAT bill format', 'Sequential numbering', '2–3 working days turnaround'],
  },
  {
    slug: 'color-vat-bill-printing',
    title: 'COLOR VAT BILL PRINTING',
    subtitle: 'Full Colour VAT Bill Printing with Company Branding',
    description:
      'Upgrade your billing with full-colour VAT bills that feature your company logo, brand colours, and professional layout. Print City produces IRD-compliant VAT bills that reinforce your brand on every transaction.',
    category: 'stamp-bill-pad',
    options: [
      { label: 'Bill Types', items: ['VAT invoice', 'Tax invoice with logo', 'Branded VAT bill', 'VAT credit / debit note'] },
      { label: 'Printing', items: ['Full colour CMYK + company logo', 'IRD-required VAT format', 'Sequential numbering'] },
      { label: 'Sizes', items: ['A4 (standard)', 'A5', 'Custom sizes'] },
      { label: 'Copies', items: ['Duplicate NCR (2-copy)', 'Triplicate NCR (3-copy)', 'Single copy'] },
    ],
    whyChoose:
      'A professional branded VAT bill builds customer confidence and sets your business apart. We ensure full IRD compliance while delivering visually impressive billing documents.',
    whatYouGet: ['Full colour branding + IRD VAT format', 'Sequential numbering', '2–3 working days turnaround'],
  },

  // ── ID CARD / LANYARD ────────────────────────────────────────
  {
    slug: 'matt-id-card-printing',
    title: 'MATT ID CARD PRINTING',
    subtitle: 'Professional Matte Finish ID Cards for Offices & Schools',
    description:
      'Print City produces high-quality matte finish ID cards for schools, colleges, hospitals, offices, and government organisations across Nepal. Our matte ID cards offer a premium non-glossy look with sharp text and imagery.',
    category: 'id-card-lanyard',
    options: [
      { label: 'Card Size', items: ['CR80 standard (85.6×54mm)', 'Custom sizes available'] },
      { label: 'Material', items: ['0.76mm PVC with matte lamination', 'Matte surface both sides'] },
      { label: 'Printing', items: ['Full colour front & back', 'Photo ID printing', 'Barcode / QR code printing'] },
      { label: 'Optional Features', items: ['Signature strip', 'Magnetic stripe', 'Employee number', 'Department & designation'] },
    ],
    whyChoose:
      'Matte ID cards have a premium feel, reduce fingerprint visibility, and look more formal than glossy cards — ideal for professional organisations and educational institutions.',
    whatYouGet: ['Full colour matte ID card', 'Free artwork template', '2–3 working days turnaround'],
  },
  {
    slug: 'pvc-id-card-printing',
    title: 'PVC ID CARD PRINTING',
    subtitle: 'Durable Glossy PVC ID Cards for Any Organisation',
    description:
      'Print City\'s glossy PVC ID cards are the most popular choice for schools, companies, events, and membership organisations across Nepal. Durable, waterproof, and professionally printed — they last for years.',
    category: 'id-card-lanyard',
    options: [
      { label: 'Card Size', items: ['CR80 standard (85.6×54mm)', 'Custom sizes available'] },
      { label: 'Material', items: ['0.76mm PVC with gloss finish', '1mm thick PVC available'] },
      { label: 'Printing', items: ['Full colour front & back', 'Photo ID printing', 'Barcode / QR code', 'Serial numbering'] },
      { label: 'Optional Features', items: ['Signature strip', 'Magnetic stripe', 'Punch hole for lanyard', 'Hologram overlay'] },
    ],
    whyChoose:
      'PVC ID cards are waterproof, bend-resistant, and maintain vibrant colours for the card\'s full lifespan. Bulk orders from 10 cards with no setup fees. Delivery nationwide.',
    whatYouGet: ['Full colour glossy PVC card', 'Free artwork template', '2–3 working days turnaround'],
  },
  {
    slug: 'rfid-card-printing',
    title: 'RFID CARD PRINTING',
    subtitle: 'Smart RFID & Access Control Cards for Nepal',
    description:
      'Print City produces custom printed RFID cards for access control, attendance systems, hotel key cards, and membership programmes. Our RFID cards combine professional full-colour printing with reliable embedded smart chip technology.',
    category: 'id-card-lanyard',
    options: [
      { label: 'Card Types', items: ['Mifare 1K (13.56 MHz)', 'EM4100 (125 kHz)', 'HID compatible', 'Hotel key card compatible'] },
      { label: 'Applications', items: ['Office access control', 'Attendance systems', 'Hotel room keys', 'Event access cards', 'Library cards'] },
      { label: 'Printing', items: ['Full colour CMYK front & back', 'Photo ID printing', 'Barcode / QR code'] },
      { label: 'Programming', items: ['Pre-encoded cards available', 'Blank (encode yourself)'] },
    ],
    whyChoose:
      'Our RFID cards are compatible with most access control and attendance systems used in Nepal. We offer encoding services in addition to printing for a complete ready-to-use solution.',
    whatYouGet: ['Full colour RFID card', 'Encoding service available', '3–5 working days turnaround'],
  },
  {
    slug: '16mm-lanyard-printing',
    title: '16MM LANYARD PRINTING',
    subtitle: 'Custom 16mm Lanyards for ID Cards & Events',
    description:
      'Print City produces custom printed 16mm lanyards — the slim, lightweight option perfect for ID card holders, event badges, and promotional giveaways. Available in full colour with your logo and text.',
    category: 'id-card-lanyard',
    options: [
      { label: 'Width', items: ['16mm (slim width)'] },
      { label: 'Materials', items: ['Polyester (standard)', 'Nylon', 'Tubular'] },
      { label: 'Printing', items: ['Full colour CMYK all-over print', 'Single colour silk screen', 'Logo + text'] },
      { label: 'Attachments', items: ['Swivel bulldog clip', 'Safety breakaway', 'Badge reel', 'Carabiner hook'] },
    ],
    whyChoose:
      'Minimum order of 50 lanyards. Our 16mm lanyards are lightweight and comfortable for all-day wear — ideal for school ID cards and conference badges. Nationwide delivery available.',
    whatYouGet: ['Full colour lanyard print', 'Attachment hardware included', '5–7 working days turnaround'],
  },
  {
    slug: '20mm-lanyard-printing',
    title: '20MM LANYARD PRINTING',
    subtitle: 'Standard 20mm Lanyards for Corporate & School Use',
    description:
      'The 20mm lanyard is the most popular width for corporate ID cards, school badges, and event credentials. Print City delivers custom printed 20mm lanyards with full-colour branding and your choice of attachment hardware.',
    category: 'id-card-lanyard',
    options: [
      { label: 'Width', items: ['20mm (standard width)'] },
      { label: 'Materials', items: ['Polyester (standard)', 'Nylon', 'Woven (jacquard)'] },
      { label: 'Printing', items: ['Full colour dye sublimation', 'Single colour silk screen', 'Woven logo option'] },
      { label: 'Attachments', items: ['Swivel bulldog clip', 'Safety breakaway', 'Badge reel', 'J-hook', 'Carabiner'] },
    ],
    whyChoose:
      'Most popular lanyard size used by schools, companies, hospitals, and government offices in Nepal. Minimum 50 pieces. Fast 5–7 day turnaround with nationwide delivery.',
    whatYouGet: ['Full colour lanyard print', 'Attachment hardware included', '5–7 working days turnaround'],
  },
  {
    slug: '25mm-lanyard-printing',
    title: '25MM LANYARD PRINTING',
    subtitle: 'Wide 25mm Lanyards for Maximum Branding Impact',
    description:
      'The 25mm lanyard offers the widest print area for maximum brand visibility. Ideal for large events, trade fairs, and corporate occasions where your logo and message need to stand out. Print City delivers vibrant full-colour 25mm lanyards.',
    category: 'id-card-lanyard',
    options: [
      { label: 'Width', items: ['25mm (wide width)'] },
      { label: 'Materials', items: ['Polyester (standard)', 'Nylon premium', 'Woven (jacquard)'] },
      { label: 'Printing', items: ['Full colour dye sublimation (all-over)', 'Woven logo option', 'Embroidered option'] },
      { label: 'Attachments', items: ['Swivel bulldog clip', 'Safety breakaway', 'Badge reel', 'Carabiner', 'Custom attachment'] },
    ],
    whyChoose:
      'With the widest print surface, 25mm lanyards are perfect for large corporate events, trade fairs, and gala dinners where brand presentation matters most. Minimum 50 pieces.',
    whatYouGet: ['Full colour lanyard print', 'Attachment hardware included', '5–7 working days turnaround'],
  },

  // ── BAG PRINT ────────────────────────────────────────────────
  {
    slug: 'fiber-bag-printing-non-woven',
    title: 'FIBER BAG PRINTING (NON-WOVEN)',
    subtitle: 'Eco-Friendly Non-Woven Fiber Bags with Custom Branding',
    description:
      'Print City prints custom branded non-woven fiber bags — the eco-friendly alternative to plastic bags. Perfect for retail shops, supermarkets, events, corporate gifts, and promotional giveaways across Nepal.',
    category: 'bag-print',
    options: [
      { label: 'Material', items: ['80gsm non-woven polypropylene', '100gsm non-woven PP', 'Laminated non-woven'] },
      { label: 'Sizes', items: ['Small (30×25cm)', 'Medium (38×30cm)', 'Large (45×35cm)', 'Custom sizes'] },
      { label: 'Printing', items: ['Single colour screen print', 'Full colour digital print', 'Double-sided printing'] },
      { label: 'Handle Options', items: ['Short loop handles', 'Long shoulder handles', 'Die-cut handles'] },
    ],
    whyChoose:
      'Non-woven bags are reusable, lightweight, and far stronger than plastic bags. Our fiber bags withstand 5–10kg of load. Minimum 100 bags with bulk discounts from 500 units. Nationwide delivery.',
    whatYouGet: ['Custom printed eco bag', 'Free artwork check', '5–7 working days turnaround'],
  },
  {
    slug: 'paper-bag',
    title: 'PAPER BAG PRINTING',
    subtitle: 'Premium Paper Bags for Retail, Gifting & Branding',
    description:
      'Elevate your brand with custom printed paper bags. Print City produces high-quality kraft and art paper bags for retail shops, boutiques, bakeries, gift shops, and corporate events across Nepal.',
    category: 'bag-print',
    options: [
      { label: 'Materials', items: ['120gsm kraft paper', '150gsm art paper', '170gsm coated paper', 'Recycled kraft available'] },
      { label: 'Sizes', items: ['Small (18×8×22cm)', 'Medium (25×11×30cm)', 'Large (32×12×40cm)', 'Custom sizes'] },
      { label: 'Printing', items: ['Full colour CMYK', 'Single colour logo print', 'Foil stamping available'] },
      { label: 'Handle Options', items: ['Twisted paper rope handle', 'Flat ribbon handle', 'Cotton cord handle', 'Die-cut handle'] },
    ],
    whyChoose:
      'Paper bags project a premium, eco-conscious brand image. Our bags use food-safe inks and strong gluing to handle retail loads. Minimum 100 bags with bulk discounts available.',
    whatYouGet: ['Full colour paper bag print', 'Free artwork check', '7–10 working days turnaround'],
  },

  // ── APPAREL PRINTING ─────────────────────────────────────────
  {
    slug: 't-shirt-printing',
    title: 'T-SHIRT PRINTING',
    subtitle: 'Custom T-Shirt Printing for Teams, Events & Brands',
    description:
      'From corporate uniforms and team jerseys to event merchandise and promotional giveaways, Print City delivers high-quality custom T-shirt printing using DTG, screen printing, and heat transfer methods across Nepal.',
    category: 'apparel-printing',
    options: [
      { label: 'Printing Methods', items: ['DTG (Direct-to-Garment)', 'Screen printing', 'Heat transfer vinyl', 'Sublimation (polyester)'] },
      { label: 'Fabric Types', items: ['100% cotton (180gsm)', 'Polyester blend', 'Dry-fit performance fabric'] },
      { label: 'Sizes Available', items: ['XS to 5XL', 'Kids sizes available', 'Custom fit available'] },
      { label: 'Print Colours', items: ['Full colour CMYK', 'Pantone-matched available', 'Glow-in-dark / reflective'] },
    ],
    whyChoose:
      'Minimum 10 pieces per order. We offer free sample prints for bulk orders and Pantone-accurate colour matching for brand consistency. Event and deadline printing with express options available.',
    whatYouGet: ['Full colour garment printing', 'Free artwork check', '5–7 working days turnaround'],
  },
  {
    slug: 'tote-bag-printing',
    title: 'TOTE BAG PRINTING',
    subtitle: 'Eco-Friendly Custom Tote Bags for Promotions & Gifting',
    description:
      'Promote your brand sustainably with custom-printed tote bags. Reusable, eco-friendly, and highly visible — printed tote bags are perfect for retail, events, corporate gifts, and giveaways across Nepal.',
    category: 'apparel-printing',
    options: [
      { label: 'Materials', items: ['Natural cotton canvas', 'Jute tote bags', 'Non-woven polypropylene', '12oz heavy cotton'] },
      { label: 'Printing Methods', items: ['Screen printing', 'DTG digital print', 'Heat transfer', 'Embroidery'] },
      { label: 'Sizes', items: ['Standard 38×42cm', 'Large 42×48cm', 'Custom sizes'] },
      { label: 'Handle Options', items: ['Short cotton handles', 'Long shoulder strap', 'Custom handle length'] },
    ],
    whyChoose:
      'Minimum 50 tote bags. Bulk discounts for 500+ units. Eco-certified materials available on request. These bags last for years and keep your brand visible long after the event.',
    whatYouGet: ['Full colour tote bag printing', 'Free artwork check', '5–7 working days turnaround'],
  },
  {
    slug: 'sacks-printing',
    title: 'SACKS PRINTING',
    subtitle: 'Custom Printed Sacks for Agriculture, Industry & Branding',
    description:
      'Print City offers custom printed sacks for agriculture, food packaging, construction materials, and industrial use. We print on polypropylene (PP) woven sacks, jute sacks, and BOPP laminated sacks with your branding.',
    category: 'apparel-printing',
    options: [
      { label: 'Sack Types', items: ['PP woven sacks', 'BOPP laminated sacks', 'Jute sacks', 'Non-woven sacks'] },
      { label: 'Capacities', items: ['5kg', '10kg', '25kg', '50kg', 'Custom sizes'] },
      { label: 'Printing', items: ['Full colour CMYK on BOPP laminated', 'Single / two colour on PP woven', 'Logo & product information'] },
      { label: 'Applications', items: ['Rice / grain sacks', 'Cement sacks', 'Animal feed', 'Fertiliser sacks', 'Food packaging'] },
    ],
    whyChoose:
      'Our printed sacks are manufactured to exact weight capacity specifications with UV-stable inks. Widely used by agricultural businesses, food processors, and construction suppliers across Nepal.',
    whatYouGet: ['Custom printed sack', 'Durable UV-resistant print', 'Minimum order & turnaround discussed per project'],
  },
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return SERVICES.find(s => s.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return SERVICES.map(s => s.slug);
}

export { SERVICES };
