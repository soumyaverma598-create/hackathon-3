'use client';

import { useLanguageStore } from '@/store/languageStore';
import { getApplicationText, translations, Language } from '@/lib/translations';
import { memo } from 'react';
import ChecklistItemWithUpload from '@/components/ChecklistItemWithUpload';

type InfrastructureDocumentKey = keyof typeof translations.en.application.infrastructureDocuments;

interface Document {
  id: string;
  labelKey: InfrastructureDocumentKey;
}

const INFRASTRUCTURE_DOCUMENTS: Document[] = [
  { id: 'processingFees', labelKey: 'processingFees' },
  { id: 'prefeasibility', labelKey: 'prefeasibility' },
  { id: 'emp', labelKey: 'emp' },
  { id: 'form1', labelKey: 'form1' },
  { id: 'landDocs', labelKey: 'landDocs' },
  { id: 'previousEC', labelKey: 'previousEC' },
  { id: 'ecCompliance', labelKey: 'ecCompliance' },
  { id: 'partnership', labelKey: 'partnership' },
  { id: 'conceptual', labelKey: 'conceptual' },
  { id: 'approvedLayout', labelKey: 'approvedLayout' },
  { id: 'landUseZoning', labelKey: 'landUseZoning' },
  { id: 'builtUpArea', labelKey: 'builtUpArea' },
  { id: 'buildingPermission', labelKey: 'buildingPermission' },
  { id: 'waterPermission', labelKey: 'waterPermission' },
  { id: 'stp', labelKey: 'stp' },
  { id: 'wasteManagement', labelKey: 'wasteManagement' },
  { id: 'solarEnergy', labelKey: 'solarEnergy' },
  { id: 'greenBelt', labelKey: 'greenBelt' },
  { id: 'empCost', labelKey: 'empCost' },
  { id: 'nbwl', labelKey: 'nbwl' },
  { id: 'fireNoc', labelKey: 'fireNoc' },
  { id: 'aviationNoc', labelKey: 'aviationNoc' },
  { id: 'wildlifeManagement', labelKey: 'wildlifeManagement' },
  { id: 'cteCto', labelKey: 'cteCto' },
  { id: 'geoPhotographs', labelKey: 'geoPhotographs' },
  { id: 'kml', labelKey: 'kml' },
  { id: 'cerConsent', labelKey: 'cerConsent' },
  { id: 'affidavits', labelKey: 'affidavits' },
  { id: 'eiaHearing', labelKey: 'eiaHearing' },
  { id: 'gist', labelKey: 'gist' },
];

interface InfrastructureChecklistProps {
  checkedItems: Record<string, boolean>;
  onToggle: (id: string) => void;
  uploadedFiles: Record<string, string>;
  onFileSelect: (id: string, file: File | null) => void;
}

const InfrastructureChecklist = memo(function InfrastructureChecklist({ checkedItems, onToggle, uploadedFiles, onFileSelect }: InfrastructureChecklistProps) {
  const { language } = useLanguageStore();

  const allChecked = INFRASTRUCTURE_DOCUMENTS.every(doc => checkedItems[doc.id]);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const handleToggleAll = () => {
    const nextCheckedState = !allChecked;
    INFRASTRUCTURE_DOCUMENTS.forEach((doc) => {
      if ((checkedItems[doc.id] || false) !== nextCheckedState) {
        onToggle(doc.id);
      }
    });
  };

  return (
    <div className="glass-card-strong rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 ui-section-strip bg-gradient-to-r from-[#164e63]/10 to-[#25c9d0]/10 border-b border-[#164e63]/20">
        <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
          📋 {getApplicationText('infrastructureChecklist', language)}
        </h3>
        <p className="text-xs text-gray-500 mt-1.5">
          {checkedCount} / {INFRASTRUCTURE_DOCUMENTS.length} {language === 'en' ? 'documents checked' : 'दस्तावेज़ जांचे गए'}
        </p>
        <button
          type="button"
          onClick={handleToggleAll}
          className="mt-3 text-xs font-semibold text-[#164e63] hover:text-[#0e3b4d] underline underline-offset-2"
        >
          {allChecked
            ? (language === 'en' ? 'Clear All' : 'सभी हटाएं')
            : (language === 'en' ? 'Select All' : 'सभी चुनें')}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-5 pt-4">
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#25c9d0] to-[#164e63] transition-all duration-500"
            style={{ width: `${(checkedCount / INFRASTRUCTURE_DOCUMENTS.length) * 100}%` }}
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
        {INFRASTRUCTURE_DOCUMENTS.map((doc, idx) => {
          const isChecked = checkedItems[doc.id] || false;
          const labelKey = doc.labelKey as keyof typeof translations.en.application.infrastructureDocuments;
          const docLabel = translations[language].application.infrastructureDocuments[labelKey];

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

export default InfrastructureChecklist;
