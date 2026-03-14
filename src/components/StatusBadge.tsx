import { WorkflowStatus } from '@/types/workflow';
import { useLanguageStore } from '@/store/languageStore';
import { getUiText } from '@/lib/translations';

interface StatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  WorkflowStatus,
  { labelKey: Parameters<typeof getUiText>[0]; bg: string; text: string; dot: string }
> = {
  draft: {
    labelKey: 'statusDraft',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
  },
  submitted: {
    labelKey: 'statusSubmitted',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  under_scrutiny: {
    labelKey: 'statusUnderScrutiny',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
  },
  eds_raised: {
    labelKey: 'statusEdsRaised',
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
  },
  referred: {
    labelKey: 'statusReferred',
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  mom_draft: {
    labelKey: 'statusMomDraft',
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
  finalized: {
    labelKey: 'statusFinalized',
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    dot: 'bg-cyan-500',
  },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { language } = useLanguageStore();
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] tracking-wide font-bold ${cfg.bg} ${cfg.text} border border-black/5 ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {getUiText(cfg.labelKey, language)}
    </span>
  );
}
