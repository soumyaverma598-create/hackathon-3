'use client';

import { Bell, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useState, useRef, useEffect } from 'react';
import { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';

const roleLabels: Record<UserRole, string> = {
  admin: 'System Admin',
  applicant: 'Proponent',
  scrutiny: 'Scrutiny Officer',
  mom: 'MoM Secretary',
};

const roleBadgeColors: Record<UserRole, string> = {
  admin: 'bg-red-700',
  applicant: 'bg-blue-700',
  scrutiny: 'bg-yellow-700',
  mom: 'bg-indigo-700',
};

const QUICK_SWITCH_CREDENTIALS = [
  { label: 'Admin', email: 'admin@moef.gov.in', password: 'admin123', role: 'admin' as UserRole },
  { label: 'Applicant', email: 'proponent@company.com', password: 'proponent123', role: 'applicant' as UserRole },
  { label: 'Scrutiny', email: 'scrutiny@moef.gov.in', password: 'scrutiny123', role: 'scrutiny' as UserRole },
  { label: 'MoM', email: 'mom@moef.gov.in', password: 'mom123', role: 'mom' as UserRole },
];

export default function GovHeader() {
  const { user, logout, login } = useAuthStore();
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
    <header className="w-full shadow-md animate-fade-slide-up" style={{ background: 'linear-gradient(135deg, #1a6b3c 0%, #0f4a2a 100%)' }}>
      {/* Top GOI orange strip */}
      <div
        className="h-1 w-full"
        style={{
          background: 'linear-gradient(90deg, #f7941d, #ffb84d, #f7941d)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3.5s linear infinite',
        }}
      />

      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Emblem + Title */}
        <div className="flex items-center gap-4">
          {/* National Emblem — pulse + slow-spin on spokes */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0 animate-pulse-soft">
            <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" suppressHydrationWarning>
              <circle cx="32" cy="32" r="30" fill="#fff" stroke="#1a6b3c" strokeWidth="2"/>
              <g className="animate-spin-slow" style={{ transformOrigin: '32px 32px' }} suppressHydrationWarning>
                <circle cx="32" cy="32" r="14" fill="none" stroke="#f7941d" strokeWidth="2"/>
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i / 24) * 2 * Math.PI;
                  const r = (n: number) => Math.round(n * 1000) / 1000;
                  return <line key={i} x1={r(32 + 14 * Math.cos(angle))} y1={r(32 + 14 * Math.sin(angle))} x2={r(32 + 17 * Math.cos(angle))} y2={r(32 + 17 * Math.sin(angle))} stroke="#f7941d" strokeWidth="1" suppressHydrationWarning />;
                })}
              </g>
              <text x="32" y="36" fontSize="12" fontWeight="bold" fill="#1a6b3c" textAnchor="middle">अशोक</text>
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white text-xl font-bold tracking-wide">PARIVESH 3.0</h1>
              <Shield
                className="text-[#f7941d] w-4 h-4 transition-transform duration-300 hover:scale-125 hover:drop-shadow-[0_0_4px_rgba(247,148,29,0.9)]"
              />
            </div>
            <p className="text-green-200 text-xs">
              Ministry of Environment, Forest and Climate Change &bull; GoI
            </p>
          </div>
        </div>

        {/* Right: user info + notifications + logout */}
        {user && (
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleBellClick}
                className="relative p-2 rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-110"
              >
                <Bell
                  className="text-white w-5 h-5 transition-transform"
                  style={bellAnimating ? { animation: 'wiggle 0.5s ease-in-out' } : undefined}
                />
                {unread > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#f7941d] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse-soft">
                    {unread}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-10 w-80 bg-white rounded-lg shadow-2xl z-50 border border-gray-100 animate-slide-down">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                    {unread > 0 && (
                      <button
                        onClick={() => { markAllRead(user.id); setShowNotifs(false); }}
                        className="text-xs text-[#1a6b3c] hover:underline transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-gray-400 text-sm">No notifications</p>
                    ) : (
                      notifications.map((n, idx) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors animate-fade-slide-up ${
                            !n.isRead ? 'bg-green-50' : ''
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
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => { setShowProfileMenu((s) => !s); setShowNotifs(false); }}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-white text-sm font-semibold">{user.name}</p>
                  <p className="text-green-200 text-xs">{user.designation}</p>
                </div>
                <span className={`${roleBadgeColors[user.role]} text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all hover:scale-105`}>
                  {roleLabels[user.role]}
                </span>
                <ChevronDown className={`text-green-200 w-4 h-4 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-[21rem] bg-white rounded-lg shadow-2xl z-50 border border-gray-100 animate-slide-down overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.designation}</p>
                  </div>

                  <div className="px-4 py-3 border-b border-gray-100 space-y-1.5">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">Current Credentials</p>
                    <p className="text-xs text-gray-700"><span className="text-gray-500">Email:</span> {user.email}</p>
                    <p className="text-xs text-gray-700"><span className="text-gray-500">Department:</span> {user.department}</p>
                    <p className="text-xs text-gray-700"><span className="text-gray-500">Role:</span> {roleLabels[user.role]}</p>
                  </div>

                  <div className="px-4 py-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-bold mb-2">Quick Switch Credentials</p>
                    <div className="space-y-2">
                      {QUICK_SWITCH_CREDENTIALS.map((item) => (
                        <div
                          key={item.email}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:bg-green-50 hover:border-[#1a6b3c]/30 transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => handleQuickSwitch(item.email, item.password, item.role)}
                            disabled={switchingTo !== null}
                            className="flex-1 text-left disabled:opacity-60"
                          >
                            <p className="text-xs font-semibold text-gray-800">{item.label}</p>
                            <p className="text-[11px] text-gray-500">{item.email}</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(item.email)}
                            className="text-[11px] font-semibold px-2 py-1 rounded border border-gray-200 text-gray-600 hover:text-[#1a6b3c] hover:border-[#1a6b3c]/40 transition-colors"
                            title="Copy email"
                          >
                            {copiedEmail === item.email ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      ))}
                    </div>
                    {switchingTo && (
                      <p className="text-[11px] text-[#1a6b3c] mt-2">Switching account...</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={() => logout()}
              title="Logout"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border border-white/20 hover:scale-105 hover:shadow-md hover:border-white/40"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom saffron strip */}
      <div className="bg-[#f7941d]/30 h-0.5 w-full" />
    </header>
  );
}
