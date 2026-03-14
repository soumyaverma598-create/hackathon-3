'use client';

import { motion } from 'framer-motion';

interface DynamicBackgroundProps {
  variant?: 'default' | 'landing' | 'login';
}

const BLOBS = [
  { x: '10%', y: '20%', size: 600, color: 'rgba(26, 107, 60, 0.08)', dur: 20 },
  { x: '80%', y: '10%', size: 500, color: 'rgba(247, 148, 29, 0.06)', dur: 25 },
  { x: '50%', y: '70%', size: 550, color: 'rgba(26, 107, 60, 0.06)', dur: 22 },
  { x: '20%', y: '80%', size: 450, color: 'rgba(15, 74, 42, 0.07)', dur: 18 },
  { x: '70%', y: '50%', size: 400, color: 'rgba(247, 148, 29, 0.05)', dur: 24 },
];

const PARTICLES = Array.from({ length: 30 }).map((_, i) => ({
  left: `${(i * 3.3 + (i * 7.1 % 5)) % 100}%`,
  top: `${(i * 3.7 + (i * 11.3 % 5)) % 100}%`,
  size: 2 + (i % 3),
  delay: i * 0.3,
  dur: 4 + (i % 4) * 1.5,
}));

export default function DynamicBackground({ variant = 'default' }: DynamicBackgroundProps) {
  const isLanding = variant === 'landing';

  return (
    <div className="dynamic-bg-wrapper">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: isLanding
            ? 'linear-gradient(135deg, #0a2e1a 0%, #0f4a2a 25%, #1a6b3c 50%, #0d3d24 75%, #071f10 100%)'
            : 'linear-gradient(145deg, #f0fdf4 0%, #e8f5ee 30%, #f0f7ff 60%, #fefce8 100%)',
        }}
      />

      {/* Animated mesh gradient blobs */}
      {BLOBS.map((blob, i) => (
        <motion.div
          key={`blob-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle, ${
              isLanding ? blob.color.replace(/[\d.]+\)$/, '0.12)') : blob.color
            } 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 50 * (i % 2 === 0 ? 1 : -1), -30, 0],
            y: [0, -40, 30 * (i % 2 === 0 ? -1 : 1), 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: blob.dur,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: isLanding
              ? 'rgba(255, 255, 255, 0.15)'
              : 'rgba(26, 107, 60, 0.08)',
          }}
          animate={{
            y: [0, -20 - (i % 3) * 10, 0],
            x: [0, (i % 2 === 0 ? 10 : -10), 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}

      {/* Subtle grid overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: isLanding
            ? 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)'
            : 'radial-gradient(circle at 1px 1px, rgba(26,107,60,0.02) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
