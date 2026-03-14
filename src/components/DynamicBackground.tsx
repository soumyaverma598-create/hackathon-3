'use client';

import { motion } from 'framer-motion';

interface DynamicBackgroundProps {
  variant?: 'default' | 'landing' | 'login';
}

const DARK_CURVES = [
  {
    top: '-14%',
    left: '-12%',
    width: '62%',
    height: '56%',
    fill: 'linear-gradient(135deg, rgba(54,170,223,0.92), rgba(17,112,173,0.86))',
    shadow: '0 28px 52px rgba(2, 15, 35, 0.38)',
    radius: '58% 42% 52% 48% / 44% 44% 56% 56%',
    duration: 28,
  },
  {
    top: '-10%',
    left: '34%',
    width: '52%',
    height: '34%',
    fill: 'linear-gradient(125deg, rgba(44,203,214,0.78), rgba(27,126,164,0.82))',
    shadow: '0 20px 36px rgba(2, 15, 35, 0.28)',
    radius: '46% 54% 64% 36% / 52% 48% 52% 48%',
    duration: 24,
  },
  {
    top: '56%',
    left: '24%',
    width: '66%',
    height: '48%',
    fill: 'linear-gradient(140deg, rgba(23,126,164,0.88), rgba(20,95,151,0.88))',
    shadow: '0 24px 48px rgba(2, 15, 35, 0.34)',
    radius: '44% 56% 60% 40% / 58% 36% 64% 42%',
    duration: 30,
  },
  {
    top: '44%',
    left: '70%',
    width: '42%',
    height: '56%',
    fill: 'linear-gradient(145deg, rgba(56,172,221,0.92), rgba(27,126,164,0.92))',
    shadow: '0 20px 42px rgba(2, 15, 35, 0.3)',
    radius: '64% 36% 40% 60% / 40% 60% 48% 52%',
    duration: 26,
  },
];

const LIGHT_CURVES = [
  {
    top: '-18%',
    left: '-10%',
    width: '58%',
    height: '52%',
    fill: 'linear-gradient(135deg, rgba(171,229,252,0.78), rgba(131,213,243,0.62))',
    shadow: '0 18px 38px rgba(20, 77, 111, 0.16)',
    radius: '58% 42% 52% 48% / 44% 44% 56% 56%',
    duration: 28,
  },
  {
    top: '52%',
    left: '22%',
    width: '65%',
    height: '52%',
    fill: 'linear-gradient(145deg, rgba(129,209,239,0.54), rgba(185,237,250,0.7))',
    shadow: '0 20px 38px rgba(20, 77, 111, 0.12)',
    radius: '44% 56% 60% 40% / 58% 36% 64% 42%',
    duration: 30,
  },
];

const CONTOUR_LINES = [
  { top: '-8%', rotate: -10, dur: 30, opacity: 0.25 },
  { top: '8%', rotate: -7, dur: 34, opacity: 0.22 },
  { top: '24%', rotate: -4, dur: 38, opacity: 0.18 },
  { top: '56%', rotate: 8, dur: 32, opacity: 0.2 },
  { top: '72%', rotate: 12, dur: 36, opacity: 0.16 },
];

const DEFAULT_ORBS = [
  { top: '8%', left: '12%', size: 220, color: 'rgba(58, 194, 240, 0.24)', blur: 10, dur: 16 },
  { top: '18%', left: '74%', size: 180, color: 'rgba(41, 176, 219, 0.2)', blur: 8, dur: 18 },
  { top: '64%', left: '8%', size: 260, color: 'rgba(99, 221, 245, 0.2)', blur: 12, dur: 20 },
  { top: '70%', left: '72%', size: 210, color: 'rgba(27, 126, 164, 0.22)', blur: 10, dur: 22 },
];

const DEFAULT_SWEEPS = [
  { top: '10%', left: '-20%', width: '56%', rotate: -12, dur: 20, opacity: 0.16 },
  { top: '58%', left: '42%', width: '52%', rotate: 14, dur: 24, opacity: 0.14 },
];

export default function DynamicBackground({ variant = 'default' }: DynamicBackgroundProps) {
  const isDark = variant === 'landing' || variant === 'login';
  const curves = isDark ? DARK_CURVES : LIGHT_CURVES;

  return (
    <div className="dynamic-bg-wrapper">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'linear-gradient(136deg, #0a2a43 0%, #103f61 42%, #10334f 70%, #082034 100%)'
            : 'linear-gradient(145deg, #f3fbff 0%, #e7f6ff 38%, #ebf9ff 68%, #f7fcff 100%)',
        }}
      />

      {/* Curved 3D color planes */}
      {curves.map((curve, i) => (
        <motion.div
          key={`curve-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: curve.left,
            top: curve.top,
            width: curve.width,
            height: curve.height,
            background: curve.fill,
            borderRadius: curve.radius,
            boxShadow: curve.shadow,
            filter: isDark ? 'saturate(1.05)' : 'saturate(1)',
          }}
          animate={{
            x: [0, i % 2 === 0 ? 26 : -22, 0],
            y: [0, i % 2 === 0 ? -18 : 16, 0],
            rotate: [0, i % 2 === 0 ? -2 : 2, 0],
          }}
          transition={{
            duration: curve.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {!isDark && DEFAULT_ORBS.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: orb.top,
            left: orb.left,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, rgba(255,255,255,0) 72%)`,
            filter: `blur(${orb.blur}px)`,
          }}
          animate={{
            x: [0, i % 2 === 0 ? 26 : -24, 0],
            y: [0, i % 2 === 0 ? -20 : 18, 0],
            scale: [1, 1.07, 1],
          }}
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {!isDark && DEFAULT_SWEEPS.map((sweep, i) => (
        <motion.div
          key={`sweep-${i}`}
          className="absolute pointer-events-none"
          style={{
            top: sweep.top,
            left: sweep.left,
            width: sweep.width,
            height: '120px',
            transform: `rotate(${sweep.rotate}deg)`,
            background: `linear-gradient(90deg, rgba(255,255,255,0), rgba(127,219,245,${sweep.opacity}), rgba(255,255,255,0))`,
            filter: 'blur(1px)',
          }}
          animate={{
            x: [0, 36, 0],
            opacity: [0.45, 0.8, 0.45],
          }}
          transition={{
            duration: sweep.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Animated contour lines to mimic curved template strokes */}
      {CONTOUR_LINES.map((line, i) => (
        <motion.div
          key={`line-${i}`}
          className="absolute pointer-events-none"
          style={{
            top: line.top,
            left: '-18%',
            width: '136%',
            height: '62%',
            border: isDark
              ? `1px solid rgba(188, 243, 255, ${line.opacity})`
              : `1px solid rgba(61, 134, 166, ${line.opacity})`,
            borderRadius: '54% 46% 62% 38% / 44% 50% 50% 56%',
            transform: `rotate(${line.rotate}deg)`,
            boxShadow: isDark ? '0 0 24px rgba(130, 228, 255, 0.1)' : 'none',
          }}
          animate={{
            x: [0, i % 2 === 0 ? 14 : -12, 0],
            y: [0, i % 2 === 0 ? -10 : 8, 0],
            opacity: [line.opacity * 0.8, line.opacity, line.opacity * 0.8],
          }}
          transition={{
            duration: line.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}

      {/* Foreground readability overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, rgba(6,20,33,0.32) 0%, rgba(8,33,53,0.12) 42%, rgba(7,22,36,0.32) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.26) 100%)',
        }}
      />

      {/* Subtle grid overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)'
            : 'radial-gradient(circle at 1px 1px, rgba(22,78,99,0.03) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
