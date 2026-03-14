'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import DynamicBackground from '@/components/DynamicBackground';
import LanguageSelector from '@/components/LanguageSelector';
import { getText } from '@/lib/translations';

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
  const [loginMode, setLoginMode] = useState<'official' | 'applicant'>('official');
  const [socialAuthLoading, setSocialAuthLoading] = useState<string | null>(null);
  const [otpMode, setOtpMode] = useState(false);
  const [otpContact, setOtpContact] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const { language } = useLanguageStore();
  const router = useRouter();

  const d = 0;

  // Always clear any existing session when the login page mounts
  // so users must always log in manually
  useEffect(() => {
    localStorage.removeItem('auth-token');
    useAuthStore.setState({ user: null, error: null });
  }, []);

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

  const handleSocialAuth = useCallback(async (provider: string) => {
    clearError();
    setSocialAuthLoading(provider);
    await new Promise(r => setTimeout(r, 1500));
    setSocialAuthLoading(null);
    try {
      await login('proponent@company.com', 'proponent123');
      const routes: Record<string, string> = { admin: '/admin/dashboard', applicant: '/applicant/dashboard', scrutiny: '/scrutiny/dashboard', mom: '/mom/dashboard' };
      const role = useAuthStore.getState().user?.role;
      if (role) router.push(routes[role]);
    } catch { /* error shown via store */ }
  }, [clearError, login, router]);

  const handleSendOTP = useCallback(() => {
    if (!otpContact.trim()) return;
    setOtpSent(true);
    setOtpError('');
  }, [otpContact]);

  const handleVerifyOTP = useCallback(async () => {
    if (otpCode !== '123456') {
      setOtpError('Invalid OTP. Demo hint: 123456');
      return;
    }
    setOtpError('');
    try {
      await login('proponent@company.com', 'proponent123');
      router.push('/applicant/dashboard');
    } catch { /* error shown via store */ }
  }, [otpCode, login, router]);

  return (
    <>
    <LanguageSelector />
    <div className="min-h-screen flex relative" style={{ background: 'linear-gradient(135deg, #0f3650 0%, #164e63 50%, #0c2e44 100%)' }}>
      <DynamicBackground variant="login" />
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-12 relative overflow-hidden">

        {/* ── Branding content (staggered entrance) ── */}
        <div className="relative z-10 text-center rounded-[30px] border border-white/36 bg-slate-950/56 px-10 py-10 backdrop-blur-lg shadow-[0_24px_60px_rgba(2,14,28,0.52)]">

          {/* Logo with pulse + slow-spin on the spokes */}
          <div
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse-soft"
            style={{ animationDelay: `${d + 0}s` }}
          >
            <svg className="w-20 h-20" viewBox="0 0 64 64" fill="none" suppressHydrationWarning>
              <circle cx="32" cy="32" r="30" fill="#fff" stroke="#164e63" strokeWidth="2"/>
              {/* suppressHydrationWarning prevents mismatch on floating-point SVG coords */}
              <g className="animate-spin-slow" style={{ transformOrigin: '32px 32px' }} suppressHydrationWarning>
                <circle cx="32" cy="32" r="14" fill="none" stroke="#25c9d0" strokeWidth="2"/>
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i / 24) * 2 * Math.PI;
                  const r = (n: number) => Math.round(n * 1000) / 1000;
                  return (
                    <line
                      key={i}
                      x1={r(32 + 14 * Math.cos(angle))} y1={r(32 + 14 * Math.sin(angle))}
                      x2={r(32 + 18 * Math.cos(angle))} y2={r(32 + 18 * Math.sin(angle))}
                      stroke="#25c9d0" strokeWidth="1"
                      suppressHydrationWarning
                    />
                  );
                })}
              </g>
              <text x="32" y="36" fontSize="10" fontWeight="bold" fill="#164e63" textAnchor="middle">अशोक</text>
            </svg>
          </div>

          <h1
            className="text-white text-4xl font-extrabold mb-2 tracking-wide animate-fade-slide-up [text-shadow:0_8px_24px_rgba(0,0,0,0.45)]"
            style={{ animationDelay: `${d + 0.1}s` }}
          >
            {getText('title', language)}
          </h1>
          <p
            className="text-cyan-100 text-lg font-semibold mb-1 animate-fade-slide-up"
            style={{ animationDelay: `${d + 0.2}s` }}
          >
            {getText('subtitle', language)}
          </p>
          <p
            className="text-cyan-100/95 text-sm mb-6 animate-fade-slide-up"
            style={{ animationDelay: `${d + 0.28}s` }}
          >
            {getText('description', language)}
          </p>
          <p
            className="text-cyan-100/90 text-xs max-w-xs leading-relaxed animate-fade-slide-up text-center mx-auto"
            style={{ animationDelay: `${d + 0.34}s` }}
          >
            {getText('ministry', language)}<br />
            {getText('country', language)}
          </p>

          <div
            className="mt-8 bg-white/26 rounded-xl p-4 backdrop-blur-sm border border-white/36 animate-fade-slide-up mx-auto max-w-xs text-center"
            style={{ animationDelay: `${d + 0.44}s` }}
          >
            <p className="text-white text-xs font-semibold mb-2 flex items-center justify-center gap-1">
              <Shield
                size={12}
                className="inline-block"
                style={{ animation: 'pulseSoft 3s ease-in-out infinite' }}
              />
              {getText('eiaNotification', language)}
            </p>
            <p className="text-cyan-200 text-xs leading-relaxed">
              {getText('eiaDescription', language)}
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
            style={{ animationDelay: `${d + 0.05}s` }}
          >
            {/* Top shimmer accent bar */}
            <div
              className="h-1.5 w-full"
              style={{
                background: 'linear-gradient(90deg, #164e63, #25c9d0, #164e63)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s linear infinite',
              }}
            />

            <div className="p-8">
              {/* Mobile title */}
              <div
                className="lg:hidden text-center mb-6 animate-fade-slide-up"
                style={{ animationDelay: `${d + 0.1}s` }}
              >
                <h1 className="text-2xl font-extrabold text-[#164e63]">{getText('title', language)}</h1>
                <p className="text-gray-500 text-sm">{getText('description', language)}</p>
              </div>

              {/* Mode Tab Switcher */}
              <div
                className="flex bg-gray-100 rounded-xl p-1 mb-5 animate-fade-slide-up"
                style={{ animationDelay: `${d + 0.11}s` }}
              >
                <button
                  type="button"
                  onClick={() => { setLoginMode('official'); setOtpMode(false); clearError(); }}
                  className={`flex-1 text-xs font-semibold py-2 px-2 rounded-lg transition-all ${loginMode === 'official' ? 'bg-white text-[#164e63] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {getText('governmentOfficials', language)}
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMode('applicant'); clearError(); }}
                  className={`flex-1 text-xs font-semibold py-2 px-2 rounded-lg transition-all ${loginMode === 'applicant' ? 'bg-white text-[#164e63] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {getText('applicantsConsultants', language)}
                </button>
              </div>

              <h2
                className="text-xl font-bold text-gray-800 mb-1 animate-fade-slide-up"
                style={{ animationDelay: `${d + 0.12}s` }}
              >
                {loginMode === 'official' ? getText('signInOfficials', language) : getText('signInApplicants', language)}
              </h2>
              <p
                className="text-gray-400 text-sm mb-6 animate-fade-slide-up"
                style={{ animationDelay: `${d + 0.18}s` }}
              >
                {loginMode === 'official'
                  ? getText('useCredentials', language)
                  : getText('chooseSignIn', language)}
              </p>

              {error && (
                error.startsWith('Access to the') ? (
                  <div className="mb-4 rounded-lg border border-cyan-300 bg-cyan-50 px-4 py-3 animate-fade-slide-up">
                    <div className="flex items-start gap-2.5">
                      <span className="text-cyan-500 text-lg leading-none mt-0.5">⚠</span>
                      <div>
                        <p className="text-sm font-semibold text-cyan-800">{getText('portalAccessRestricted', language)}</p>
                        <p className="mt-0.5 text-xs text-cyan-700">{error}</p>
                        <a
                          href="mailto:admin@moef.gov.in"
                          className="mt-1.5 inline-block text-xs font-semibold text-cyan-800 underline underline-offset-2 hover:text-cyan-900"
                        >
                          {getText('contactAdmin', language)}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm font-medium animate-fade-slide-up">
                    {error}
                  </div>
                )
              )}

              {/* ── Applicant Social / SSO Auth ── */}
              {loginMode === 'applicant' && !otpMode && (
                <div className="mb-2 animate-fade-slide-up" style={{ animationDelay: `${d + 0.2}s` }}>
                  <div className="space-y-2.5">
                    {/* Google */}
                    <button
                      type="button"
                      disabled={!!socialAuthLoading}
                      onClick={() => handleSocialAuth('Google')}
                      className="w-full flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60 hover:scale-[1.01]"
                    >
                      {socialAuthLoading === 'Google' ? (
                        <svg className="animate-spin w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      )}
                      <span>{socialAuthLoading === 'Google' ? getText('connectingGoogle', language) : getText('continueGoogle', language)}</span>
                    </button>

                    {/* Microsoft */}
                    <button
                      type="button"
                      disabled={!!socialAuthLoading}
                      onClick={() => handleSocialAuth('Microsoft')}
                      className="w-full flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60 hover:scale-[1.01]"
                    >
                      {socialAuthLoading === 'Microsoft' ? (
                        <svg className="animate-spin w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      ) : (
                        <svg viewBox="0 0 23 23" className="w-4 h-4 shrink-0"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
                      )}
                      <span>{socialAuthLoading === 'Microsoft' ? getText('connectingMicrosoft', language) : getText('continueMicrosoft', language)}</span>
                    </button>

                    {/* DigiLocker — opens official portal in new tab */}
                    <a
                      href="https://digilocker.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-cyan-50 hover:border-[#164e63]/40 transition-all hover:scale-[1.01] no-underline"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="#164e63" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <span className="flex-1">{getText('digiLocker', language)}</span>
                      <svg viewBox="0 0 24 24" className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>

                    {/* OTP */}
                    <button
                      type="button"
                      disabled={!!socialAuthLoading}
                      onClick={() => { setOtpMode(true); clearError(); }}
                      className="w-full flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60 hover:scale-[1.01]"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.56 3.57 2 2 0 0 1 3.53 1.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l1.77-1.77a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      <span>{getText('otp', language)}</span>
                    </button>
                  </div>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-xs text-gray-400">{getText('orContinue', language)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── OTP Flow ── */}
              {loginMode === 'applicant' && otpMode && (
                <div className="mb-5 animate-fade-slide-up" style={{ animationDelay: `${d + 0.2}s` }}>
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => { setOtpMode(false); setOtpSent(false); setOtpCode(''); setOtpContact(''); setOtpError(''); }}
                      className="text-[#164e63] hover:text-[#0f3650] text-xs font-medium transition-colors"
                    >
                      {getText('back', language)}
                    </button>
                    <span className="text-sm font-semibold text-gray-700">{getText('signInOTP', language)}</span>
                  </div>
                  {!otpSent ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={otpContact}
                        onChange={e => setOtpContact(e.target.value)}
                        placeholder={getText('mobileOrEmail', language)}
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63] focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={!otpContact.trim()}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, #164e63, #1f7ea4)' }}
                      >
                        {getText('sendOTP', language)}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500">{getText('otpSent', language)} <strong>{otpContact}</strong></p>
                      <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded px-3 py-1.5">{getText('demoHint', language)} <strong>123456</strong></p>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder={getText('enter6Digit', language)}
                        maxLength={6}
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63] focus:border-transparent transition-all tracking-[0.6em] text-center font-mono"
                      />
                      {otpError && <p className="text-xs text-red-600">{otpError}</p>}
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={otpCode.length < 6 || isLoading}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, #164e63, #1f7ea4)' }}
                      >
                        {isLoading ? getText('verifying', language) : getText('verifySignIn', language)}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className={`space-y-4${loginMode === 'applicant' && otpMode ? ' hidden' : ''}`}>
                <div
                  className="animate-fade-slide-up"
                  style={{ animationDelay: `${d + 0.22}s` }}
                >
                  <label className="ui-label">
                    {loginMode === 'official' ? getText('emailLabel', language) : getText('workEmailLabel', language)}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={loginMode === 'official' ? getText('emailPlaceholder', language) : getText('workEmailPlaceholder', language)}
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#164e63] focus:border-transparent transition-all hover:border-[#164e63]/40"
                  />
                </div>

                <div
                  className="animate-fade-slide-up"
                  style={{ animationDelay: `${d + 0.28}s` }}
                >
                  <label className="ui-label">
                    {getText('passwordLabel', language)}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder={getText('passwordPlaceholder', language)}
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#164e63] focus:border-transparent transition-all hover:border-[#164e63]/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#164e63] transition-colors icon-btn-hover"
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
                    background: isLoading ? '#6b7280' : 'linear-gradient(135deg, #164e63, #1f7ea4)',
                    animationDelay: `${d + 0.34}s`,
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      {getText('verifying', language)}
                    </span>
                  ) : (
                    <>
                      <LogIn size={16} /> {getText('signIn', language)}
                    </>
                  )}
                </button>
              </form>

              {/* Demo credentials */}
              <div
                className="mt-6 border-t border-gray-100 pt-5 animate-fade-slide-up"
                style={{ animationDelay: `${d + 0.42}s` }}
              >
                <p className="ui-eyebrow mb-3 text-center justify-center">
                  {loginMode === 'applicant' ? getText('demoAccount', language) : getText('demoCredentials', language)}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {ROLE_HINTS.filter(h => loginMode === 'applicant' ? h.role === 'Applicant' : h.role !== 'Applicant').map((hint, idx) => (
                    <button
                      key={hint.email}
                      onClick={() => fillDemo(hint)}
                      className="text-left bg-gradient-to-b from-white to-[#eef8fc] hover:bg-cyan-50 border border-[#164e63]/15 hover:border-[#164e63]/35 rounded-lg px-4 py-3 transition-all group hover:scale-[1.03] hover:shadow-sm animate-fade-slide-up"
                      style={{ animationDelay: `${d + 0.48 + idx * 0.06}s` }}
                    >
                      <p className="text-[11px] uppercase tracking-wide font-extrabold text-[#3a6a80]">
                        {hint.role === 'Admin' ? getText('admin', language) : 
                         hint.role === 'Applicant' ? getText('applicant', language) :
                         hint.role === 'Scrutiny' ? getText('scrutiny', language) :
                         getText('momSecretary', language)}
                      </p>
                      <p className="text-xs font-semibold text-[#164e63] truncate mt-1">{hint.email}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p
            className="text-center text-cyan-200 text-[11px] mt-4 animate-fade-slide-up"
            style={{ animationDelay: `${d + 0.72}s` }}
          >
            {getText('copyright', language)}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
