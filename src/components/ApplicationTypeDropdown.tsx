'use client';

import { useLanguageStore } from '@/store/languageStore';
import { getApplicationText, getUiText } from '@/lib/translations';
import { ChevronDown } from 'lucide-react';
import { memo } from 'react';

export type ApplicationType = 'sand' | 'limestone' | 'bricks' | 'infrastructure' | 'industry' | '';

interface ApplicationTypeDropdownProps {
  value: ApplicationType;
  onChange: (type: ApplicationType) => void;
}

const APPLICATION_TYPES: { value: ApplicationType; labelKey: keyof ReturnType<typeof getApplicationTextForType> }[] = [
  { value: 'sand', labelKey: 'sand' },
  { value: 'limestone', labelKey: 'limestone' },
  { value: 'bricks', labelKey: 'bricks' },
  { value: 'infrastructure', labelKey: 'infrastructure' },
  { value: 'industry', labelKey: 'industry' },
];

type AppTypeLabel = 'sand' | 'limestone' | 'bricks' | 'infrastructure' | 'industry';

const getApplicationTextForType = (lang: string) => ({
  sand: lang === 'en' ? 'Sand Mining' : 'रेत खनन',
  limestone: lang === 'en' ? 'Limestone Mining' : 'चूना पत्थर खनन',
  bricks: lang === 'en' ? 'Bricks Manufacturing' : 'ईंट निर्माण',
  infrastructure: lang === 'en' ? 'Infrastructure Development' : 'बुनियादी ढांचे का विकास',
  industry: lang === 'en' ? 'Industrial Project' : 'औद्योगिक परियोजना',
});

const ApplicationTypeDropdown = memo(function ApplicationTypeDropdown({ value, onChange }: ApplicationTypeDropdownProps) {
  const { language } = useLanguageStore();

  const typeLabel = (type: ApplicationType): string => {
    if (!type) return getUiText('selectApplicationTypeFallback', language);
    const typeMap = getApplicationTextForType(language);
    return typeMap[type as AppTypeLabel] || type;
  };

  return (
    <div className="relative">
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as ApplicationType)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63] focus:border-transparent transition-all appearance-none bg-white pr-10"
        >
          <option value="">{getUiText('chooseApplicationType', language)}</option>
          {APPLICATION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {typeLabel(type.value)}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      </div>
    </div>
  );
});

export default ApplicationTypeDropdown;
