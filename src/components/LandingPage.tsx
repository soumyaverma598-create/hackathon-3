'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Shield,
  FileCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  BarChart3,
  Users,
  FileStack,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import DynamicBackground from './DynamicBackground';
import LanguageSelector from './LanguageSelector';

/* ─── Animated counter hook ─────────────────────────── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.span
      ref={ref}
      className="tabular-nums"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
    >
      {isInView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CountUp target={target} />
          {suffix}
        </motion.span>
      ) : '0'}
    </motion.span>
  );
}

function CountUp({ target }: { target: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref}>
      {isInView ? <SimpleCounter target={target} /> : '0'}
    </span>
  );
}

function CountUpInner({ target, isInView }: { target: number; isInView: boolean }) {
  const value = useRef(0);

  return (
    <motion.span
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      <MotionCountValue target={target} isInView={isInView} currentRef={value} />
    </motion.span>
  );
}

function MotionCountValue({ target, isInView }: { target: number; isInView: boolean; currentRef: React.MutableRefObject<number> }) {
  return (
    <motion.span>
      {isInView ? <SimpleCounter target={target} /> : '0'}
    </motion.span>
  );
}

function SimpleCounter({ target }: { target: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  const animate = () => {
    if (hasAnimated.current || !nodeRef.current) return;
    hasAnimated.current = true;
    const duration = 2000;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      if (nodeRef.current) {
        nodeRef.current.textContent = Math.round(eased * target).toLocaleString();
      }
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return (
    <span ref={(el) => {
      (nodeRef as React.MutableRefObject<HTMLSpanElement | null>).current = el;
      if (el) animate();
    }}>
      0
    </span>
  );
}

/* ─── Features data ─────────────────────────────────── */
const FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Single Window Clearance',
    description: 'One unified portal for all Environmental, Forest, Wildlife and CRZ clearances. No more running between departments.',
    gradient: 'from-cyan-500 to-teal-600',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Real-time Tracking',
    description: 'Track your application status at every stage. Get instant notifications on updates, queries, and approvals.',
    gradient: 'from-sky-500 to-cyan-600',
  },
  {
    icon: <FileCheck className="w-6 h-6" />,
    title: 'EDS Query Management',
    description: 'Streamlined Expert Data Stipulation queries. Respond to scrutiny observations directly through the portal.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Digital EC Certificates',
    description: 'Receive digitally signed Environmental Clearance certificates. Secure, verifiable, and instantly downloadable.',
    gradient: 'from-purple-500 to-violet-600',
  },
];

/* ─── Workflow steps ────────────────────────────────── */
const WORKFLOW_STEPS = [
  { icon: <FilePlus className="w-5 h-5" />, label: 'Submit Application', desc: 'Fill Form 1 / Form 1A with project details' },
  { icon: <FileStack className="w-5 h-5" />, label: 'Upload Documents', desc: 'EIA Report, NOC, maps, and compliance docs' },
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Scrutiny Review', desc: 'Expert committee reviews your application' },
  { icon: <CheckCircle2 className="w-5 h-5" />, label: 'EC Granted', desc: 'Receive your Environmental Clearance certificate' },
];

function FilePlus(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M9 15h6" />
      <path d="M12 12v6" />
    </svg>
  );
}

/* ─── Stats data ────────────────────────────────────── */
const STATS = [
  { value: 45000, suffix: '+', label: 'Applications Processed', icon: <FileStack className="w-5 h-5" /> },
  { value: 28, suffix: '+', label: 'States & UTs Covered', icon: <MapPin className="w-5 h-5" /> },
  { value: 12000, suffix: '+', label: 'Clearances Issued', icon: <CheckCircle2 className="w-5 h-5" /> },
  { value: 3500, suffix: '+', label: 'Registered Users', icon: <Users className="w-5 h-5" /> },
];

