'use client';

import { create } from 'zustand';
import {
  fetchAdminSettings,
  updateAdminSettingsSection,
} from '@/lib/api';
import {
  AdminSettings,
  AdminSettingsSection,
  AdminSettingsSections,
} from '@/types/settings';

interface AdminSettingsState {
  settings: AdminSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  saveSection: <T extends AdminSettingsSection>(
    section: T,
    payload: Partial<AdminSettingsSections[T]>
  ) => Promise<void>;
  clearError: () => void;
}

export const useAdminSettingsStore = create<AdminSettingsState>()((set, get) => ({
  settings: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchSettings: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const settings = await fetchAdminSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load settings.',
        isLoading: false,
      });
    }
  },

  saveSection: async (section, payload) => {
    set({ isSaving: true, error: null });
    try {
      const updatedSection = await updateAdminSettingsSection(section, payload);
      set((state) => ({
        settings: state.settings
          ? {
              ...state.settings,
              [section]: updatedSection,
              updatedAt: new Date().toISOString(),
            }
          : state.settings,
        isSaving: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save settings.',
        isSaving: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
