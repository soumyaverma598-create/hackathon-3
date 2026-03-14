import { WorkflowStatus } from '@/types/workflow';
import { Check } from 'lucide-react';

const STAGES: { status: WorkflowStatus; label: string }[] = [
  { status: 'draft', label: 'Draft' },
  { status: 'submitted', label: 'Submitted' },
  { status: 'under_scrutiny', label: 'Scrutiny' },
  { status: 'eds_raised', label: 'EDS' },
  { status: 'referred', label: 'EAC Referred' },
  { status: 'mom_draft', label: 'MoM Draft' },
  { status: 'finalized', label: 'EC Granted' },
];

const ORDER: WorkflowStatus[] = STAGES.map((s) => s.status);

interface WorkflowProgressProps {
  currentStatus: WorkflowStatus;
}

export default function WorkflowProgress({ currentStatus }: WorkflowProgressProps) {
  const currentIdx = ORDER.indexOf(currentStatus);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Workflow Progress
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
                      ? 'text-[#25c9d0] font-bold'
                      : isDone
                      ? 'text-[#164e63]'
                      : 'text-gray-400'
                  }`}
                >
                  {stage.label}
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
