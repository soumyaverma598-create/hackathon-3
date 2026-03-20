'use client';

import { Bell, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useState, useRef, useEffect } from 'react';
import { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { getRoleText, getHeaderText, getCommonText } from '@/lib/translations';
import BrandLogo from '@/components/BrandLogo';

const roleBadgeColors: Record<UserRole, string> = {
  admin: 'bg-[#c4622d]/80',
  applicant: 'bg-[#1e3a6f]/80',
  scrutiny: 'bg-[#146b3a]/80',
  mom: 'bg-[#5b3fb8]/80',
};

const QUICK_SWITCH_CREDENTIALS = [
  { label: 'Admin', email: 'admin@moef.gov.in', password: 'admin123', role: 'admin' as UserRole },
  { label: 'Applicant', email: 'proponent@company.com', password: 'proponent123', role: 'applicant' as UserRole },
  { label: 'Scrutiny', email: 'scrutiny@moef.gov.in', password: 'scrutiny123', role: 'scrutiny' as UserRole },
  { label: 'MoM', email: 'mom@moef.gov.in', password: 'mom123', role: 'mom' as UserRole },
];

export default function GovHeader() {
  const { user, logout, login } = useAuthStore();
  const { language } = useLanguageStore();
  const { notifications, markAllRead } = useNotificationStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unread = notifications.filter((n) => !n.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showNotifs && !showProfileMenu) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifs, showProfileMenu]);

  const handleBellClick = () => {
    setBellAnimating(true);
    setTimeout(() => setBellAnimating(false), 600);
    setShowNotifs(!showNotifs);
    setShowProfileMenu(false);
  };

  const handleQuickSwitch = async (email: string, password: string, role: UserRole) => {
    setSwitchingTo(email);
    try {
      await login(email, password);
      const routes: Record<UserRole, string> = {
        admin: '/admin/dashboard',
        applicant: '/applicant/dashboard',
        scrutiny: '/scrutiny/dashboard',
        mom: '/mom/dashboard',
      };
      setShowProfileMenu(false);
      setShowNotifs(false);
      router.push(routes[role]);
    } finally {
      setSwitchingTo(null);
    }
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      window.setTimeout(() => setCopiedEmail(null), 1200);
    } catch {
      setCopiedEmail(null);
    }
  };

  return (
    <header className="sticky top-0 z-[120] pl-0 pr-0 pt-0">
      <div
        className="w-full border-b-2 border-[#c4622d] shadow-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 58, 111, 0.98), rgba(30, 58, 111, 0.96))',
        }}
      >
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#c4622d]/40 to-transparent" />

        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-7xl mx-auto w-full">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center shadow-md flex-shrink-0 border border-[#c4622d]/20">
              <BrandLogo className="w-10 h-10" />
            </div>

            <div className="min-w-0">
              <h1 className="text-white text-lg sm:text-xl font-bold tracking-wider">PARIVESH 3.0</h1>
              <p className="text-white/70 text-xs hidden sm:block">Environmental Clearance Portal</p>
            </div>
          </div>

          {/* Right: user info + notifications + logout */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification bell */}
              <div className="relative z-[130]" ref={notifRef}>
                <button
                  onClick={handleBellClick}
                  className="p-2 sm:p-2.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 transition-all duration-200"
                >
                  <Bell className="text-white/80 w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute top-0 right-0 bg-[#c4622d] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {unread}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 top-12 w-80 bg-white border border-[#1e3a6f]/10 rounded-lg shadow-lg z-[140] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e3a6f]/10 bg-[#f0f5fb]">
                      <span className="font-semibold text-[#1e3a6f] text-sm">{getHeaderText('notifications', language)}</span>
                      {unread > 0 && (
                        <button
                          onClick={() => { markAllRead(user.id); setShowNotifs(false); }}
                          className="text-xs text-[#1e3a6f] hover:underline transition-colors font-medium"
                        >
                          {getHeaderText('markAllRead', language)}
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-gray-400 text-sm">{getHeaderText('noNotifications', language)}</p>
                      ) : (
                        notifications.map((n, idx) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 border-b border-[#1e3a6f]/5 hover:bg-[#f9fafb] cursor-pointer transition-colors ${
                              !n.isRead ? 'bg-[#f0f5fb]/50' : ''
                            }`}
                          >
                            <p className={`text-sm font-medium ${!n.isRead ? 'text-[#1e3a6f]' : 'text-gray-600'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User info + profile dropdown */}
              <div className="relative z-[130]" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => { setShowProfileMenu((s) => !s); setShowNotifs(false); }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 bg-white/15 hover:bg-white/25 border border-white/20 transition-all duration-200"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-white text-sm font-semibold">{user.name}</p>
                    <p className="text-white/70 text-xs">{user.designation}</p>
                  </div>
                  <span className={`${roleBadgeColors[user.role]} text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1 transition-all`}>
                    {getRoleText(user.role as any, language)}
                  </span>
                  <ChevronDown className={`text-white/80 w-4 h-4 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-14 w-[19rem] sm:w-[20rem] bg-white border border-[#1e3a6f]/10 rounded-lg shadow-lg z-[140] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#1e3a6f]/10 bg-[#f0f5fb]">
                      <p className="font-bold text-[#1e3a6f]">{user.name}</p>
                      <p className="text-sm text-[#475569] mt-0.5">{user.designation}</p>
                    </div>

                    <div className="px-4 py-3 border-b border-[#1e3a6f]/10 bg-white">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-widest font-bold text-[#1e3a6f]">{getCommonText('currentCredentials', language)}</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-700"><span className="font-semibold text-[#475569]">{getCommonText('email', language)}:</span> {user.email}</p>
                          <p className="text-gray-700"><span className="font-semibold text-[#475569]">{getCommonText('department', language)}:</span> {user.department}</p>
                          <p className="text-gray-700"><span className="font-semibold text-[#475569]">{getCommonText('role', language)}:</span> {getRoleText(user.role as any, language)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-[#f9fafb]">
                      <div>
                        <p className="text-xs uppercase tracking-widest font-bold text-[#1e3a6f] mb-2">{getCommonText('quickSwitchCredentials', language)}</p>
                        <div className="space-y-1.5">
                          {QUICK_SWITCH_CREDENTIALS.map((item) => (
                            <div
                              key={item.email}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#1e3a6f]/15 bg-white hover:border-[#1e3a6f]/30 transition-all"
                            >
                              <button
                                type="button"
                                onClick={() => handleQuickSwitch(item.email, item.password, item.role)}
                                disabled={switchingTo !== null}
                                className="flex-1 text-left disabled:opacity-60"
                              >
                                <p className="font-semibold text-[#1e3a6f] text-sm">{item.label}</p>
                                <p className="text-xs text-[#475569] mt-0.5">{item.email}</p>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyEmail(item.email)}
                                className="text-xs font-semibold px-2.5 py-1 rounded-md border border-[#1e3a6f]/20 text-[#1e3a6f] hover:border-[#1e3a6f]/40 hover:bg-[#f0f5fb] transition-colors"
                              >
                                {copiedEmail === item.email ? getCommonText('copied', language) : getCommonText('copy', language)}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      {switchingTo && (
                        <p className="text-[0.7rem] font-semibold text-[#164e63] mt-1.5">{getHeaderText('switchingTo', language)}...</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={() => logout()}
                title={getHeaderText('notifications', language)}
                className="flex items-center gap-1.5 bg-[#c4622d]/90 hover:bg-[#c4622d] text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-[#c4622d]/30 hover:border-[#c4622d]/60"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">{getCommonText('logout', language)}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
