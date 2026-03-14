'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

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
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={pathname}
                className="route-transition-shell max-w-6xl mx-auto rounded-2xl border border-white/36 bg-white/86 backdrop-blur-md px-4 py-4 shadow-[0_12px_30px_rgba(8,35,55,0.16)] md:px-5 md:py-5"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                        opacity: { duration: 0.3, ease: [0.33, 1, 0.68, 1] },
                        y: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                      }
                }
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
