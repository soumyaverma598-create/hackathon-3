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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { login, user, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

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
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <Leaf
              key={i}
              className="absolute text-white"
              style={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 13) % 100}%`,
                width: `${20 + (i % 4) * 10}px`,
                height: `${20 + (i % 4) * 10}px`,
                transform: `rotate(${i * 47}deg)`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg className="w-20 h-20" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" fill="#fff" stroke="#1a6b3c" strokeWidth="2"/>
              <circle cx="32" cy="32" r="14" fill="none" stroke="#f7941d" strokeWidth="2"/>
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i / 24) * 2 * Math.PI;
                return (
                  <line
                    key={i}
                    x1={32 + 14 * Math.cos(angle)} y1={32 + 14 * Math.sin(angle)}
                    x2={32 + 18 * Math.cos(angle)} y2={32 + 18 * Math.sin(angle)}
                    stroke="#f7941d" strokeWidth="1"
                  />
                );
              })}
              <text x="32" y="36" fontSize="10" fontWeight="bold" fill="#1a6b3c" textAnchor="middle">अशोक</text>
            </svg>
          </div>

          <h1 className="text-white text-4xl font-extrabold mb-2 tracking-wide">PARIVESH 3.0</h1>
          <p className="text-green-200 text-lg font-medium mb-1">पर्यावरण/ ENVIRONMENT</p>
          <p className="text-green-300 text-sm mb-6">
            Environmental Clearance Portal
          </p>
          <p className="text-green-200 text-xs max-w-xs leading-relaxed">
            Ministry of Environment, Forest and Climate Change<br />
            Government of India
          </p>

          <div className="mt-8 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
            <p className="text-white text-xs font-semibold mb-2 flex items-center gap-1">
              <Shield size={12} /> EIA Notification, 2006
            </p>
            <p className="text-green-200 text-xs leading-relaxed">
              Digitizing Environmental Clearance for Category A, B1 & B2 projects across India.
            </p>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1a6b3c, #f7941d, #1a6b3c)' }} />

            <div className="p-8">
              {/* Mobile title */}
              <div className="lg:hidden text-center mb-6">
                <h1 className="text-2xl font-extrabold text-[#1a6b3c]">PARIVESH 3.0</h1>
                <p className="text-gray-500 text-sm">Environmental Clearance Portal</p>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-1">Sign in to your account</h2>
              <p className="text-gray-400 text-sm mb-6">Use your MoEFCC credentials to continue</p>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
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
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] focus:border-transparent transition-all"
                  />
                </div>

                <div>
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
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  id="login-btn"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: isLoading ? '#6b7280' : 'linear-gradient(135deg, #1a6b3c, #256b45)' }}
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
              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 text-center">
                  Demo Credentials
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_HINTS.map((hint) => (
                    <button
                      key={hint.email}
                      onClick={() => fillDemo(hint)}
                      className="text-left bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-[#1a6b3c]/30 rounded-lg px-3 py-2 transition-all group"
                    >
                      <p className="text-[10px] font-bold text-[#1a6b3c] group-hover:text-[#0f4a2a]">{hint.role}</p>
                      <p className="text-[9px] text-gray-400 truncate">{hint.email}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-green-200 text-[11px] mt-4">
            &copy; 2026 MoEFCC, Government of India. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
