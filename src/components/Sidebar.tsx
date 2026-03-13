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
    <aside className="w-56 min-h-screen flex flex-col" style={{ background: '#0f4a2a' }}>
      <nav className="flex-1 py-4">
        <div className="px-4 mb-2">
          <p className="text-green-400 text-[10px] font-semibold uppercase tracking-widest">Navigation</p>
        </div>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '?');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#f7941d] text-white shadow-md'
                      : 'text-green-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-green-400'}>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-green-500 text-[10px] text-center">PARIVESH 3.0 &copy; MoEFCC 2026</p>
      </div>
    </aside>
  );
}