/* ─── Stagger animation variants ────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 },
  },
};

/* ═══════════════════════════════════════════════════════
   LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function LandingPage() {
  const router = useRouter();
  useEffect(() => {
    // Always start the landing experience from the top on a hard refresh.
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });

  const workflowRef = useRef(null);
  const workflowInView = useInView(workflowRef, { once: true, amount: 0.3 });

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });

  return (
    <div className="min-h-screen relative">
      <LanguageSelector placement="public" />
      {/* Dynamic background for landing */}
      <DynamicBackground variant="landing" />

      <div className="fixed bottom-6 right-4 z-30 sm:hidden">
        <button
          onClick={() => router.push('/login')}
          className="group inline-flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold text-sm shadow-2xl border border-white/36 backdrop-blur-md transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(37,201,208,0.95), rgba(29,184,196,0.95))',
          }}
        >
          Login
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ─── HERO SECTION ─────────────────────────────── */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <motion.div
          className="text-center max-w-4xl mx-auto rounded-[32px] border border-white/36 bg-slate-950/56 backdrop-blur-xl px-8 py-10 md:px-12 md:py-12 shadow-[0_24px_60px_rgba(2,14,28,0.52)]"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          {/* Emblem */}
          <motion.div
            className="w-24 h-24 bg-white/95 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl ring-4 ring-white/10"
            initial={{ opacity: 0, scale: 0.5, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg className="w-20 h-20" viewBox="0 0 64 64" fill="none" suppressHydrationWarning>
              <circle cx="32" cy="32" r="30" fill="#fff" stroke="#164e63" strokeWidth="2"/>
              <g className="animate-spin-slow" style={{ transformOrigin: '32px 32px' }} suppressHydrationWarning>
                <circle cx="32" cy="32" r="14" fill="none" stroke="#25c9d0" strokeWidth="2"/>
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i / 24) * 2 * Math.PI;
                  const r = (n: number) => Math.round(n * 1000) / 1000;
                  return (
                    <line key={i}
                      x1={r(32 + 14 * Math.cos(angle))} y1={r(32 + 14 * Math.sin(angle))}
                      x2={r(32 + 18 * Math.cos(angle))} y2={r(32 + 18 * Math.sin(angle))}
                      stroke="#25c9d0" strokeWidth="1" suppressHydrationWarning
                    />
                  );
                })}
              </g>
              <text x="32" y="36" fontSize="10" fontWeight="bold" fill="#164e63" textAnchor="middle">अशोक</text>
            </svg>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-white text-6xl md:text-7xl font-extrabold tracking-tight mb-4 [text-shadow:0_8px_30px_rgba(0,0,0,0.45)]">
              PARIVESH <span className="text-[#25c9d0]">3.0</span>
            </h1>
          </motion.div>

          <motion.p
            className="text-cyan-100 text-xl md:text-2xl font-semibold mb-3 [text-shadow:0_4px_20px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            पर्यावरण / ENVIRONMENT
          </motion.p>

          <motion.p
            className="text-cyan-100/90 text-lg mb-2"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            Environmental Clearance Portal
          </motion.p>

          <motion.p
            className="text-cyan-100/80 text-sm tracking-widest uppercase mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            Ministry of Environment, Forest and Climate Change &bull; Government of India
          </motion.p>

          {/* Accent line */}
          <motion.div
            className="mx-auto h-[2px] rounded-full mb-10"
            style={{ background: 'linear-gradient(90deg, transparent, #25c9d0, transparent)' }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 120, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          />

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
          >
            <button
              onClick={() => router.push('/login')}
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #25c9d0, #1db8c4)',
                boxShadow: '0 8px 32px rgba(37, 201, 208, 0.34)',
              }}
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white/95 font-semibold text-lg border border-white/36 hover:bg-white/30 hover:border-white/36 transition-all duration-300 backdrop-blur-sm"
            >
              Learn More
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5 text-white/30" />
          </motion.div>
        </motion.div>

      </section>

      {/* ─── FEATURES SECTION ─────────────────────────── */}
      <section id="features" ref={featuresRef} className="relative z-10 py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-[#25c9d0] text-xs font-bold tracking-[0.3em] uppercase mb-4 px-4 py-1.5 rounded-full border border-[#25c9d0]/20 bg-[#25c9d0]/5">
              Platform Features
            </span>
            <h2 className="text-white text-4xl md:text-5xl font-extrabold mb-4">
              Everything you need,<br />
              <span className="text-[#25c9d0]">in one place</span>
            </h2>
            <p className="text-cyan-100/92 text-lg max-w-2xl mx-auto">
              PARIVESH 3.0 digitizes the entire Environmental Clearance workflow, making it faster, transparent, and accessible.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? 'visible' : 'hidden'}
          >
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group relative p-8 rounded-2xl border border-white/36 transition-all duration-500 hover:border-white/30 overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.16)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(22,78,99,0.16), rgba(37,201,208,0.12))' }}
                />

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-white text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-cyan-100/92 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── WORKFLOW SECTION ─────────────────────────── */}
      <section ref={workflowRef} className="relative z-10 py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={workflowInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-cyan-400 text-xs font-bold tracking-[0.3em] uppercase mb-4 px-4 py-1.5 rounded-full border border-emerald-400/20 bg-cyan-400/5">
              How It Works
            </span>
            <h2 className="text-white text-4xl md:text-5xl font-extrabold mb-4">
              Simple. Transparent. <span className="text-cyan-400">Efficient.</span>
            </h2>
            <p className="text-cyan-100/90 text-lg max-w-xl mx-auto">
              From application submission to EC certificate — a streamlined 4-step process.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <motion.div
              className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 hidden md:block"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(37,201,208,0.35), rgba(56,172,221,0.35), transparent)' }}
              initial={{ scaleX: 0 }}
              animate={workflowInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.3 }}
            />

            <motion.div
              className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10"
              variants={containerVariants}
              initial="hidden"
              animate={workflowInView ? 'visible' : 'hidden'}
            >
              {WORKFLOW_STEPS.map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Step number ring */}
                  <div className="relative mb-5">
                    <motion.div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white border-2 transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: 'rgba(255,255,255,0.18)',
                        borderColor: 'rgba(255,255,255,0.34)',
                        backdropFilter: 'blur(8px)',
                      }}
                      whileHover={{
                        borderColor: 'rgba(37,201,208,0.55)',
                        boxShadow: '0 0 30px rgba(37,201,208,0.22)',
                      }}
                    >
                      {step.icon}
                    </motion.div>
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#25c9d0] text-white text-xs font-bold flex items-center justify-center shadow-lg">
                      {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-white font-bold mb-1.5">{step.label}</h3>
                  <p className="text-cyan-100/88 text-xs leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ────────────────────────────── */}
      <section ref={statsRef} className="relative z-10 py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-white/50 text-xs font-bold tracking-[0.3em] uppercase mb-4 px-4 py-1.5 rounded-full border border-white/24 bg-white/14">
              Impact & Scale
            </span>
            <h2 className="text-white text-4xl md:text-5xl font-extrabold mb-4">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-[#25c9d0] to-cyan-400 bg-clip-text text-transparent">
                thousands
              </span>
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={statsInView ? 'visible' : 'hidden'}
          >
            {STATS.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="text-center p-6 rounded-2xl border border-white/36 hover:border-white/30 transition-all duration-300 group"
                style={{
                  background: 'rgba(255,255,255,0.16)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="text-[#25c9d0]/60 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 w-fit">
                  {stat.icon}
                </div>
                <p className="text-white text-3xl md:text-4xl font-extrabold mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-cyan-100/88 text-xs font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA SECTION ──────────────────────────────── */}
      <section className="relative z-10 py-28 px-6">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-white text-4xl md:text-5xl font-extrabold mb-6">
            Ready to get started?
          </h2>
          <p className="text-cyan-100/90 text-lg mb-10 max-w-lg mx-auto">
            Join thousands of proponents and government officers using PARIVESH 3.0 for faster, transparent environmental clearances.
          </p>

          <button
            onClick={() => router.push('/login')}
            className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #25c9d0, #1db8c4)',
              boxShadow: '0 8px 32px rgba(37, 201, 208, 0.34)',
            }}
          >
            Sign In to Portal
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-white/34 text-center">
          <p className="text-cyan-100/86 text-xs">
            &copy; 2026 Ministry of Environment, Forest and Climate Change, Government of India. All rights reserved.
          </p>
          <p className="text-cyan-100/80 text-xs mt-1">
            PARIVESH 3.0 — Pro Active and Responsive facilitation by Interactive and Virtuous Environmental Single-window Hub
          </p>
        </div>
      </section>
    </div>
  );
}
