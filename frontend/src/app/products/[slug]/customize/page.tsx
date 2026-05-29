'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, RotateCcw, Eye, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ToolsPanel from '@/components/customizer/ToolsPanel';
import OptionsPanel, { PricingBreakdown } from '@/components/customizer/OptionsPanel';
import { productsApi, cartApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { toast } from 'sonner';
import type { CanvasHandle, DesignElement, PrintAreaDef } from '@/components/customizer/DesignCanvas';

// SSR-incompatible — load only on client
const DesignCanvas = dynamic(() => import('@/components/customizer/DesignCanvas'), { ssr: false });

// ── Print-cost lookup ──────────────────────────────────────────────────────────
const PRINT_COST_PER_SIDE: Record<string, number> = {
  DTG: 200,
  'Screen Printing': 150,
  Embroidery: 350,
  Sublimation: 180,
  'UV Printing': 220,
  'Laser Engraving': 280,
};
const SETUP_COST = 200;

function calcPricing(basePrice: number, printMethod: string, sides: number, qty: number): PricingBreakdown {
  const perSide = PRINT_COST_PER_SIDE[printMethod] ?? 200;
  const subtotal = (basePrice + perSide * sides) * qty + SETUP_COST;
  let discountRate = 0;
  if (qty >= 50) discountRate = 0.15;
  else if (qty >= 25) discountRate = 0.10;
  else if (qty >= 10) discountRate = 0.05;
  const discount = Math.round(subtotal * discountRate);
  return {
    basePrice,
    printCost: perSide * sides * qty,
    setupCost: SETUP_COST,
    discount,
    total: subtotal - discount,
  };
}

function nextId() {
  return `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

const CANVAS_W = 500;
const CANVAS_H = 500;

const DEFAULT_PRINT_AREA: PrintAreaDef = { x: 25, y: 20, width: 50, height: 55 };

export default function CustomizePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const canvasRef = useRef<CanvasHandle>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'front' | 'back' | 'sleeve'>('front');

  // Options state
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [printMethod, setPrintMethod] = useState('DTG');
  const [selectedSides, setSelectedSides] = useState<string[]>(['front']);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    productsApi.get(slug).then(({ data }) => {
      const p = data.data as Product;
      setProduct(p);
      if (p.mockupImages?.[0]) {
        setSelectedColor(p.mockupImages[0].color);
      } else if (p.variants?.[0]) {
        setSelectedColor(p.variants[0].color);
      }
      if (p.variants?.[0]) setSelectedSize(p.variants[0].size);
      if (p.availablePrintMethods?.[0]) setPrintMethod(p.availablePrintMethods[0]);
      if (p.printAreas?.front) setSelectedSides(['front']);
    }).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [slug]);

  const currentMockup = product?.mockupImages?.find(m => m.color === selectedColor);
  const mockupUrl = currentMockup?.[view as keyof typeof currentMockup] as string | undefined
    ?? currentMockup?.front
    ?? product?.images?.[0]?.url
    ?? '';

  const printAreaDef: PrintAreaDef = (product?.printAreas as any)?.[view] ?? DEFAULT_PRINT_AREA;

  const selectedVariant = product?.variants?.find(
    v => v.color === selectedColor && v.size === selectedSize,
  );

  const basePrice = Number(selectedVariant?.price ?? product?.basePrice ?? 0);
  const pricing = calcPricing(basePrice, printMethod, selectedSides.length, qty);

  // ── Element mutations ──────────────────────────────────────────────────────
  const handleUploadImage = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      const aspect = img.width / img.height;
      const w = 120;
      const h = w / aspect;
      const pa = printAreaDef;
      const cx = (pa.x / 100) * CANVAS_W + ((pa.width / 100) * CANVAS_W) / 2;
      const cy = (pa.y / 100) * CANVAS_H + ((pa.height / 100) * CANVAS_H) / 2;
      const el: DesignElement = {
        id: nextId(), type: 'image', src: url, imgEl: img,
        x: cx - w / 2, y: cy - h / 2, width: w, height: h,
        rotation: 0, scaleX: 1, scaleY: 1,
      };
      setElements(prev => [...prev, el]);
      setSelectedId(el.id);
    };
  }, [printAreaDef]);

  const handleAddText = useCallback(() => {
    const pa = printAreaDef;
    const cx = (pa.x / 100) * CANVAS_W + ((pa.width / 100) * CANVAS_W) / 2;
    const cy = (pa.y / 100) * CANVAS_H + ((pa.height / 100) * CANVAS_H) / 2;
    const el: DesignElement = {
      id: nextId(), type: 'text', text: 'Your Text',
      x: cx - 60, y: cy - 15, width: 160, height: 30,
      fontSize: 24, fontFamily: 'Arial', fill: '#000000', fontStyle: 'normal', align: 'left',
      rotation: 0, scaleX: 1, scaleY: 1,
    };
    setElements(prev => [...prev, el]);
    setSelectedId(el.id);
  }, [printAreaDef]);

  const handleChange = useCallback((id: string, attrs: Partial<DesignElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...attrs } : el));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedId(prev => prev === id ? null : prev);
  }, []);

  const handleMoveUp = useCallback((id: string) => {
    setElements(prev => {
      const i = prev.findIndex(el => el.id === id);
      if (i >= prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((id: string) => {
    setElements(prev => {
      const i = prev.findIndex(el => el.id === id);
      if (i <= 0) return prev;
      const next = [...prev];
      [next[i], next[i - 1]] = [next[i - 1], next[i]];
      return next;
    });
  }, []);

  const handleReset = () => {
    setElements([]);
    setSelectedId(null);
  };

  // ── Add to Cart ────────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!user) { router.push('/login'); return; }
    if (!selectedVariant) { toast.error('Please select a size'); return; }
    if (elements.length === 0) { toast.error('Add at least one design element'); return; }

    setSubmitting(true);
    try {
      const previewUrl = canvasRef.current?.toDataURL() ?? '';
      const canvasJson = canvasRef.current?.toJSON() ?? '[]';

      const customization = {
        canvasJson,
        previewUrl,
        printMethod,
        printSides: selectedSides,
        notes: '',
        pricingBreakdown: pricing,
      };

      await cartApi.addCustomItem(selectedVariant.id, qty, customization);
      toast.success('Custom design added to cart!');
      router.push('/cart');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add to cart');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-64 text-center py-20">
          <p className="text-gray-500">Product not found.</p>
          <Link href="/products" className="mt-4 text-indigo-600 font-medium">Browse Products</Link>
        </div>
      </>
    );
  }

  const availableViews = Object.keys(product.printAreas ?? { front: true }).filter(
    k => (product.printAreas as any)?.[k] || k === 'front',
  );

  return (
    <>
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-4 pt-5 pb-0">
        <nav className="flex items-center gap-1.5 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-600">Products</Link>
          <span>/</span>
          <Link href={`/products/${product.slug}`} className="hover:text-gray-600 truncate max-w-[160px]">{product.title}</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Customize</span>
        </nav>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Title row */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/products/${product.slug}`}
            className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900">{product.title} — Customizer</h1>
            <p className="text-sm text-gray-400">Design your custom print product</p>
          </div>
        </div>

        {/* 3-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-5">

          {/* Left: Tools */}
          <div className="order-2 lg:order-1">
            <ToolsPanel
              elements={elements}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUploadImage={handleUploadImage}
              onAddText={handleAddText}
              onChange={handleChange}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          </div>

          {/* Center: Canvas */}
          <div className="order-1 lg:order-2 flex flex-col items-center gap-4">
            {/* View switcher */}
            {availableViews.length > 1 && (
              <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
                {availableViews.map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v as any)}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${view === v ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}

            {/* Canvas wrapper */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{ width: CANVAS_W, height: CANVAS_H, maxWidth: '100%' }}
              onClick={() => setSelectedId(null)}
              onClickCapture={e => e.stopPropagation()}
            >
              <DesignCanvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                mockupUrl={mockupUrl}
                printArea={printAreaDef}
                elements={elements}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onChange={handleChange}
              />
            </div>

            {/* Canvas controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear All
              </button>
              <button
                onClick={() => {
                  const url = canvasRef.current?.toDataURL();
                  if (url) {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${product.slug}-design-preview.png`;
                    a.click();
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
            </div>

            {/* Hint */}
            <p className="text-xs text-gray-400 text-center max-w-xs">
              Click an element to select it. Drag to reposition. Use the handles to resize or rotate.
              The dashed border shows the printable area.
            </p>
          </div>

          {/* Right: Options */}
          <div className="order-3">
            <OptionsPanel
              product={product}
              selectedColor={selectedColor}
              onColorChange={(color) => { setSelectedColor(color); }}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              qty={qty}
              onQtyChange={setQty}
              selectedPrintMethod={printMethod}
              onPrintMethodChange={setPrintMethod}
              selectedSides={selectedSides}
              onSidesChange={setSelectedSides}
              pricing={pricing}
              selectedVariant={selectedVariant}
              onAddToCart={handleAddToCart}
              submitting={submitting}
            />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
