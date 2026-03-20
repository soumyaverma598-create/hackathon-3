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
import BrandLogo from '@/components/BrandLogo';
import DynamicBackground from './DynamicBackground';
import VideoBackground from './VideoBackground';
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
    gradient: 'from-[#1e3a6f] to-[#2d5fa8]',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Real-time Tracking',
    description: 'Track your application status at every stage. Get instant notifications on updates, queries, and approvals.',
    gradient: 'from-[#146b3a] to-[#1d8a50]',
  },
  {
    icon: <FileCheck className="w-6 h-6" />,
    title: 'EDS Query Management',
    description: 'Streamlined Expert Data Stipulation queries. Respond to scrutiny observations directly through the portal.',
    gradient: 'from-[#c4622d] to-[#d97706]',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Digital EC Certificates',
    description: 'Receive digitally signed Environmental Clearance certificates. Secure, verifiable, and instantly downloadable.',
    gradient: 'from-[#5b3fb8] to-[#7c3aed]',
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
    <div className="min-h-screen relative overflow-hidden">
      <LanguageSelector placement="public" />
      {/* Video Background for landing */}
      <VideoBackground />

      <div className="fixed bottom-6 right-4 z-30 sm:hidden">
        <button
          onClick={() => router.push('/login')}
          className="group inline-flex items-center gap-2 px-5 py-3 rounded-full text-white font-semibold text-sm shadow-2xl border border-white/36 backdrop-blur-md transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 58, 111, 0.95), rgba(42, 74, 143, 0.95))',
          }}
        >
          Login
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ─── HERO SECTION ─────────────────────────────── */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <motion.div
          className="text-center max-w-4xl mx-auto rounded-xl border border-white/15 bg-black/20 shadow-2xl px-8 py-10 md:px-12 md:py-14 backdrop-blur-2xl"
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        >
          {/* Emblem */}
          <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-8 shadow-lg border border-white/20 backdrop-blur-lg">
            <BrandLogo className="w-16 h-16 text-white" />
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-white text-5xl md:text-6xl font-bold tracking-wide mb-2">
              PARIVESH <span className="text-[#fbbf24]">3.0</span>
            </h1>
          </motion.div>

          <motion.p
            className="text-white/90 text-lg md:text-xl font-semibold mb-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            पर्यावरण / ENVIRONMENT
          </motion.p>

          <motion.p
            className="text-white/80 text-base mb-1"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            Environmental Clearance Portal
          </motion.p>

          <motion.p
            className="text-white/75 text-sm tracking-widest uppercase mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            Ministry of Environment, Forest and Climate Change &bull; Government of India
          </motion.p>

          {/* Accent line */}
          <motion.div
            className="mx-auto h-[2px] rounded-full mb-8 bg-gradient-to-r from-transparent via-white to-transparent"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 140, opacity: 1 }}
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
              className="group flex items-center gap-2 px-8 py-3 rounded-lg text-white font-bold text-base transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #c4622d, #d47a3f)',
                boxShadow: '0 10px 25px rgba(196, 98, 45, 0.3)',
              }}
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-base border-2 border-white/80 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
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
          <span className="text-white/70 text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5 text-white/40" />
          </motion.div>
        </motion.div>

      </section>

      {/* ─── FEATURES SECTION ─────────────────────────── */}
      <section id="features" ref={featuresRef} className="relative z-10 py-28 px-6 bg-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-[#fbbf24] text-xs font-bold tracking-widest uppercase mb-4 px-4 py-2 rounded-md border border-white/30 bg-white/10 backdrop-blur-sm">
              Platform Features
            </span>
            <h2 className="text-white text-4xl md:text-5xl font-bold mb-4">
              Everything you need,<br />
              <span className="text-[#fbbf24]">in one place</span>
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
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
                className="group relative p-8 rounded-xl border border-white/20 transition-all duration-300 hover:border-white/40 hover:shadow-xl overflow-hidden backdrop-blur-md"
                style={{
                  background: 'rgba(0, 0, 0, 0.15)',
                }}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl bg-gradient-to-br from-white/10 to-transparent" />

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-white text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-white/75 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── WORKFLOW SECTION ─────────────────────────── */}
      <section ref={workflowRef} className="relative z-10 py-28 px-6 bg-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={workflowInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-[#fbbf24] text-xs font-bold tracking-widest uppercase mb-4 px-4 py-2 rounded-md border border-white/30 bg-white/10 backdrop-blur-sm">
              How It Works
            </span>
            <h2 className="text-white text-4xl md:text-5xl font-bold mb-4">
              Simple. Transparent. <span className="text-[#fbbf24]">Efficient.</span>
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              From application submission to EC certificate — a streamlined 4-step process.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <motion.div
              className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 hidden md:block bg-gradient-to-r from-transparent via-white/30 to-transparent"
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
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-white border-2 transition-all duration-300 group-hover:scale-110 border-white/30 backdrop-blur-md"
                      style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                      }}
                      whileHover={{
                        boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      {step.icon}
                    </motion.div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#fbbf24] text-gray-900 text-xs font-bold flex items-center justify-center shadow-md">
                      {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-white font-bold mb-1.5">{step.label}</h3>
                  <p className="text-white/70 text-xs leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ────────────────────────────── */}
      <section ref={statsRef} className="relative z-10 py-28 px-6 bg-[#1e3a6f]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-white text-xs font-bold tracking-widest uppercase mb-4 px-4 py-2 rounded-md border border-white/20 bg-white/10 backdrop-blur-sm">
              Impact & Scale
            </span>
            <h2 className="text-white text-4xl md:text-5xl font-extrabold mb-4">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-[#fbbf24] to-amber-300 bg-clip-text text-transparent">
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
                <div className="text-[#fbbf24]/70 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 w-fit">
                  {stat.icon}
                </div>
                <p className="text-white text-3xl md:text-4xl font-extrabold mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-white/80 text-xs font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CLEARANCE TYPES SECTION ─────────────────────── */}
      <section className="relative z-10 py-28 px-6 bg-gradient-to-b from-transparent via-blue-50/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-white text-4xl md:text-5xl font-bold mb-4">
              Green <span className="text-[#fbbf24]">Clearance</span>
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Select the type of Environmental Clearance your project requires
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
          >
            {[
              {
                title: 'Environmental Clearance',
                icon: '🏭',
                color: 'from-blue-600 to-blue-400',
                desc: 'For industrial & infrastructure projects'
              },
              {
                title: 'Forest Clearance',
                icon: '🌳',
                color: 'from-green-600 to-green-400',
                desc: 'For forest land diversion'
              },
              {
                title: 'Wildlife Clearance',
                icon: '🐅',
                color: 'from-orange-600 to-orange-400',
                desc: 'For wildlife sanctuary impact'
              },
              {
                title: 'CRZ Clearance',
                icon: '🌊',
                color: 'from-cyan-600 to-cyan-400',
                desc: 'For coastal regulation zone'
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative h-64 rounded-xl overflow-hidden cursor-pointer"
              >
                {/* Card background with gradient */}
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${item.color === 'from-blue-600 to-blue-400' ? '#1e40af' : item.color === 'from-green-600 to-green-400' ? '#166534' : item.color === 'from-orange-600 to-orange-400' ? '#b45309' : '#0e7490'}, transparent)`,
                    opacity: 0.8,
                  }}
                />

                {/* Dark overlay for content readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-xl" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 rounded-xl group-hover:backdrop-blur-sm transition-all duration-300">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="text-white text-lg font-bold mb-1">{item.title}</h3>
                    <p className="text-white/85 text-sm">{item.desc}</p>
                    <div className="flex items-center gap-2 mt-3 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Apply <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                </div>

                {/* Hover border effect */}
                <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-white/50 transition-all duration-300" />
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
          <p className="text-white/85 text-lg mb-10 max-w-lg mx-auto">
            Join thousands of proponents and government officers using PARIVESH 3.0 for faster, transparent environmental clearances.
          </p>

          <button
            onClick={() => router.push('/login')}
            className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #c4622d, #d47a3f)',
              boxShadow: '0 8px 32px rgba(196, 98, 45, 0.4)',
            }}
          >
            Sign In to Portal
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-white/34 text-center">
          <p className="text-white/75 text-xs">
            &copy; 2026 Ministry of Environment, Forest and Climate Change, Government of India. All rights reserved.
          </p>
          <p className="text-white/70 text-xs mt-1">
            PARIVESH 3.0 — Pro Active and Responsive facilitation by Interactive and Virtuous Environmental Single-window Hub
          </p>
        </div>
      </section>
    </div>
  );
}
