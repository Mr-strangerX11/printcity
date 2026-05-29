'use client';

import { Minus, Plus, ShoppingCart, Loader2, Check } from 'lucide-react';
import { MockupImage, Product, ProductVariant } from '@/types';

export interface PricingBreakdown {
  basePrice: number;
  printCost: number;
  setupCost: number;
  discount: number;
  total: number;
}

type Props = {
  product: Product;
  selectedColor: string;
  onColorChange: (color: string, hex: string) => void;
  selectedSize: string;
  onSizeChange: (size: string) => void;
  qty: number;
  onQtyChange: (qty: number) => void;
  selectedPrintMethod: string;
  onPrintMethodChange: (method: string) => void;
  selectedSides: string[];
  onSidesChange: (sides: string[]) => void;
  pricing: PricingBreakdown;
  selectedVariant: ProductVariant | undefined;
  onAddToCart: () => void;
  submitting: boolean;
};

const PRINT_METHOD_LABELS: Record<string, string> = {
  DTG: 'DTG (Direct-to-Garment)',
  'Screen Printing': 'Screen Printing',
  Embroidery: 'Embroidery',
  Sublimation: 'Sublimation',
  'UV Printing': 'UV Printing',
  'Laser Engraving': 'Laser Engraving',
};

function formatPrice(n: number) {
  return `Rs. ${n.toLocaleString('en-NP', { maximumFractionDigits: 0 })}`;
}

export default function OptionsPanel({
  product, selectedColor, onColorChange, selectedSize, onSizeChange,
  qty, onQtyChange, selectedPrintMethod, onPrintMethodChange,
  selectedSides, onSidesChange, pricing, selectedVariant, onAddToCart, submitting,
}: Props) {
  const sizesForColor = product.variants?.filter(v => v.color === selectedColor).map(v => v.size) ?? [];
  const mockupColors = product.mockupImages ?? [];
  const availableSides = Object.keys(product.printAreas ?? {}).filter(s => (product.printAreas as any)[s]);

  const toggleSide = (side: string) => {
    if (selectedSides.includes(side)) {
      if (selectedSides.length > 1) onSidesChange(selectedSides.filter(s => s !== side));
    } else {
      onSidesChange([...selectedSides, side]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Color swatches from mockup images */}
      {mockupColors.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Color: <span className="text-gray-700 font-semibold normal-case">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {mockupColors.map((m: MockupImage) => (
              <button
                key={m.color}
                onClick={() => onColorChange(m.color, m.hex)}
                title={m.color}
                className={`relative w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === m.color ? 'border-indigo-500 scale-110 shadow-md' : 'border-gray-200'}`}
                style={{ backgroundColor: m.hex }}
              >
                {selectedColor === m.color && (
                  <Check className="w-3 h-3 text-white absolute inset-0 m-auto drop-shadow" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      {sizesForColor.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Size: <span className="text-gray-700 font-semibold normal-case">{selectedSize || 'Select'}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map(size => {
              const v = product.variants?.find(v => v.color === selectedColor && v.size === size);
              const outOfStock = v ? v.stock === 0 : false;
              return (
                <button
                  key={size}
                  onClick={() => !outOfStock && onSizeChange(size)}
                  disabled={outOfStock}
                  className={`relative w-12 h-10 rounded-xl text-sm font-semibold border-2 transition-all ${
                    selectedSize === size ? 'border-indigo-500 bg-indigo-50 text-indigo-700' :
                    outOfStock ? 'border-gray-100 text-gray-300 cursor-not-allowed' :
                    'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Print sides */}
      {availableSides.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Print Sides</p>
          <div className="flex flex-wrap gap-2">
            {availableSides.map(side => (
              <button
                key={side}
                onClick={() => toggleSide(side)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all capitalize ${
                  selectedSides.includes(side)
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                {side}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Print method */}
      {(product.availablePrintMethods ?? []).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Print Method</p>
          <div className="flex flex-col gap-1.5">
            {(product.availablePrintMethods ?? []).map(method => (
              <button
                key={method}
                onClick={() => onPrintMethodChange(method)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left ${
                  selectedPrintMethod === method
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selectedPrintMethod === method ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`}>
                  {selectedPrintMethod === method && <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />}
                </div>
                {PRINT_METHOD_LABELS[method] ?? method}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quantity</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => onQtyChange(Math.max(1, qty - 1))}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center text-sm font-black">{qty}</span>
            <button
              onClick={() => onQtyChange(Math.min(selectedVariant?.stock ?? 999, qty + 1))}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {qty >= 10 && (
            <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg">
              {qty >= 50 ? '15% bulk discount' : qty >= 25 ? '10% bulk discount' : '5% bulk discount'}
            </span>
          )}
        </div>
      </div>

      {/* Pricing breakdown */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pricing Breakdown</p>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Base price × {qty}</dt>
            <dd className="font-semibold">{formatPrice(pricing.basePrice * qty)}</dd>
          </div>
          {pricing.printCost > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Print cost ({selectedSides.length} side{selectedSides.length > 1 ? 's' : ''}) × {qty}</dt>
              <dd className="font-semibold">{formatPrice(pricing.printCost)}</dd>
            </div>
          )}
          {pricing.setupCost > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Setup fee</dt>
              <dd className="font-semibold">{formatPrice(pricing.setupCost)}</dd>
            </div>
          )}
          {pricing.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <dt>Bulk discount</dt>
              <dd className="font-semibold">−{formatPrice(pricing.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-indigo-200 pt-2 mt-1">
            <dt className="font-black text-gray-900 text-base">Total</dt>
            <dd className="font-black text-gray-900 text-base">{formatPrice(pricing.total)}</dd>
          </div>
        </dl>
      </div>

      {/* Add to Cart */}
      <button
        onClick={onAddToCart}
        disabled={submitting || !selectedSize || !selectedVariant}
        className="flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-sm shadow-indigo-200"
      >
        {submitting
          ? <Loader2 className="w-5 h-5 animate-spin" />
          : <ShoppingCart className="w-5 h-5" />
        }
        {submitting ? 'Adding to Cart…' : 'Add to Cart'}
      </button>
      {!selectedSize && (
        <p className="text-xs text-center text-gray-400">Select a size to continue</p>
      )}
    </div>
  );
}
