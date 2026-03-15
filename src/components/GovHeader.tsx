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
  admin: 'bg-red-600/80',
  applicant: 'bg-blue-600/80',
  scrutiny: 'bg-yellow-600/80',
  mom: 'bg-indigo-600/80',
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
        className="glass-dark rounded-t-none rounded-bl-none rounded-br-2xl shadow-[0_16px_40px_rgba(4,18,34,0.35)] overflow-visible"
        style={{
          background: 'linear-gradient(135deg, rgba(7,34,53,0.97), rgba(11,52,79,0.95))',
        }}
      >
        <div
          className="h-[2px] w-full"
          style={{
            background: 'linear-gradient(90deg, rgba(37,201,208,0.25), rgba(122,232,239,0.75), rgba(37,201,208,0.25))',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3.5s linear infinite',
          }}
        />

        <div className="flex items-center justify-between px-5 py-3">
          {/* Left: Emblem + Title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* National Emblem */}
            <div className="w-11 h-11 bg-white/95 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ring-2 ring-white/24 overflow-hidden">
              <BrandLogo className="w-11 h-11 scale-[1.08]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-white text-lg sm:text-xl font-bold tracking-wide truncate">PARIVESH 3.0</h1>
                <Shield
                  className="text-[#25c9d0] w-4 h-4 transition-all duration-300 hover:scale-125 hover:drop-shadow-[0_0_6px_rgba(37,201,208,0.9)]"
                />
              </div>
              <p className="text-cyan-200/80 text-[11px] sm:text-xs truncate">
                Ministry of Environment, Forest and Climate Change &bull; GoI
              </p>
            </div>
          </div>

          {/* Right: user info + notifications + logout */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification bell */}
              <div className="relative z-[130]" ref={notifRef}>
                <button
                  onClick={handleBellClick}
                  className="relative p-2.5 rounded-xl bg-white/16 hover:bg-white/28 border border-white/24 transition-all duration-200 hover:scale-105"
                >
                  <Bell
                    className="text-white/80 w-5 h-5 transition-transform"
                    style={bellAnimating ? { animation: 'wiggle 0.5s ease-in-out' } : undefined}
                  />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 bg-[#25c9d0] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse-soft shadow-lg shadow-cyan-500/30">
                      {unread}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 top-12 w-80 glass-card-strong rounded-xl shadow-2xl z-[140] animate-slide-down overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/50">
                      <span className="font-semibold text-gray-800 text-sm">{getHeaderText('notifications', language)}</span>
                      {unread > 0 && (
                        <button
                          onClick={() => { markAllRead(user.id); setShowNotifs(false); }}
                          className="text-xs text-[#164e63] hover:underline transition-colors font-medium"
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
                            className={`px-4 py-3 border-b border-gray-50/50 hover:bg-[#164e63]/5 cursor-pointer transition-colors animate-fade-slide-up ${
                              !n.isRead ? 'bg-cyan-50/50' : ''
                            }`}
                            style={{ animationDelay: `${idx * 0.04}s` }}
                          >
                            <p className={`text-sm font-medium ${!n.isRead ? 'text-gray-900' : 'text-gray-500'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
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
                  className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white/16 hover:bg-white/28 border border-white/24 transition-all duration-200"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-white text-sm font-semibold">{user.name}</p>
                    <p className="text-cyan-200/60 text-xs">{user.designation}</p>
                  </div>
                  <span className={`${roleBadgeColors[user.role]} backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all hover:scale-105 shadow-sm`}>
                    {getRoleText(user.role as any, language)}
                  </span>
                  <ChevronDown className={`text-cyan-200/75 w-4 h-4 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-14 w-[19rem] sm:w-[20rem] glass-card-strong rounded-xl shadow-2xl z-[140] animate-slide-down overflow-hidden">
                    <div className="px-3.5 py-2.5 border-b border-[#164e63]/12 bg-gradient-to-r from-[#164e63]/13 via-[#25c9d0]/9 to-transparent">
                      <p className="ui-panel-title">{user.name}</p>
                      <p className="ui-panel-subtitle mt-0.5">{user.designation}</p>
                    </div>

                    <div className="px-3.5 py-2.5 border-b border-[#164e63]/10 bg-[#f3f9fd]">
                      <div className="px-2 py-1.5 space-y-1.5">
                        <p className="text-[0.7rem] uppercase tracking-[0.08em] font-semibold text-[#476b80]">{getCommonText('currentCredentials', language)}</p>
                        <p className="ui-kv-row"><span className="ui-kv-label">{getCommonText('email', language)}:</span><span className="ui-kv-value break-all">{user.email}</span></p>
                        <p className="ui-kv-row"><span className="ui-kv-label">{getCommonText('department', language)}:</span><span className="ui-kv-value">{user.department}</span></p>
                        <p className="ui-kv-row"><span className="ui-kv-label">{getCommonText('role', language)}:</span><span className="ui-kv-value">{getRoleText(user.role as any, language)}</span></p>
                      </div>
                    </div>

                    <div className="px-3.5 py-2.5 bg-[#ecf5fb]">
                      <div className="px-2 py-1.5">
                        <p className="text-[0.7rem] uppercase tracking-[0.08em] font-semibold text-[#476b80] mb-1.5">{getCommonText('quickSwitchCredentials', language)}</p>
                        <div className="space-y-1.5">
                          {QUICK_SWITCH_CREDENTIALS.map((item) => (
                            <div
                              key={item.email}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#164e63]/10 bg-white/85 hover:bg-cyan-50/75 hover:border-[#164e63]/20 transition-all"
                            >
                              <button
                                type="button"
                                onClick={() => handleQuickSwitch(item.email, item.password, item.role)}
                                disabled={switchingTo !== null}
                                className="flex-1 text-left disabled:opacity-60"
                              >
                                <p className="text-[0.87rem] leading-none font-semibold text-[#0f3650]">{item.label}</p>
                                <p className="text-[0.8rem] text-[#527086] mt-1 leading-none">{item.email}</p>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyEmail(item.email)}
                                className="text-[0.8rem] font-semibold px-2.5 py-1 rounded-md border border-[#164e63]/16 text-[#355e75] hover:text-[#0f3650] hover:border-[#164e63]/35 hover:bg-white transition-colors"
                                title={getCommonText('copy', language)}
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
                className="flex items-center gap-1.5 bg-white/16 hover:bg-white/30 text-white/90 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-white/24 hover:border-white/36 hover:scale-105"
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
