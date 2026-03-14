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

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navMap: Record<UserRole, NavItem[]> = {
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/admin/users', label: 'User Management', icon: <Users size={18} /> },
    { href: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
  ],
  applicant: [
    { href: '/applicant/dashboard', label: 'My Applications', icon: <LayoutDashboard size={18} /> },
    { href: '/applicant/apply', label: 'New Application', icon: <FilePlus size={18} /> },
    { href: '/applicant/documents', label: 'Upload Documents', icon: <FileText size={18} /> },
    { href: '/applicant/eds', label: 'EDS Queries', icon: <MessageSquareWarning size={18} /> },
    { href: '/applicant/payment', label: 'Payment', icon: <CreditCard size={18} /> },
  ],
  scrutiny: [
    { href: '/scrutiny/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/scrutiny/review', label: 'Review Applications', icon: <Search size={18} /> },
    { href: '/scrutiny/eds', label: 'EDS Management', icon: <ClipboardList size={18} /> },
    { href: '/scrutiny/refer', label: 'Refer to EAC', icon: <Send size={18} /> },
  ],
  mom: [
    { href: '/mom/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/mom/gist', label: 'Generate Gist', icon: <BookOpen size={18} /> },
    { href: '/mom/finalize', label: 'Finalize & Issue EC', icon: <CheckCircle size={18} /> },
  ],
};

export default function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = navMap[role] ?? [];

  return (
    <aside
      className="w-64 md:w-68 shrink-0 pl-4 pr-2 py-4"
      style={{
        minHeight: 'calc(100vh - 84px)',
      }}
    >
      <div
        className="h-full rounded-3xl border border-white/24 bg-slate-950/72 backdrop-blur-xl shadow-[0_14px_34px_rgba(5,19,36,0.32)] flex flex-col"
      >
        <nav className="flex-1 py-5 overflow-y-auto">
        <div className="px-5 mb-4">
          <p className="text-cyan-200/75 text-[10px] font-semibold uppercase tracking-[0.24em]">Navigation</p>
        </div>
        <ul className="space-y-1 px-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '?');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-cyan-100/80 hover:bg-white/22 hover:text-white hover:translate-x-0.5'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(37,201,208,0.88), rgba(22,78,99,0.78))',
                    boxShadow: '0 4px 16px rgba(37,201,208,0.28), inset 0 1px rgba(255,255,255,0.2)',
                  } : undefined}
                >
                  <span className={`h-6 w-1 rounded-full ${isActive ? 'bg-white/90' : 'bg-transparent'}`} />
                  <span
                    className={`transition-all duration-200 ${
                      isActive ? 'text-white scale-110 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]' : 'text-cyan-400/50'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/24">
        <p
          className="text-cyan-200/55 text-[10px] text-center font-medium"
          style={{ animation: 'pulseSoft 4s ease-in-out infinite' }}
        >
          PARIVESH 3.0 &copy; MoEFCC 2026
        </p>
      </div>
      </div>
    </aside>
  );
}
