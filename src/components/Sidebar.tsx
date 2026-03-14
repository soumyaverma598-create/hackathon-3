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
      className="w-56 min-h-screen flex flex-col animate-fade-slide-left"
      style={{
        background: 'rgba(10, 46, 26, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <nav className="flex-1 py-5">
        <div className="px-5 mb-3">
          <p className="text-emerald-400/60 text-[10px] font-semibold uppercase tracking-[0.2em]">Navigation</p>
        </div>
        <ul className="space-y-0.5 px-2">
          {items.map((item, idx) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '?');
            return (
              <li
                key={item.href}
                className="animate-fade-slide-left"
                style={{ animationDelay: `${0.05 + idx * 0.06}s` }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-250 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-green-200/60 hover:bg-white/6 hover:text-white/90 hover:translate-x-0.5'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(247,148,29,0.85), rgba(247,148,29,0.65))',
                    boxShadow: '0 4px 16px rgba(247,148,29,0.25), inset 0 1px rgba(255,255,255,0.15)',
                  } : undefined}
                >
                  <span
                    className={`transition-all duration-200 ${
                      isActive ? 'text-white scale-110 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]' : 'text-emerald-400/50'
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
      <div className="px-4 py-4 border-t border-white/5">
        <p
          className="text-emerald-500/40 text-[10px] text-center font-medium"
          style={{ animation: 'pulseSoft 4s ease-in-out infinite' }}
        >
          PARIVESH 3.0 &copy; MoEFCC 2026
        </p>
      </div>
    </aside>
  );
}
