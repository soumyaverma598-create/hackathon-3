'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth';
import { loginUser, getCurrentUser } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await loginUser(email, password);
          localStorage.setItem('auth-token', data.token);
          set({ user: data.user, isLoading: false });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Login failed. Please try again.';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('auth-token');
        set({ user: null, error: null });
        // Only navigate away if not already on the login page
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      },

      hydrate: async () => {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('auth-token')
            : null;
        if (!token) return;
        set({ isLoading: true });
        try {
          const user = await getCurrentUser();
          set({ user, isLoading: false });
        } catch {
          localStorage.removeItem('auth-token');
          set({ user: null, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'parivesh-auth',
      partialize: () => ({}),
    }
  )
);
