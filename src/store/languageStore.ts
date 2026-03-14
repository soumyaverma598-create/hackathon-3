'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@/lib/translations';

const normalizeLanguage = (value: unknown): Language =>
  value === 'hi' ? 'hi' : 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang: Language) => set({ language: normalizeLanguage(lang) }),
    }),
    {
      name: 'language-store',
      merge: (persistedState, currentState) => {
        const typedState = persistedState as Partial<LanguageState> | undefined;
        return {
          ...currentState,
          ...typedState,
          language: normalizeLanguage(typedState?.language),
        };
      },
    }
  )
);
