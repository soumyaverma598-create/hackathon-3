'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, LogIn, Shield, Leaf } from 'lucide-react';

const ROLE_HINTS = [
  { email: 'admin@moef.gov.in', password: 'admin123', role: 'Admin' },
  { email: 'proponent@company.com', password: 'proponent123', role: 'Applicant' },
  { email: 'scrutiny@moef.gov.in', password: 'scrutiny123', role: 'Scrutiny' },
  { email: 'mom@moef.gov.in', password: 'mom123', role: 'MoM Secretary' },
];

// Each leaf gets randomised animation params for a natural feel
const LEAVES = Array.from({ length: 24 }).map((_, i) => ({
  left: `${(i * 7 + 3) % 100}%`,
  top: `${(i * 13 + 5) % 100}%`,
  size: 18 + (i % 5) * 9,
  opacity: 0.06 + (i % 4) * 0.04,
  dur: `${6 + (i % 7) * 1.2}s`,
  delay: `${-(i * 0.7)}s`,   // negative delay = already mid-animation on load
  rot: `${i * 47}deg`,
}));

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, user, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const routes: Record<string, string> = {
        admin: '/admin/dashboard',
        applicant: '/applicant/dashboard',
        scrutiny: '/scrutiny/dashboard',
        mom: '/mom/dashboard',
      };
      router.replace(routes[user.role] ?? '/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      const role = useAuthStore.getState().user?.role;
      const routes: Record<string, string> = {
        admin: '/admin/dashboard',
        applicant: '/applicant/dashboard',
        scrutiny: '/scrutiny/dashboard',
        mom: '/mom/dashboard',
      };
      if (role) router.push(routes[role]);
    } catch {
      // error is set in store
    }
  };

  const fillDemo = (hint: (typeof ROLE_HINTS)[0]) => {
    setEmail(hint.email);
    setPassword(hint.password);
    clearError();
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f4a2a 0%, #1a6b3c 50%, #0d3d24 100%)' }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-12 relative overflow-hidden">

        {/* ── Animated floating leaves ── */}
        <div className="absolute inset-0 pointer-events-none">
          {LEAVES.map((leaf, i) => (
            <Leaf
              key={i}
              className="absolute text-white"
              style={{
                left: leaf.left,
                top: leaf.top,
                width: `${leaf.size}px`,
                height: `${leaf.size}px`,
                opacity: leaf.opacity,
                '--leaf-rot': leaf.rot,
                '--leaf-dur': leaf.dur,
                '--leaf-delay': leaf.delay,
                animation: `leafFloat ${leaf.dur} ease-in-out infinite ${leaf.delay}`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* ── Branding content (staggered entrance) ── */}
        <div className="relative z-10 text-center">

          {/* Logo with pulse + slow-spin on the spokes */}
          <div
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse-soft"
            style={{ animationDelay: '0s' }}
          >
            <svg className="w-20 h-20" viewBox="0 0 64 64" fill="none" suppressHydrationWarning>
              <circle cx="32" cy="32" r="30" fill="#fff" stroke="#1a6b3c" strokeWidth="2"/>
              {/* suppressHydrationWarning prevents mismatch on floating-point SVG coords */}
              <g className="animate-spin-slow" style={{ transformOrigin: '32px 32px' }} suppressHydrationWarning>
                <circle cx="32" cy="32" r="14" fill="none" stroke="#f7941d" strokeWidth="2"/>
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i / 24) * 2 * Math.PI;
                  const r = (n: number) => Math.round(n * 1000) / 1000;
                  return (
                    <line
                      key={i}
                      x1={r(32 + 14 * Math.cos(angle))} y1={r(32 + 14 * Math.sin(angle))}
                      x2={r(32 + 18 * Math.cos(angle))} y2={r(32 + 18 * Math.sin(angle))}
                      stroke="#f7941d" strokeWidth="1"
                      suppressHydrationWarning
                    />
                  );
                })}
              </g>
              <text x="32" y="36" fontSize="10" fontWeight="bold" fill="#1a6b3c" textAnchor="middle">अशोक</text>
            </svg>
          </div>

          <h1
            className="text-white text-4xl font-extrabold mb-2 tracking-wide animate-fade-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            PARIVESH 3.0
          </h1>
          <p
            className="text-green-200 text-lg font-medium mb-1 animate-fade-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            पर्यावरण/ ENVIRONMENT
          </p>
          <p
            className="text-green-300 text-sm mb-6 animate-fade-slide-up"
            style={{ animationDelay: '0.28s' }}
          >
            Environmental Clearance Portal
          </p>
          <p
            className="text-green-200 text-xs max-w-xs leading-relaxed animate-fade-slide-up text-center mx-auto"
            style={{ animationDelay: '0.34s' }}
          >
            Ministry of Environment, Forest and Climate Change<br />
            Government of India
          </p>

          <div
            className="mt-8 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 animate-fade-slide-up mx-auto max-w-xs text-center"
            style={{ animationDelay: '0.44s' }}
          >
            <p className="text-white text-xs font-semibold mb-2 flex items-center justify-center gap-1">
              <Shield
                size={12}
                className="inline-block"
                style={{ animation: 'pulseSoft 3s ease-in-out infinite' }}
              />
              EIA Notification, 2006
            </p>
            <p className="text-green-200 text-xs leading-relaxed">
              Digitizing Environmental Clearance for Category A, B1 &amp; B2 projects across India.
            </p>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Card with entrance animation */}
          <div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-slide-up"
            style={{ animationDelay: '0.05s' }}
          >
            {/* Top shimmer accent bar */}
            <div
              className="h-1.5 w-full"
              style={{
                background: 'linear-gradient(90deg, #1a6b3c, #f7941d, #1a6b3c)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s linear infinite',
              }}
            />

            <div className="p-8">
              {/* Mobile title */}
              <div
                className="lg:hidden text-center mb-6 animate-fade-slide-up"
                style={{ animationDelay: '0.1s' }}
              >
                <h1 className="text-2xl font-extrabold text-[#1a6b3c]">PARIVESH 3.0</h1>
                <p className="text-gray-500 text-sm">Environmental Clearance Portal</p>
              </div>

              <h2
                className="text-xl font-bold text-gray-800 mb-1 animate-fade-slide-up"
                style={{ animationDelay: '0.12s' }}
              >
                Sign in to your account
              </h2>
              <p
                className="text-gray-400 text-sm mb-6 animate-fade-slide-up"
                style={{ animationDelay: '0.18s' }}
              >
                Use your MoEFCC credentials to continue
              </p>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm font-medium animate-fade-slide-up">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div
                  className="animate-fade-slide-up"
                  style={{ animationDelay: '0.22s' }}
                >
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Email / User ID
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="user@moef.gov.in"
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] focus:border-transparent transition-all hover:border-[#1a6b3c]/40"
                  />
                </div>

                <div
                  className="animate-fade-slide-up"
                  style={{ animationDelay: '0.28s' }}
                >
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] focus:border-transparent transition-all hover:border-[#1a6b3c]/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a6b3c] transition-colors icon-btn-hover"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  id="login-btn"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] animate-fade-slide-up"
                  style={{
                    background: isLoading ? '#6b7280' : 'linear-gradient(135deg, #1a6b3c, #256b45)',
                    animationDelay: '0.34s',
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Verifying…
                    </span>
                  ) : (
                    <>
                      <LogIn size={16} /> Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Demo credentials */}
              <div
                className="mt-6 border-t border-gray-100 pt-5 animate-fade-slide-up"
                style={{ animationDelay: '0.42s' }}
              >
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 text-center">
                  Demo Credentials
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {ROLE_HINTS.map((hint, idx) => (
                    <button
                      key={hint.email}
                      onClick={() => fillDemo(hint)}
                      className="text-left bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-[#1a6b3c]/30 rounded-lg px-4 py-3 transition-all group hover:scale-[1.03] hover:shadow-sm animate-fade-slide-up"
                      style={{ animationDelay: `${0.48 + idx * 0.06}s` }}
                    >
                      <p className="text-sm font-bold text-[#1a6b3c] group-hover:text-[#0f4a2a]">{hint.role}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{hint.email}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p
            className="text-center text-green-200 text-[11px] mt-4 animate-fade-slide-up"
            style={{ animationDelay: '0.72s' }}
          >
            &copy; 2026 MoEFCC, Government of India. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
