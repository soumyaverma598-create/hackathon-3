'use client';

import { useLanguageStore } from '@/store/languageStore';
import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur rounded-lg border border-gray-200 hover:border-[#164e63] hover:bg-white transition-all shadow-md hover:shadow-lg"
      >
        <Globe size={16} className="text-[#164e63]" />
        <span className="text-sm font-semibold text-[#164e63]">
          {language === 'en' ? 'English' : 'हिंदी'}
        </span>
      </button>

      {isOpen && (
        <div className="fixed top-14 left-4 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          <button
            onClick={() => {
              setLanguage('en');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2.5 text-sm font-medium text-left transition-all ${
              language === 'en'
                ? 'bg-[#164e63] text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => {
              setLanguage('hi');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2.5 text-sm font-medium text-left border-t border-gray-100 transition-all ${
              language === 'hi'
                ? 'bg-[#164e63] text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            🇮🇳 हिंदी
          </button>
        </div>
      )}
    </div>
  );
}
