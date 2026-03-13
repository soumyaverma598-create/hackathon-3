'use client';

import { create } from 'zustand';
import { Notification } from '@/types/workflow';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api';

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  pollingInterval: ReturnType<typeof setInterval> | null;

  fetchNotifications: (userId: string) => Promise<void>;
  startPolling: (userId: string) => void;
  stopPolling: () => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: (userId: string) => Promise<void>;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  isLoading: false,
  pollingInterval: null,

  fetchNotifications: async (userId) => {
    set({ isLoading: true });
    try {
      const notifs = await fetchNotifications(userId);
      set({ notifications: notifs, isLoading: false });
    } catch {
      // Silently fail for notifications — don't block the UI
      set({ isLoading: false });
    }
  },

  startPolling: (userId) => {
    // Fetch immediately
    get().fetchNotifications(userId);
    // Then poll every 30 seconds
    const interval = setInterval(() => {
      get().fetchNotifications(userId);
    }, 30_000);
    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },

  markRead: async (id) => {
    try {
      await markNotificationRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
      }));
    } catch {
      // Silently fail
    }
  },

  markAllRead: async (userId) => {
    try {
      await markAllNotificationsRead(userId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.userId === userId ? { ...n, isRead: true } : n
        ),
      }));
    } catch {
      // Silently fail
    }
  },

  unreadCount: () => {
    return get().notifications.filter((n) => !n.isRead).length;
  },
}));
