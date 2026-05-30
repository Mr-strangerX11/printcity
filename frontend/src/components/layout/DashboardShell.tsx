'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, LogOut, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LogoImage } from '@/components/ui/LogoImage';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number | string;
  section?: string;
}

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  navItems: NavItem[];
  headerActions?: React.ReactNode;
}

export function DashboardShell({ children, title, navItems, headerActions }: DashboardShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Group nav items by section
  const sections = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const sec = item.section ?? '';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(item);
    return acc;
  }, {});

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href + '/'));

  const avatarLetter = (user?.name?.trim()?.[0] ?? 'U').toUpperCase();
  const roleColor = user?.role === 'ADMIN' ? 'from-red-500 to-orange-500'
    : user?.role === 'VENDOR' ? 'from-blue-500 to-cyan-500'
    : 'from-purple-600 to-blue-600';

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--page-bg)' }}>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col sidebar-transition',
          'w-[240px]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <LogoImage
              width={100} height={36}
              className="h-8 w-auto object-contain dark:brightness-0 dark:invert"
              fallbackClassName="text-lg font-black text-[var(--text-heading)]"
            />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
            >
              <X className="w-4 h-4 text-[var(--text-faint)]" />
            </button>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'var(--sidebar-item-active-bg)' }}>
            <div className={cn('w-1.5 h-1.5 rounded-full animate-pulse-dot',
              user?.role === 'ADMIN' ? 'bg-red-500' :
              user?.role === 'VENDOR' ? 'bg-blue-500' : 'bg-purple-500'
            )} />
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'var(--sidebar-item-active-text)' }}>
              {title}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5 scrollbar-hide">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} className="mb-2">
              {section && (
                <p className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--text-faint)]">
                  {section}
                </p>
              )}
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      active
                        ? 'text-white shadow-sm'
                        : 'text-[var(--text-body)] hover:bg-[var(--sidebar-item-hover)] hover:text-[var(--text-heading)]',
                    )}
                    style={active ? {
                      background: 'linear-gradient(135deg,#7C3AED,#2563EB)',
                    } : {}}
                  >
                    <span className={cn(
                      'w-5 h-5 flex-shrink-0 transition-transform duration-150',
                      active ? 'text-white/90' : 'text-[var(--text-faint)] group-hover:text-[var(--text-body)] group-hover:scale-110',
                    )}>
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={cn(
                        'text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-purple-500/15 text-purple-500',
                      )}>
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight className="w-3.5 h-3.5 text-white/60 ml-auto" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
            style={{ background: 'var(--hover-bg)' }}>
            <div className={cn(
              'w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center',
              'text-white text-sm font-black flex-shrink-0 shadow-sm',
              roleColor,
            )}>
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-[var(--text-heading)]">{user?.name}</p>
              <p className="text-[10px] truncate text-[var(--text-faint)] capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Store
            </Link>
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">

        {/* Top header */}
        <header
          className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 flex-shrink-0"
          style={{
            background: 'var(--nav-bg)',
            borderBottom: '1px solid var(--nav-border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Left — mobile menu toggle + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-[var(--hover-bg)] transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-[var(--text-body)]" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--text-faint)]">
              <span className="font-semibold text-[var(--text-heading)]">{title}</span>
            </div>
          </div>

          {/* Right — actions */}
          <div className="flex items-center gap-2">
            {headerActions}
            <ThemeToggle />
            {/* Notification bell placeholder slot */}
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-[var(--hover-bg)] transition-colors"
              aria-label="Go to store"
            >
              <ExternalLink className="w-4.5 h-4.5 text-[var(--text-body)]" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 page-in">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
