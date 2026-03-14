'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  MessageSquareWarning,
  CreditCard,
  ClipboardList,
  Search,
  Send,
  BookOpen,
  CheckCircle,
  Users,
  Settings,
} from 'lucide-react';
import { UserRole } from '@/types/auth';
import { getUiText, UiTranslationKey } from '@/lib/translations';
import { useLanguageStore } from '@/store/languageStore';
import LanguageSelector from './LanguageSelector';

interface NavItem {
  href: string;
  labelKey: UiTranslationKey;
  icon: React.ReactNode;
}

const navMap: Record<UserRole, NavItem[]> = {
  admin: [
    { href: '/admin/dashboard', labelKey: 'navDashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/admin/users', labelKey: 'navUserManagement', icon: <Users size={18} /> },
    { href: '/admin/settings', labelKey: 'navSettings', icon: <Settings size={18} /> },
  ],
  applicant: [
    { href: '/applicant/dashboard', labelKey: 'navMyApplications', icon: <LayoutDashboard size={18} /> },
    { href: '/applicant/apply', labelKey: 'navNewApplication', icon: <FilePlus size={18} /> },
    { href: '/applicant/documents', labelKey: 'navUploadDocuments', icon: <FileText size={18} /> },
    { href: '/applicant/eds', labelKey: 'navEdsQueries', icon: <MessageSquareWarning size={18} /> },
    { href: '/applicant/payment', labelKey: 'navPayment', icon: <CreditCard size={18} /> },
  ],
  scrutiny: [
    { href: '/scrutiny/dashboard', labelKey: 'navDashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/scrutiny/review', labelKey: 'navReviewApplications', icon: <Search size={18} /> },
    { href: '/scrutiny/eds', labelKey: 'navEdsManagement', icon: <ClipboardList size={18} /> },
    { href: '/scrutiny/refer', labelKey: 'navReferToEac', icon: <Send size={18} /> },
  ],
  mom: [
    { href: '/mom/dashboard', labelKey: 'navDashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/mom/gist', labelKey: 'navGenerateGist', icon: <BookOpen size={18} /> },
    { href: '/mom/finalize', labelKey: 'navFinalizeIssueEc', icon: <CheckCircle size={18} /> },
  ],
};

export default function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const { language } = useLanguageStore();
  const items = navMap[role] ?? [];

  return (
    <aside
      className="w-64 md:w-68 shrink-0 pl-0 pr-0 pt-0 pb-0 h-full"
    >
      <div
        className="h-full rounded-r-3xl rounded-l-none border border-white/24 border-t-0 border-l-0 bg-slate-950/72 backdrop-blur-xl shadow-[0_14px_34px_rgba(5,19,36,0.32)] flex flex-col"
      >
        <nav className="flex-1 py-5 overflow-y-auto">
        <div className="px-5 mb-4">
          <p className="text-cyan-200/75 text-[10px] font-semibold uppercase tracking-[0.24em]">{getUiText('navigation', language)}</p>
        </div>
        <ul className="space-y-1 px-2">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`) ||
              pathname.startsWith(`${item.href}?`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-cyan-100/90 hover:bg-white/18'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(37,201,208,0.88), rgba(22,78,99,0.78))',
                    boxShadow: '0 4px 16px rgba(37,201,208,0.28), inset 0 1px rgba(255,255,255,0.2)',
                  } : undefined}
                >
                  <span className={`h-6 w-1 rounded-full ${isActive ? 'bg-white/90' : 'bg-transparent'}`} />
                  <span
                    className={`${
                      isActive
                        ? 'text-white scale-110 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]'
                        : 'text-cyan-300/75'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {getUiText(item.labelKey, language)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/24">
        <div className="mb-3">
          <LanguageSelector placement="sidebar" />
        </div>
        <p className="text-cyan-200/55 text-[10px] text-center font-medium">
          {getUiText('pariveshFooter', language)}
        </p>
      </div>
      </div>
    </aside>
  );
}
