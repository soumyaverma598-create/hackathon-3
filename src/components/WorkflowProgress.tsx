import { WorkflowStatus } from '@/types/workflow';
import { Check } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { getUiText } from '@/lib/translations';

const STAGES: { status: WorkflowStatus; labelKey: Parameters<typeof getUiText>[0] }[] = [
  { status: 'draft', labelKey: 'stageDraft' },
  { status: 'submitted', labelKey: 'stageSubmitted' },
  { status: 'under_scrutiny', labelKey: 'stageScrutiny' },
  { status: 'eds_raised', labelKey: 'stageEds' },
  { status: 'referred', labelKey: 'stageEacReferred' },
  { status: 'mom_draft', labelKey: 'stageMomDraft' },
  { status: 'finalized', labelKey: 'stageEcGranted' },
];

const ORDER: WorkflowStatus[] = STAGES.map((s) => s.status);

interface WorkflowProgressProps {
  currentStatus: WorkflowStatus;
}

export default function WorkflowProgress({ currentStatus }: WorkflowProgressProps) {
  const { language } = useLanguageStore();
  const currentIdx = ORDER.indexOf(currentStatus);

  return (
    <div className="ui-section-block rounded-xl p-4 shadow-sm">
      <p className="ui-eyebrow mb-3">
        {getUiText('workflowProgress', language)}
      </p>
      <div className="flex items-center">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div key={stage.status} className="flex items-center flex-1 min-w-0">
              {/* Node */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    isDone
                      ? 'bg-[#164e63] border-[#164e63] text-white'
                      : isCurrent
                      ? 'bg-[#25c9d0] border-[#25c9d0] text-white shadow-lg scale-110'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isDone ? <Check size={12} /> : <span>{idx + 1}</span>}
                </div>
                <span
                  className={`text-[9px] font-medium mt-1 w-14 text-center leading-tight ${
                    isCurrent
                      ? 'text-[#127598] font-extrabold'
                      : isDone
                      ? 'text-[#164e63] font-semibold'
                      : 'text-[#7b95a5]'
                  }`}
                >
                  {getUiText(stage.labelKey, language)}
                </span>
              </div>

              {/* Connector line */}
              {idx < STAGES.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-3 rounded-full overflow-hidden bg-gray-200">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: isDone ? '100%' : isCurrent ? '50%' : '0%',
                      background: 'linear-gradient(90deg, #164e63, #25c9d0)',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
