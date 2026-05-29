'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  {
    name: 'Digital Print',
    slug: 'digital-print',
    subcategories: [
      'Flyer Printing',
      'Brochure Printing',
      'Name Card Printing',
      'Sticker Printing',
      'Booklet Printing',
      'Postcard Printing',
      'Ticket & Voucher Printing',
      'Calendar Printing',
      'Corporate Folder Printing',
      'Tissue Printing',
      'Customised Print',
    ],
  },
  {
    name: 'Large Format',
    slug: 'large-format',
    subcategories: [
      'Poster Printing',
      'Pull Up Banner',
      'Pop Up Display',
      'Floor Sticker Printing',
      'Display Standee',
      'POSM Display',
      'Installation Service',
    ],
  },
  {
    name: 'Events',
    slug: 'events',
    subcategories: [
      'Stage Backdrop',
      '3D Cube Printing',
      'Diecut Standee',
      'Events & Exhibition Setup',
    ],
  },
  {
    name: 'Apparel',
    slug: 'apparel',
    subcategories: [
      'T-Shirt Printing',
      'Tote Bag Printing',
    ],
  },
  {
    name: 'Product Packaging',
    slug: 'product-packaging',
    subcategories: [
      'Product Packaging & Box Printing',
    ],
  },
  {
    name: 'Logo Print',
    slug: 'logo-print',
    subcategories: [
      'Logo Printing',
    ],
  },
  {
    name: '3D Print',
    slug: '3d-print',
    subcategories: [
      '3D Printing Service',
    ],
  },
  {
    name: 'Shop',
    slug: 'shop',
    subcategories: [],
  },
  {
    name: 'Contact',
    slug: 'contact',
    subcategories: [],
  }
];

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function CategoryBar() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = (index: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveIndex(index);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveIndex(null), 120);
  };

  return (
    <div
      className="sticky top-16 z-40 border-b"
      style={{ background: 'var(--nav-bg)', borderBottomColor: 'var(--nav-border)' }}
    >
      {/* Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hidden md:block">
        <div className="flex items-center">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.slug}
              className="relative"
              onMouseEnter={() => handleEnter(i)}
              onMouseLeave={handleLeave}
            >
              <Link
                href={`/products?category=${cat.slug}`}
                className={cn(
                  'flex items-center gap-1 px-3.5 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                  activeIndex === i
                    ? 'text-purple-500 dark:text-purple-400'
                    : 'hover:text-purple-500 dark:hover:text-purple-400'
                )}
                style={{ color: activeIndex === i ? undefined : 'var(--text-body)' }}
              >
                {cat.name}
                {cat.subcategories.length > 0 && (
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      activeIndex === i && 'rotate-180'
                    )}
                  />
                )}
              </Link>

              {cat.subcategories.length > 0 && activeIndex === i && (
                <div
                  className="absolute left-0 top-full min-w-[220px] rounded-xl shadow-2xl py-1.5 z-50"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border-color)',
                    animation: 'slideUp 0.12s ease-out',
                  }}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={handleLeave}
                >
                  {cat.subcategories.map((sub) => (
                    <Link
                      key={sub}
                      href={`/services/${toSlug(sub)}`}
                      className="block px-4 py-2 text-sm whitespace-nowrap transition-colors hover:bg-[var(--hover-bg)] hover:text-purple-500 dark:hover:text-purple-400"
                      style={{ color: 'var(--text-body)' }}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile — horizontally scrollable, no dropdown */}
      <div className="md:hidden overflow-x-auto scrollbar-none px-4">
        <div className="flex items-center gap-1 py-1">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="flex-shrink-0 px-3 py-2 text-xs font-medium rounded-full whitespace-nowrap transition-colors hover:bg-[var(--hover-bg)] hover:text-purple-500"
              style={{ color: 'var(--text-body)' }}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
