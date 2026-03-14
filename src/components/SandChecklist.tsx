'use client';

import { useLanguageStore } from '@/store/languageStore';
import { getApplicationText, translations, Language } from '@/lib/translations';
import { memo } from 'react';
import ChecklistItemWithUpload from '@/components/ChecklistItemWithUpload';

type SandDocumentKey = keyof typeof translations.en.application.sandDocuments;

interface Document {
  id: string;
  labelKey: SandDocumentKey;
}

const SAND_DOCUMENTS: Document[] = [
  { id: 'processingFees', labelKey: 'processingFees' },
  { id: 'prefeasibility', labelKey: 'prefeasibility' },
  { id: 'emp', labelKey: 'emp' },
  { id: 'form1', labelKey: 'form1' },
  { id: 'dsr', labelKey: 'dsr' },
  { id: 'landDocs', labelKey: 'landDocs' },
  { id: 'loi', labelKey: 'loi' },
  { id: 'noc', labelKey: 'noc' },
  { id: 'certificate200', labelKey: 'certificate200' },
  { id: 'certificate500', labelKey: 'certificate500' },
  { id: 'markedDelimited', labelKey: 'markedDelimited' },
  { id: 'miningPlan', labelKey: 'miningPlan' },
  { id: 'approvedMiningPlan', labelKey: 'approvedMiningPlan' },
  { id: 'forestNoc', labelKey: 'forestNoc' },
  { id: 'kml', labelKey: 'kml' },
  { id: 'cerConsent', labelKey: 'cerConsent' },
  { id: 'affidavits', labelKey: 'affidavits' },
  { id: 'gist', labelKey: 'gist' },
];

interface SandChecklistProps {
  checkedItems: Record<string, boolean>;
  onToggle: (id: string) => void;
  uploadedFiles: Record<string, string>;
  onFileSelect: (id: string, file: File | null) => void;
}

const SandChecklist = memo(function SandChecklist({ checkedItems, onToggle, uploadedFiles, onFileSelect }: SandChecklistProps) {
  const { language } = useLanguageStore();

  const allChecked = SAND_DOCUMENTS.every(doc => checkedItems[doc.id]);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="glass-card-strong rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 ui-section-strip bg-gradient-to-r from-[#164e63]/10 to-[#25c9d0]/10 border-b border-[#164e63]/20">
        <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
          📋 {getApplicationText('sandChecklist', language)}
        </h3>
        <p className="text-xs text-gray-500 mt-1.5">
          {checkedCount} / {SAND_DOCUMENTS.length} {language === 'en' ? 'documents checked' : 'दस्तावेज़ जांचे गए'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="px-5 pt-4">
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#25c9d0] to-[#164e63] transition-all duration-500"
            style={{ width: `${(checkedCount / SAND_DOCUMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="px-5 py-3 bg-blue-50/50 text-blue-800 text-xs border-t border-blue-100 flex gap-2">
        <span className="flex-shrink-0 mt-0.5">ℹ️</span>
        <span>{getApplicationText('checklistInstructions', language)}</span>
      </div>

      {/* Documents List */}
      <div className="space-y-2 px-5 py-4">
        {SAND_DOCUMENTS.map((doc, idx) => {
          const isChecked = checkedItems[doc.id] || false;
          const labelKey = doc.labelKey as keyof typeof translations.en.application.sandDocuments;
          const docLabel = translations[language].application.sandDocuments[labelKey];

          return (
            <ChecklistItemWithUpload
              key={doc.id}
              id={doc.id}
              label={docLabel}
              index={idx}
              checked={isChecked}
              onToggle={onToggle}
              uploadedFileName={uploadedFiles[doc.id]}
              onFileSelect={onFileSelect}
              checkedClassName="bg-cyan-50 border-[#164e63]/40"
              uncheckedClassName="bg-white border-gray-200 hover:border-[#164e63]/30"
            />
          );
        })}
      </div>

      {/* Completion Message */}
      {allChecked && (
        <div className="px-5 py-3.5 bg-green-50 border-t border-green-200 text-green-800 text-sm font-medium flex items-center gap-2">
          ✓ {language === 'en' ? 'All documents verified! Ready to submit.' : 'सभी दस्तावेज़ सत्यापित! जमा करने के लिए तैयार।'}
        </div>
      )}
    </div>
  );
});

export default SandChecklist;
