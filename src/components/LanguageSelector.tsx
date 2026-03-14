'use client';

import { useLanguageStore } from '@/store/languageStore';
import { getUiText, languageOptions } from '@/lib/translations';
import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LanguageSelectorProps {
  placement?: 'public' | 'sidebar';
}

export default function LanguageSelector({ placement = 'public' }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeLanguage = languageOptions.find((option) => option.code === language) ?? languageOptions[0];

  const triggerClassName =
    placement === 'public'
      ? 'fixed bottom-4 left-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur rounded-lg border border-gray-200 hover:border-[#164e63] hover:bg-white transition-all shadow-md hover:shadow-lg z-50'
      : 'w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/10 rounded-lg border border-white/20 hover:border-cyan-200/70 hover:bg-white/15 transition-all text-cyan-50';

  const menuClassName =
    placement === 'public'
      ? 'fixed bottom-16 left-4 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 min-w-48'
      : 'absolute bottom-12 left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50';

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClassName}
      >
        <Globe size={16} className={placement === 'public' ? 'text-[#164e63]' : 'text-cyan-100'} />
        <span className={`text-sm font-semibold ${placement === 'public' ? 'text-[#164e63]' : 'text-cyan-50'}`}>
          {activeLanguage.nativeLabel}
        </span>
        {placement === 'sidebar' && <span className="text-[11px] text-cyan-200/90">{getUiText('language', language)}</span>}
      </button>

      {isOpen && (
        <div className={menuClassName}>
          {languageOptions.map((option, index) => (
            <button
              key={option.code}
              onClick={() => {
                setLanguage(option.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-sm font-medium text-left transition-all ${index > 0 ? 'border-t border-gray-100' : ''} ${
                language === option.code
                  ? 'bg-[#164e63] text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-semibold">{option.nativeLabel}</span>
              <span className="ml-2 text-xs opacity-80">({option.label})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
