'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { UserRole } from '@/types/auth';
import GovHeader from './GovHeader';
import Sidebar from './Sidebar';
import DynamicBackground from './DynamicBackground';

interface PageShellProps {
  role: UserRole;
  children: React.ReactNode;
}

export default function PageShell({ role, children }: PageShellProps) {
  const { user } = useAuthStore();
  const { startPolling, stopPolling } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role !== role) { router.replace('/login'); return; }
    startPolling(user.id);
    return () => stopPolling();
  }, [user, role, router, startPolling, stopPolling]);

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Dynamic animated background */}
      <DynamicBackground />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <GovHeader />
        <div className="flex flex-1">
          <Sidebar role={role} />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
