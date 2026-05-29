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
  // ── Digital Print ──────────────────────────────────────
  {
    slug: 'flyer-printing',
    title: 'FLYER PRINTING',
    subtitle: 'Professional Flyer Printing at Competitive Prices',
    description:
      'Print City offers high-quality flyer printing at competitive prices. Whether you need promotional flyers for a product launch, event marketing, or brand awareness campaign, our full-colour digital and offset printing delivers sharp, vibrant results every time.',
    category: 'digital-print',
    options: [
      { label: 'Sizes Available', items: ['A4', 'A5', 'A6', 'DL', 'Custom sizes'] },
      { label: 'Paper Stocks', items: ['128gsm gloss art card', '260gsm art card', '310gsm art card'] },
      { label: 'Finishing Options', items: ['Gloss / matte lamination', 'Spot UV', 'Embossing', 'Die-cut'] },
      { label: 'Printing', items: ['Double-sided full colour at no extra charge'] },
    ],
    whyChoose:
      'With express turnaround as fast as 24 hours, free artwork checks, and nationwide delivery, Print City is trusted by businesses large and small. From 100 copies to 100,000 — we handle every order with care and precision.',
    whatYouGet: ['Full colour CMYK printing', 'Free artwork check before printing', '3–5 working days turnaround'],
  },
  {
    slug: 'brochure-printing',
    title: 'BROCHURE PRINTING',
    subtitle: 'Premium Brochure Printing for Every Business',
    description:
      'Make a lasting impression with professionally printed brochures. From tri-fold leaflets to multi-page booklets, Print City delivers crisp, full-colour brochures that showcase your brand beautifully.',
    category: 'digital-print',
    options: [
      { label: 'Sizes Available', items: ['A4', 'A5', 'DL', 'Custom sizes'] },
      { label: 'Fold Types', items: ['Bi-fold', 'Tri-fold', 'Z-fold', 'Gate fold'] },
      { label: 'Paper Stocks', items: ['130gsm gloss art paper', '200gsm art card', '300gsm art card'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Spot UV', 'Soft-touch coating'] },
    ],
    whyChoose:
      'Our state-of-the-art digital presses ensure consistent colour accuracy across every brochure. We offer free design consultation and fast turnaround to meet your campaign deadlines.',
    whatYouGet: ['Full colour CMYK printing', 'Free artwork check', '3–5 working days turnaround'],
  },
  {
    slug: 'name-card-printing',
    title: 'NAME CARD PRINTING',
    subtitle: 'Standout Business Cards That Make an Impression',
    description:
      'First impressions matter. Print City produces premium business name cards with luxurious finishes and precise die-cutting, so your card stands out in every meeting and networking event.',
    category: 'digital-print',
    options: [
      { label: 'Standard Size', items: ['90mm × 54mm (standard)', 'Custom sizes available'] },
      { label: 'Paper Stocks', items: ['310gsm art card', '350gsm art card', '600gsm ultra-thick'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Spot UV', 'Embossing', 'Foil stamping', 'Rounded corners'] },
      { label: 'Printing', items: ['Single-sided or double-sided', 'Full colour CMYK'] },
    ],
    whyChoose:
      'From minimalist monochrome to full-bleed colour, we bring your brand identity to life on every card. Express options available for next-day delivery.',
    whatYouGet: ['Premium cardstock printing', 'Free artwork check', '2–3 working days turnaround'],
  },
  {
    slug: 'sticker-printing',
    title: 'STICKER PRINTING',
    subtitle: 'Custom Stickers for Branding, Packaging & More',
    description:
      'Print City prints custom stickers in any shape and size — from product labels and promotional stickers to waterproof outdoor stickers. Full colour, sharp edges, and durable materials guaranteed.',
    category: 'digital-print',
    options: [
      { label: 'Shapes', items: ['Round', 'Square', 'Rectangle', 'Custom die-cut', 'Kiss-cut sheets'] },
      { label: 'Materials', items: ['Gloss vinyl', 'Matte vinyl', 'Transparent vinyl', 'Waterproof vinyl'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Spot UV'] },
      { label: 'Sizes', items: ['Any size — minimum 30mm', 'Custom dimensions on request'] },
    ],
    whyChoose:
      'Our stickers are UV-resistant, waterproof, and scratch-proof — perfect for indoor and outdoor use. Minimum order from just 50 pieces.',
    whatYouGet: ['Full colour CMYK printing', 'Free artwork check', '3–5 working days turnaround'],
  },
  {
    slug: 'booklet-printing',
    title: 'BOOKLET PRINTING',
    subtitle: 'Professional Booklets, Catalogs & Manuals',
    description:
      'From product catalogues and training manuals to event programmes, Print City produces perfectly bound booklets with crisp text and vivid images throughout.',
    category: 'digital-print',
    options: [
      { label: 'Sizes', items: ['A4', 'A5', 'Square', 'Custom sizes'] },
      { label: 'Binding Options', items: ['Saddle-stitch (stapled)', 'Perfect-bound (glue)', 'Wire-O binding', 'Spiral binding'] },
      { label: 'Paper', items: ['100gsm uncoated', '130gsm gloss/matte art paper', '200gsm cover'] },
      { label: 'Page Count', items: ['Minimum 8 pages', 'Up to 300+ pages'] },
    ],
    whyChoose:
      'We handle complete booklet production from print to binding. High-volume pricing available for 500+ copies with fast dispatch.',
    whatYouGet: ['Full colour cover & inner pages', 'Free artwork check', '5–7 working days turnaround'],
  },
  {
    slug: 'postcard-printing',
    title: 'POSTCARD PRINTING',
    subtitle: 'High-Quality Postcards for Marketing & Greetings',
    description:
      'Deliver your message in style with premium postcards. Ideal for direct mail campaigns, thank-you cards, promotional mailers, and event invitations.',
    category: 'digital-print',
    options: [
      { label: 'Standard Sizes', items: ['A6 (148×105mm)', 'DL (210×99mm)', '4R (152×102mm)', 'Custom'] },
      { label: 'Paper Stocks', items: ['310gsm art card', '350gsm art card'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Spot UV'] },
      { label: 'Printing', items: ['Double-sided full colour'] },
    ],
    whyChoose:
      'Vibrant colours, crisp text, and sturdy card stock make our postcards the perfect marketing tool. Order as few as 100 pieces.',
    whatYouGet: ['Full colour CMYK printing', 'Free artwork check', '3–5 working days turnaround'],
  },
  {
    slug: 'ticket-voucher-printing',
    title: 'TICKET & VOUCHER PRINTING',
    subtitle: 'Secure, Customised Tickets & Vouchers',
    description:
      'From event tickets with sequential numbering to gift vouchers with unique codes, Print City produces tamper-evident, professionally printed tickets and vouchers for every occasion.',
    category: 'digital-print',
    options: [
      { label: 'Types', items: ['Event tickets', 'Raffle tickets', 'Gift vouchers', 'Admission passes'] },
      { label: 'Features', items: ['Sequential numbering', 'Barcode / QR code', 'Perforated tear-off', 'Security holograms'] },
      { label: 'Paper Stocks', items: ['200gsm art card', '300gsm art card', 'Synthetic waterproof'] },
      { label: 'Sizes', items: ['Standard DL', 'A6', 'Custom'] },
    ],
    whyChoose:
      'Our tickets include optional security features to prevent fraud. Available with fast 24-hour express turnaround for last-minute events.',
    whatYouGet: ['Full colour CMYK printing', 'Free artwork check', '3–5 working days turnaround'],
  },
  {
    slug: 'calendar-printing',
    title: 'CALENDAR PRINTING',
    subtitle: 'Custom Calendars for Business & Gifting',
    description:
      'Keep your brand visible year-round with custom-printed calendars. Perfect for corporate gifting, promotional giveaways, or retail sale — personalised with your logo, imagery, and branding.',
    category: 'digital-print',
    options: [
      { label: 'Types', items: ['Wall calendars', 'Desk calendars', 'Pocket calendars', 'Planner calendars'] },
      { label: 'Sizes', items: ['A2', 'A3', 'A4', 'A5', 'Custom'] },
      { label: 'Binding', items: ['Wire-O', 'Spiral', 'Saddle-stitch'] },
      { label: 'Paper', items: ['130gsm gloss art paper', '200gsm cover pages'] },
    ],
    whyChoose:
      'Fully customisable month layouts with your photos, events, and branding. Bulk discounts from 50 units. Delivered Australia-wide.',
    whatYouGet: ['Full colour printing', 'Free artwork check', '5–7 working days turnaround'],
  },
  {
    slug: 'corporate-folder-printing',
    title: 'CORPORATE FOLDER PRINTING',
    subtitle: 'Branded Presentation Folders for a Professional Touch',
    description:
      'Make every client meeting count with premium printed corporate folders. Showcase your professionalism and keep documents organised with custom-branded presentation folders.',
    category: 'digital-print',
    options: [
      { label: 'Sizes', items: ['A4 (standard)', 'A5', 'Custom sizes'] },
      { label: 'Paper Stocks', items: ['350gsm art card', '400gsm art card'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Spot UV', 'Foil stamping', 'Embossing'] },
      { label: 'Features', items: ['Business card slot', 'CD pocket', 'Custom die-cut pockets'] },
    ],
    whyChoose:
      'Our corporate folders are sturdy, elegantly finished, and tailored to your brand identity. Premium finishes available for executive presentations.',
    whatYouGet: ['Full colour CMYK printing', 'Free artwork check', '5–7 working days turnaround'],
  },
  {
    slug: 'tissue-printing',
    title: 'TISSUE PRINTING',
    subtitle: 'Custom Printed Tissues for Events & Promotions',
    description:
      'Branded tissue packets are one of the most effective and low-cost promotional tools. Print City offers high-quality custom tissue printing for marketing campaigns, events, and daily brand exposure.',
    category: 'digital-print',
    options: [
      { label: 'Packet Sizes', items: ['Pocket tissue (10 sheets)', 'Box tissue', 'Table tissue'] },
      { label: 'Printing', items: ['Full colour on wrapper', 'Single or double-sided'] },
      { label: 'Minimum Order', items: ['500 packets and above'] },
      { label: 'Tissue Quality', items: ['3-ply soft tissue', 'Odour-free certified'] },
    ],
    whyChoose:
      'Distributed at events, in retail outlets, or as direct mail inserts, branded tissues deliver lasting impressions at minimal cost per unit.',
    whatYouGet: ['Full colour wrapper printing', 'Free artwork check', '5–7 working days turnaround'],
  },
  {
    slug: 'customised-print',
    title: 'CUSTOMISED PRINT',
    subtitle: 'Bespoke Printing Solutions for Any Need',
    description:
      'Have a unique printing requirement? Print City handles fully customised print projects — from unusual sizes and specialty substrates to complex finishing. Tell us what you need and we\'ll make it happen.',
    category: 'digital-print',
    options: [
      { label: 'Substrates', items: ['Paper', 'Cardstock', 'Vinyl', 'Fabric', 'Synthetic'] },
      { label: 'Finishing', items: ['Any standard or specialty finish on request'] },
      { label: 'Sizes', items: ['Fully custom — any dimension'] },
      { label: 'Quantities', items: ['From 1 unit to 1,000,000+'] },
    ],
    whyChoose:
      'Our experienced team will advise on the best materials and methods for your unique project. Request a free consultation and quote today.',
    whatYouGet: ['Custom specifications', 'Free consultation & artwork check', 'Turnaround discussed per project'],
  },

  // ── Large Format ───────────────────────────────────────
  {
    slug: 'poster-printing',
    title: 'POSTER PRINTING',
    subtitle: 'Large Format Poster Printing for Maximum Impact',
    description:
      'Command attention with vibrant, large-format poster printing. Perfect for retail promotions, events, exhibitions, and corporate spaces — our posters deliver bold colour and sharp detail at any size.',
    category: 'large-format',
    options: [
      { label: 'Sizes', items: ['A1', 'A0', 'B1', 'B0', 'Custom sizes'] },
      { label: 'Paper Stocks', items: ['170gsm satin photo paper', '200gsm gloss art paper', 'Backlit film'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Mounted on foam board', 'Framed options'] },
      { label: 'Indoor / Outdoor', items: ['Indoor paper posters', 'Outdoor weatherproof vinyl'] },
    ],
    whyChoose:
      'We use wide-format printers to deliver stunning colour accuracy on oversized prints. Same-day printing available for urgent campaigns.',
    whatYouGet: ['Full colour printing', 'Free artwork check', '1–3 working days turnaround'],
  },
  {
    slug: 'pull-up-banner',
    title: 'PULL UP BANNER',
    subtitle: 'Retractable Pull-Up Banners for Events & Exhibitions',
    description:
      'Portable, professional, and reusable — pull-up banners are the go-to display solution for trade shows, conferences, retail stores, and corporate events. Set up in seconds, pack away effortlessly.',
    category: 'large-format',
    options: [
      { label: 'Standard Sizes', items: ['850×2000mm', '1000×2000mm', '1200×2000mm'] },
      { label: 'Materials', items: ['Premium polyester film', 'Gloss / matte options'] },
      { label: 'Stand Options', items: ['Aluminium retractable base', 'Heavy-duty premium stand'] },
      { label: 'Includes', items: ['Carrying bag', 'Base + graphic'] },
    ],
    whyChoose:
      'Our pull-up banners are lightweight, durable, and print-ready within 24 hours. Replacement graphics available when you rebrand.',
    whatYouGet: ['Full colour graphic print', 'Free artwork check', '1–2 working days turnaround'],
  },
  {
    slug: 'pop-up-display',
    title: 'POP UP DISPLAY',
    subtitle: 'Curved & Straight Pop-Up Display Systems',
    description:
      'Create a dramatic backdrop for exhibitions, roadshows, and conferences with a Pop-Up Display. Quick to assemble and impactful from any angle — ideal for maximising your booth presence.',
    category: 'large-format',
    options: [
      { label: 'Sizes', items: ['3×3 panel', '5×3 panel', '7×3 panel', 'Custom'] },
      { label: 'Shape', items: ['Straight', 'Curved'] },
      { label: 'Graphics', items: ['Magnetic velcro-attached panels', 'Fabric printing'] },
      { label: 'Includes', items: ['Aluminium frame', 'Printed graphic panels', 'Carry bag'] },
    ],
    whyChoose:
      'Tool-free setup in under 5 minutes. Our pop-up displays are built for repeated use across multiple events, saving you cost long-term.',
    whatYouGet: ['Full colour panel printing', 'Free artwork check', '3–5 working days turnaround'],
  },
  {
    slug: 'floor-sticker-printing',
    title: 'FLOOR STICKER PRINTING',
    subtitle: 'Anti-Slip Floor Graphics for Retail & Events',
    description:
      'Guide customers, promote products, and reinforce brand messaging right underfoot. Our anti-slip floor stickers are durable, easy to apply, and safe for high-traffic areas.',
    category: 'large-format',
    options: [
      { label: 'Material', items: ['Anti-slip vinyl with laminate', 'Conformable floor film'] },
      { label: 'Sizes', items: ['Standard A3, A2, A1', 'Custom shapes and sizes'] },
      { label: 'Environments', items: ['Retail floors', 'Shopping centres', 'Exhibitions', 'Outdoor pavement'] },
      { label: 'Safety', items: ['R10 anti-slip rated', 'Suitable for wet surfaces'] },
    ],
    whyChoose:
      'Our floor stickers comply with safety standards and are removable without leaving residue, making them ideal for temporary promotions.',
    whatYouGet: ['Full colour floor graphic', 'Free artwork check', '2–3 working days turnaround'],
  },
  {
    slug: 'display-standee',
    title: 'DISPLAY STANDEE',
    subtitle: 'Life-Size & Custom Standees for Promotions',
    description:
      'Create a striking in-store or event presence with custom display standees. From life-size character cut-outs to branded product displays, our standees draw crowds and capture attention.',
    category: 'large-format',
    options: [
      { label: 'Types', items: ['Life-size standee', 'A-frame standee', 'L-shaped standee', 'Counter standee'] },
      { label: 'Material', items: ['5mm foam board', '3mm PVC board', 'Corrugated plastic'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Custom die-cut shape'] },
      { label: 'Sizes', items: ['Up to 2.4m tall', 'Custom dimensions'] },
    ],
    whyChoose:
      'We offer custom die-cutting to any shape, ensuring your standee matches your design perfectly. Ideal for product launches and promotional campaigns.',
    whatYouGet: ['Full colour printing', 'Free artwork check', '3–5 working days turnaround'],
  },
  {
    slug: 'posm-display',
    title: 'POSM DISPLAY',
    subtitle: 'Point-of-Sale Materials for In-Store Marketing',
    description:
      'Boost in-store sales with eye-catching POSM (Point-of-Sale Materials). Print City produces a full range of POS display materials tailored to your retail environment and brand guidelines.',
    category: 'large-format',
    options: [
      { label: 'Products', items: ['Shelf talkers', 'Wobblers', 'Counter cards', 'Hanging mobiles', 'Shelf strips'] },
      { label: 'Materials', items: ['Art card', 'PVC', 'Corrugated board'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Spot UV', 'Die-cut'] },
      { label: 'Custom', items: ['3D displays', 'CDU (Counter Display Units)', 'Dump bins'] },
    ],
    whyChoose:
      'Our POSM solutions are designed to convert browsers into buyers. We work with your retail team to ensure every piece fits perfectly in your planogram.',
    whatYouGet: ['Full colour CMYK printing', 'Free artwork check', '5–7 working days turnaround'],
  },
  {
    slug: 'installation-service',
    title: 'INSTALLATION SERVICE',
    subtitle: 'Professional Print Installation Across the Region',
    description:
      'Print City offers end-to-end installation services for large-format graphics, wall wraps, window graphics, and more. Our experienced installers ensure a flawless finish every time.',
    category: 'large-format',
    options: [
      { label: 'Installation Types', items: ['Wall wraps & murals', 'Window graphics', 'Vehicle wraps', 'Hoarding graphics', 'Building wraps'] },
      { label: 'Locations', items: ['Retail stores', 'Offices', 'Events', 'Outdoor signage'] },
      { label: 'Materials', items: ['Cast vinyl', 'Calendered vinyl', 'Mesh banners'] },
      { label: 'Service', items: ['Survey & site visit available', 'Weekend & after-hours installation'] },
    ],
    whyChoose:
      'Our trained installation team handles jobs of any scale — from a single window decal to a full building wrap — delivering precision and speed.',
    whatYouGet: ['Full colour print + installation', 'Site survey available', 'Turnaround discussed per project'],
  },

  // ── Events ─────────────────────────────────────────────
  {
    slug: 'stage-backdrop',
    title: 'STAGE BACKDROP',
    subtitle: 'Custom Stage Backdrops for Events & Performances',
    description:
      'Make your stage come alive with a stunning custom backdrop. From conferences and concerts to award nights and product launches, Print City delivers large-format backdrops with vivid colour and sharp imagery.',
    category: 'events',
    options: [
      { label: 'Materials', items: ['280gsm polyester fabric', 'Vinyl banner', 'Backlit fabric'] },
      { label: 'Sizes', items: ['Up to 10m wide', 'Any custom dimension'] },
      { label: 'Mounting', items: ['Pipe & drape system', 'Pop-up frame', 'Truss system'] },
      { label: 'Finishing', items: ['Hemmed edges', 'Grommets', 'Velcro strip'] },
    ],
    whyChoose:
      'We produce wrinkle-resistant fabric backdrops that look professional on camera and in person. Rush printing available within 24 hours.',
    whatYouGet: ['Full colour printing', 'Free artwork check', '2–3 working days turnaround'],
  },
  {
    slug: '3d-cube-printing',
    title: '3D CUBE PRINTING',
    subtitle: 'Eye-Catching 3D Cube Displays for Events',
    description:
      'Stand out on the event floor with custom 3D cube displays. These geometric structures create 360° brand visibility and are perfect for product showcases, photo booths, and exhibition setups.',
    category: 'events',
    options: [
      { label: 'Sizes', items: ['500mm cube', '1000mm cube', '1500mm cube', 'Custom'] },
      { label: 'Materials', items: ['Aluminium frame', 'Printed fabric or vinyl panels'] },
      { label: 'Print Sides', items: ['4-sided', '5-sided (with top)', '6-sided (full wrap)'] },
      { label: 'Assembly', items: ['Tool-free snap-fit assembly', 'Carry bag included'] },
    ],
    whyChoose:
      'Lightweight yet sturdy, our 3D cubes are reusable and can be reconfigured for multiple events. Graphic panels can be swapped for new campaigns.',
    whatYouGet: ['Full colour panel printing', 'Free artwork check', '3–5 working days turnaround'],
  },
  {
    slug: 'diecut-standee',
    title: 'DIECUT STANDEE',
    subtitle: 'Custom Die-Cut Standees for Events & Retail',
    description:
      'Create maximum visual impact with custom-shaped die-cut standees. Ideal for brand mascots, product cut-outs, event characters, and interactive photo opportunities at exhibitions and promotions.',
    category: 'events',
    options: [
      { label: 'Shapes', items: ['Any custom shape', 'Character cut-outs', 'Product silhouettes'] },
      { label: 'Materials', items: ['5mm foam board', 'Corriboard', 'Acrylic'] },
      { label: 'Heights', items: ['Tabletop (up to 30cm)', 'Floor-standing (up to 2.4m)'] },
      { label: 'Finish', items: ['Gloss / matte lamination', 'Full-colour print'] },
    ],
    whyChoose:
      'Our precision die-cutting machines handle the most complex shapes with clean, sharp edges. Ideal for photo booths and immersive brand experiences.',
    whatYouGet: ['Full colour printing', 'Free artwork check', '3–5 working days turnaround'],
  },
  {
    slug: 'events-exhibition-setup',
    title: 'EVENTS & EXHIBITION SETUP',
    subtitle: 'Complete Event Display & Exhibition Solutions',
    description:
      'Print City provides a one-stop solution for event and exhibition printing — from display systems and signage to branded materials and on-site installation. We make your booth the highlight of the show.',
    category: 'events',
    options: [
      { label: 'Display Systems', items: ['Pop-up displays', 'Modular exhibition stands', 'Tension fabric systems'] },
      { label: 'Signage', items: ['Directional signage', 'Stage backdrops', 'Floor graphics'] },
      { label: 'Print Materials', items: ['Brochures', 'Name cards', 'Bags', 'Banners'] },
      { label: 'Services', items: ['Delivery to venue', 'On-site installation', 'Post-event collection'] },
    ],
    whyChoose:
      'With a single point of contact for all your event print needs, we streamline the process so you can focus on what matters — connecting with your audience.',
    whatYouGet: ['Full print & installation package', 'Free consultation', 'Turnaround discussed per event'],
  },

  // ── Apparel ────────────────────────────────────────────
  {
    slug: 't-shirt-printing',
    title: 'T-SHIRT PRINTING',
    subtitle: 'Custom T-Shirt Printing for Events, Teams & Brands',
    description:
      'From corporate uniforms and team jerseys to event merchandise and branded giveaways, Print City delivers high-quality custom T-shirt printing using DTG, screen printing, and heat transfer methods.',
    category: 'apparel',
    options: [
      { label: 'Printing Methods', items: ['DTG (Direct-to-Garment)', 'Screen printing', 'Heat transfer', 'Sublimation'] },
      { label: 'Fabric', items: ['100% cotton', 'Polyester blend', 'Dry-fit performance'] },
      { label: 'Sizes', items: ['XS to 5XL', 'Kids sizes available'] },
      { label: 'Colours', items: ['Full colour print', 'Pantone-matched available'] },
    ],
    whyChoose:
      'Minimum 10 pieces per order. We offer free sample prints for bulk orders and provide Pantone-accurate colour matching for brand consistency.',
    whatYouGet: ['Full colour garment printing', 'Free artwork check', '5–7 working days turnaround'],
  },
  {
    slug: 'tote-bag-printing',
    title: 'TOTE BAG PRINTING',
    subtitle: 'Eco-Friendly Custom Tote Bags for Promotions',
    description:
      'Promote your brand sustainably with custom-printed tote bags. Reusable, eco-friendly, and highly visible — printed tote bags are perfect for retail, events, corporate gifts, and giveaways.',
    category: 'apparel',
    options: [
      { label: 'Materials', items: ['Natural cotton canvas', 'Non-woven polypropylene', 'Jute'] },
      { label: 'Printing Methods', items: ['Screen printing', 'DTG', 'Heat transfer'] },
      { label: 'Sizes', items: ['Standard 38×42cm', 'Large 42×48cm', 'Custom'] },
      { label: 'Handles', items: ['Short cotton handles', 'Long shoulder strap', 'Custom length'] },
    ],
    whyChoose:
      'Minimum 50 bags per order. Bulk discounts for 500+ units. Eco-certified materials available on request.',
    whatYouGet: ['Full colour bag printing', 'Free artwork check', '5–7 working days turnaround'],
  },

  // ── Product Packaging ──────────────────────────────────
  {
    slug: 'product-packaging-box-printing',
    title: 'PRODUCT PACKAGING & BOX PRINTING',
    subtitle: 'Custom Packaging That Elevates Your Brand',
    description:
      'Your packaging is the first thing customers touch. Print City produces premium custom boxes and product packaging that reinforce your brand value and protect your products beautifully.',
    category: 'product-packaging',
    options: [
      { label: 'Box Types', items: ['Folding cartons', 'Rigid boxes', 'Mailer boxes', 'Sleeve boxes', 'Display boxes'] },
      { label: 'Materials', items: ['Coated cardboard', 'Kraft board', 'Corrugated board', 'Rigid chipboard'] },
      { label: 'Printing', items: ['Full colour CMYK + Pantone', 'Inside & outside printing'] },
      { label: 'Finishing', items: ['Gloss / matte lamination', 'Spot UV', 'Hot foil stamping', 'Embossing', 'Soft-touch coating'] },
    ],
    whyChoose:
      'Structural design and dieline creation included. We work with brands from prototype to mass production, ensuring every box meets your exact specifications.',
    whatYouGet: ['Custom box design & print', 'Free dieline creation', '7–10 working days turnaround'],
  },

  // ── Logo Print ─────────────────────────────────────────
  {
    slug: 'logo-printing',
    title: 'LOGO PRINTING',
    subtitle: 'Brand Logo Printing on Any Surface or Material',
    description:
      'Get your logo printed on virtually any surface — from merchandise and apparel to signage and packaging. Print City offers logo printing with precise colour matching to keep your brand consistent across every touchpoint.',
    category: 'logo-print',
    options: [
      { label: 'Surfaces', items: ['Fabric & apparel', 'Hard surfaces (acrylic, metal)', 'Paper & cardstock', 'Vinyl & signage'] },
      { label: 'Methods', items: ['Digital print', 'Screen print', 'Embroidery', 'Laser engraving', 'Foil stamping'] },
      { label: 'Colour Matching', items: ['Pantone / PMS matching', 'CMYK full colour'] },
      { label: 'File Formats', items: ['AI, EPS, PDF vector preferred', 'High-res PNG accepted'] },
    ],
    whyChoose:
      'Our colour management team ensures your logo looks identical whether it\'s on a business card, a banner, or a T-shirt. Free colour proof provided.',
    whatYouGet: ['Colour-accurate logo reproduction', 'Free artwork check & colour proof', 'Turnaround per product type'],
  },

  // ── 3D Print ───────────────────────────────────────────
  {
    slug: '3d-printing-service',
    title: '3D PRINTING SERVICE',
    subtitle: 'Professional 3D Printing for Prototypes & Models',
    description:
      'Bring your ideas to life with Print City\'s professional 3D printing service. From product prototypes and architectural models to custom signage letters and display props — we print in high resolution with a range of materials.',
    category: '3d-print',
    options: [
      { label: 'Technologies', items: ['FDM (Fused Deposition Modelling)', 'SLA (Resin) for fine detail', 'SLS for functional parts'] },
      { label: 'Materials', items: ['PLA', 'ABS', 'Resin', 'Nylon', 'PETG'] },
      { label: 'Finishing', items: ['Sanding & polishing', 'Painting & coating', 'Post-cure for resin'] },
      { label: 'File Formats', items: ['STL', 'OBJ', 'STEP', '3MF'] },
    ],
    whyChoose:
      'Whether you need a single prototype or a short production run, our 3D printing team delivers precision parts with fast turnaround and expert finishing.',
    whatYouGet: ['High-resolution 3D print', 'Free design review', '3–7 working days turnaround'],
  },
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return SERVICES.find(s => s.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return SERVICES.map(s => s.slug);
}

export { SERVICES };
