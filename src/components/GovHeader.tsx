'use client';

import { Bell, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useState } from 'react';
import { UserRole } from '@/types/auth';

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

export default function GovHeader() {
  const { user, logout } = useAuthStore();
  const { notifications, markAllRead } = useNotificationStore();
  const [showNotifs, setShowNotifs] = useState(false);

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="w-full shadow-md" style={{ background: 'linear-gradient(135deg, #1a6b3c 0%, #0f4a2a 100%)' }}>
      {/* Top GOI strip */}
      <div className="bg-[#f7941d] h-1 w-full" />

      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Emblem + Title */}
        <div className="flex items-center gap-4">
          {/* National Emblem SVG placeholder */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
            <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" fill="#fff" stroke="#1a6b3c" strokeWidth="2"/>
              <circle cx="32" cy="32" r="14" fill="none" stroke="#f7941d" strokeWidth="2"/>
              {/* Spokes */}
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i / 24) * 2 * Math.PI;
                const x1 = 32 + 14 * Math.cos(angle);
                const y1 = 32 + 14 * Math.sin(angle);
                const x2 = 32 + 17 * Math.cos(angle);
                const y2 = 32 + 17 * Math.sin(angle);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f7941d" strokeWidth="1" />;
              })}
              <text x="32" y="36" fontSize="12" fontWeight="bold" fill="#1a6b3c" textAnchor="middle">अशोक</text>
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white text-xl font-bold tracking-wide">PARIVESH 3.0</h1>
              <Shield className="text-[#f7941d] w-4 h-4" />
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
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Bell className="text-white w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#f7941d] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-10 w-80 bg-white rounded-lg shadow-2xl z-50 border border-gray-100">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-800 text-sm">Notifications</span>
                    {unread > 0 && (
                      <button
                        onClick={() => { markAllRead(user.id); setShowNotifs(false); }}
                        className="text-xs text-[#1a6b3c] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-gray-400 text-sm">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                            !n.isRead ? 'bg-green-50' : ''
                          }`}
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

            {/* User info */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-white text-sm font-semibold">{user.name}</p>
                <p className="text-green-200 text-xs">{user.designation}</p>
              </div>
              <span className={`${roleBadgeColors[user.role]} text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}>
                {roleLabels[user.role]}
              </span>
              <ChevronDown className="text-green-200 w-4 h-4" />
            </div>

            {/* Logout */}
            <button
              onClick={() => logout()}
              title="Logout"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-white/20"
            >
              <LogOut className="w-4 h-4" />
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
