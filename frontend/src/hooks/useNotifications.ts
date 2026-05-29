'use client';

import { notificationsApi } from '@/lib/api';
import { Notification, PaginatedResponse } from '@/types';
import { useFetch, FetchState } from './useFetch';

export interface NotificationsParams {
  limit?: number;
  skip?: number;
}

interface NotificationListResult {
  items: Notification[];
  meta?: PaginatedResponse<Notification>['meta'];
}

export function useNotifications(
  params: NotificationsParams = {},
  options?: { ttl?: number; enabled?: boolean },
): FetchState<NotificationListResult> {
  const cacheKey = `notifications:${JSON.stringify(params)}`;

  return useFetch<NotificationListResult>(
    async () => {
      const { data } = await notificationsApi.list(params);
      const raw = data.data;
      const items: Notification[] = Array.isArray(raw) ? raw : raw?.items ?? [];
      return { items, meta: Array.isArray(raw) ? undefined : raw?.meta };
    },
    [cacheKey],
    { cacheKey, ttl: options?.ttl ?? 15_000, enabled: options?.enabled ?? true },
  );
}

export function useUnreadCount(options?: { ttl?: number; enabled?: boolean }): FetchState<number> {
  return useFetch<number>(
    async () => {
      const { data } = await notificationsApi.unreadCount();
      return (data.data?.count ?? data.data ?? 0) as number;
    },
    [],
    { cacheKey: 'notifications:unread', ttl: options?.ttl ?? 30_000, enabled: options?.enabled ?? true },
  );
}
