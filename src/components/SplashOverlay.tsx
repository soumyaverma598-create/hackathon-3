'use client';

import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import BrandLogo from '@/components/BrandLogo';

interface SplashOverlayProps {
  onFinished: () => void;
}

export default function SplashOverlay({ onFinished }: SplashOverlayProps) {
  const [phase, setPhase] = useState<'logo' | 'title' | 'done'>('logo');

  const showTitle = phase === 'title' || phase === 'done';

  return (
    <AnimatePresence onExitComplete={onFinished}>
      {phase !== 'done' && (
        <motion.div
          key="splash-curtain"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #164e63 0%, #0f3650 100%)' }}
          exit={{
            opacity: 0,
            scale: 1.12,
            filter: 'blur(6px)',
          }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* ── Subtle radial glow in background ── */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(247,148,29,0.08) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ── Logo — layout prop ensures smooth glide when title expands below ── */}
          <LayoutGroup>
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                layout: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              }}
              onAnimationComplete={() => {
                if (phase === 'logo') setPhase('title');
              }}
            >
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden">
                <BrandLogo className="w-32 h-32 scale-[1.1]" />
              </div>
            </motion.div>

            {/* ── Title area — always mounted, height animates from 0 → auto ── */}
            <motion.div
              layout
              className="overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={
                showTitle
                  ? { opacity: 1, height: 'auto' }
                  : { opacity: 0, height: 0 }
              }
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="text-center pt-10 relative"
                initial="hidden"
                animate={showTitle ? 'visible' : 'hidden'}
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.18, delayChildren: 0.15 },
                  },
                }}
                onAnimationComplete={() => {
                  if (phase === 'title') {
                    setTimeout(() => setPhase('done'), 900);
                  }
                }}
              >
                {/* PARIVESH 3.0 */}
                <motion.h1
                  className="text-white text-6xl font-extrabold tracking-wide"
                  variants={{
                    hidden: { opacity: 0, y: 35, filter: 'blur(8px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  PARIVESH 3.0
                </motion.h1>

                {/* Shimmer line sweeps across */}
                <motion.div
                  className="absolute top-0 left-0 h-full w-[35%] pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                  }}
                  initial={{ x: '-100%' }}
                  animate={showTitle ? { x: '400%' } : { x: '-100%' }}
                  transition={{ duration: 1.5, delay: 0.4, ease: 'easeInOut' }}
                />

                {/* Hindi / English subtitle */}
                <motion.p
                  className="text-cyan-200 text-xl font-medium mt-3"
                  variants={{
                    hidden: { opacity: 0, y: 25, filter: 'blur(6px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  पर्यावरण / ENVIRONMENT
                </motion.p>

                {/* Portal tagline */}
                <motion.p
                  className="text-cyan-300 text-sm mt-2"
                  variants={{
                    hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  Environmental Clearance Portal
                </motion.p>

                {/* Accent line */}
                <motion.div
                  className="mx-auto mt-6 h-[2px] rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, #25c9d0, transparent)' }}
                  variants={{
                    hidden: { opacity: 0, width: 0 },
                    visible: { opacity: 1, width: 100 },
                  }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Ministry line */}
                <motion.p
                  className="text-cyan-200/60 text-xs mt-4 tracking-widest uppercase"
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  Ministry of Environment, Forest and Climate Change
                </motion.p>
              </motion.div>
            </motion.div>
          </LayoutGroup>

          {/* ── Floating particles ── */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/26"
              style={{
                left: `${15 + i * 10}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, (i % 2 === 0 ? 15 : -15), 0],
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: 3 + i * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
