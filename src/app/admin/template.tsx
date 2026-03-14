'use client';

import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const navOrder = [
  '/admin/dashboard',
  '/admin/users',
  '/admin/settings',
] as const;

function toAdminIndex(pathname: string): number {
  const basePath = pathname.split('?')[0];
  const index = navOrder.findIndex((item) => basePath.startsWith(item));
  return index === -1 ? 0 : index;
}

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);

  const direction = useMemo(() => {
    const currentIndex = toAdminIndex(pathname);
    const previousIndex = toAdminIndex(previousPathRef.current);
    return currentIndex >= previousIndex ? 1 : -1;
  }, [pathname]);

  useEffect(() => {
    previousPathRef.current = pathname;
  }, [pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 18 * direction, filter: 'blur(2px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, x: -14 * direction, filter: 'blur(1.5px)' }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
