'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle, Loader2 } from 'lucide-react';
import { cn, formatRelative } from '@/lib/utils';

export interface Notification {
  id: string;
  title: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  loading?: boolean;
}

export default function NotificationBell({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  loading = false,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        className={cn(
          'relative flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200',
          open && 'bg-gray-50 text-gray-800',
        )}
      >
        <Bell className="w-[18px] h-[18px]" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 max-h-96 flex flex-col rounded-2xl border border-gray-100 bg-white shadow-lg overflow-hidden z-50"
          role="dialog"
          aria-label="Notifications"
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <span className="text-sm font-semibold text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Bell className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">You're all caught up!</p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => {
                  const inner = (
                    <div
                      className={cn(
                        'flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50',
                        !n.isRead && 'bg-indigo-50/40 hover:bg-indigo-50/60',
                      )}
                    >
                      {/* Unread dot */}
                      <span className="flex-shrink-0 mt-1.5">
                        <span
                          className={cn(
                            'block w-2 h-2 rounded-full',
                            n.isRead ? 'bg-transparent' : 'bg-indigo-500',
                          )}
                        />
                      </span>

                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm leading-snug',
                            n.isRead ? 'text-gray-600 font-normal' : 'text-gray-900 font-medium',
                          )}
                        >
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelative(n.createdAt)}
                        </p>
                      </div>

                      {!n.isRead && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onMarkRead(n.id);
                          }}
                          aria-label="Mark as read"
                          className="flex-shrink-0 mt-0.5 p-1 rounded-md text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );

                  return (
                    <li key={n.id} className="border-b border-gray-50 last:border-b-0">
                      {n.actionUrl ? (
                        <Link
                          href={n.actionUrl}
                          onClick={() => {
                            if (!n.isRead) onMarkRead(n.id);
                            setOpen(false);
                          }}
                          className="block"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div
                          onClick={() => {
                            if (!n.isRead) onMarkRead(n.id);
                          }}
                          className="cursor-default"
                        >
                          {inner}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { NotificationBell };
