'use client';

import { useLanguageStore } from '@/store/languageStore';
import { getApplicationText, translations, Language } from '@/lib/translations';
import { memo } from 'react';
import ChecklistItemWithUpload from '@/components/ChecklistItemWithUpload';

type BricksDocumentKey = keyof typeof translations.en.application.bricksDocuments;

interface Document {
  id: string;
  labelKey: BricksDocumentKey;
}

const BRICKS_DOCUMENTS: Document[] = [
  { id: 'processingFees', labelKey: 'processingFees' },
  { id: 'prefeasibility', labelKey: 'prefeasibility' },
  { id: 'emp', labelKey: 'emp' },
  { id: 'form1', labelKey: 'form1' },
  { id: 'dsr', labelKey: 'dsr' },
  { id: 'landDocs', labelKey: 'landDocs' },
  { id: 'consent', labelKey: 'consent' },
  { id: 'loi', labelKey: 'loi' },
  { id: 'leaseDeed', labelKey: 'leaseDeed' },
  { id: 'previousEC', labelKey: 'previousEC' },
  { id: 'ecCompliance', labelKey: 'ecCompliance' },
  { id: 'productionData', labelKey: 'productionData' },
  { id: 'gram', labelKey: 'gram' },
  { id: 'panchayat', labelKey: 'panchayat' },
  { id: 'certificate200', labelKey: 'certificate200' },
  { id: 'certificate500', labelKey: 'certificate500' },
  { id: 'planApproval', labelKey: 'planApproval' },
  { id: 'approvedPlan', labelKey: 'approvedPlan' },
  { id: 'forestNoc', labelKey: 'forestNoc' },
  { id: 'treePlantation', labelKey: 'treePlantation' },
  { id: 'waterNoc', labelKey: 'waterNoc' },
  { id: 'cteCto', labelKey: 'cteCto' },
  { id: 'geoPhotographs', labelKey: 'geoPhotographs' },
  { id: 'boundaryStrip', labelKey: 'boundaryStrip' },
  { id: 'droneVideo', labelKey: 'droneVideo' },
  { id: 'kml', labelKey: 'kml' },
  { id: 'ccr', labelKey: 'ccr' },
  { id: 'cemp', labelKey: 'cemp' },
  { id: 'cerConsent', labelKey: 'cerConsent' },
  { id: 'affidavits', labelKey: 'affidavits' },
  { id: 'eiaHearing', labelKey: 'eiaHearing' },
  { id: 'gist', labelKey: 'gist' },
];

interface BricksChecklistProps {
  checkedItems: Record<string, boolean>;
  onToggle: (id: string) => void;
  uploadedFiles: Record<string, string>;
  onFileSelect: (id: string, file: File | null) => void;
}

const BricksChecklist = memo(function BricksChecklist({ checkedItems, onToggle, uploadedFiles, onFileSelect }: BricksChecklistProps) {
  const { language } = useLanguageStore();

  const allChecked = BRICKS_DOCUMENTS.every(doc => checkedItems[doc.id]);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="glass-card-strong rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 ui-section-strip bg-gradient-to-r from-[#164e63]/10 to-[#25c9d0]/10 border-b border-[#164e63]/20">
        <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
          📋 {getApplicationText('bricksChecklist', language)}
        </h3>
        <p className="text-xs text-gray-500 mt-1.5">
          {checkedCount} / {BRICKS_DOCUMENTS.length} {language === 'en' ? 'documents checked' : 'दस्तावेज़ जांचे गए'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="px-5 pt-4">
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#25c9d0] to-[#164e63] transition-all duration-500"
            style={{ width: `${(checkedCount / BRICKS_DOCUMENTS.length) * 100}%` }}
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
        {BRICKS_DOCUMENTS.map((doc, idx) => {
          const isChecked = checkedItems[doc.id] || false;
          const labelKey = doc.labelKey as keyof typeof translations.en.application.bricksDocuments;
          const docLabel = translations[language].application.bricksDocuments[labelKey];

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

export default BricksChecklist;
