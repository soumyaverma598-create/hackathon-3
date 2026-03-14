'use client';

import LanguageSelector from '@/components/LanguageSelector';
import { ReactNode } from 'react';

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <LanguageSelector />
      {children}
    </>
  );
}
