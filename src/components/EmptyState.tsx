'use client';

import { Inbox } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { getUiText } from '@/lib/translations';

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  title,
  message,
  action,
}: EmptyStateProps) {
  const { language } = useLanguageStore();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center ui-section-block-muted px-5">
      <div className="w-16 h-16 rounded-full bg-[#164e63]/10 flex items-center justify-center mb-4">
        <Inbox className="text-[#164e63]/55 w-8 h-8" />
      </div>
      <p className="ui-eyebrow mb-2">{getUiText('nothingHereYet', language)}</p>
      <h3 className="text-[#103449] font-bold text-base mb-1">{title ?? getUiText('noRecordsFound', language)}</h3>
      <p className="text-[#4e6d80] text-sm max-w-xs">{message ?? getUiText('noItemsToDisplay', language)}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
