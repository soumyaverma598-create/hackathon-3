'use client';

import { useLanguageStore } from '@/store/languageStore';
import { getApplicationText, translations, Language } from '@/lib/translations';
import { CheckCircle2, Circle } from 'lucide-react';
import { memo } from 'react';

type LimestoneDocumentKey = keyof typeof translations.en.application.limestoneDocuments;

interface Document {
  id: string;
  labelKey: LimestoneDocumentKey;
}

const LIMESTONE_DOCUMENTS: Document[] = [
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

interface LimestoneChecklistProps {
  checkedItems: Record<string, boolean>;
  onToggle: (id: string) => void;
}

const LimestoneChecklist = memo(function LimestoneChecklist({ checkedItems, onToggle }: LimestoneChecklistProps) {
  const { language } = useLanguageStore();

  const allChecked = LIMESTONE_DOCUMENTS.every(doc => checkedItems[doc.id]);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="glass-card-strong rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 ui-section-strip bg-gradient-to-r from-[#164e63]/10 to-[#25c9d0]/10 border-b border-[#164e63]/20">
        <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
          📋 {getApplicationText('limestoneChecklist', language)}
        </h3>
        <p className="text-xs text-gray-500 mt-1.5">
          {checkedCount} / {LIMESTONE_DOCUMENTS.length} {language === 'en' ? 'documents checked' : 'दस्तावेज़ जांचे गए'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="px-5 pt-4">
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#25c9d0] to-[#164e63] transition-all duration-500"
            style={{ width: `${(checkedCount / LIMESTONE_DOCUMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="px-5 py-3 bg-blue-50/50 text-blue-800 text-xs border-t border-blue-100 flex gap-2">
        <span className="flex-shrink-0 mt-0.5">ℹ️</span>
        <span>{getApplicationText('checklistInstructions', language)}</span>
      </div>

      {/* Documents List */}
      <div className="divide-y divide-gray-100">
        {LIMESTONE_DOCUMENTS.map((doc, idx) => {
          const isChecked = checkedItems[doc.id] || false;
          const labelKey = doc.labelKey as keyof typeof translations.en.application.limestoneDocuments;
          const docLabel = translations[language].application.limestoneDocuments[labelKey];

          return (
            <div
              key={doc.id}
              className="px-5 py-3.5 hover:bg-cyan-50/30 transition-colors group cursor-pointer"
              onClick={() => onToggle(doc.id)}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="mt-0.5">
                  {isChecked ? (
                    <CheckCircle2 className="w-5 h-5 text-[#25c9d0] flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 flex-shrink-0 group-hover:text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium transition-colors ${isChecked ? 'text-[#164e63]' : 'text-gray-700'}`}>
                    {idx + 1}. {docLabel}
                  </p>
                </div>
              </label>
            </div>
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

export default LimestoneChecklist;
