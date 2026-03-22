'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import DynamicBackground from '@/components/DynamicBackground';
import BackgroundAnimationComponent from '@/components/BackgroundAnimationComponent';
import LanguageSelector from '@/components/LanguageSelector';
import BrandLogo from '@/components/BrandLogo';
import { getText } from '@/lib/translations';
import { PrimaryButton, SecondaryButton, SocialButton, DemoCredentialButton, TabButton, BackButton } from '@/components/NeumorphicButtons';

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
    <div className="relative z-20">
      <LanguageSelector />
    </div>
    <style>{`
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(37, 201, 208, 0.3); }
        50% { box-shadow: 0 0 40px rgba(37, 201, 208, 0.6); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes shimmerBorder {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      @keyframes pulseGlow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .glow-effect { animation: glow 3s ease-in-out infinite; }
      .float-effect { animation: float 3s ease-in-out infinite; }
      .gradient-shift { animation: gradientShift 8s ease infinite; background-size: 200% 200%; }
      .shimmer-border { animation: shimmerBorder 2s linear infinite; }
      .pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }
    `}</style>
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: 'linear-gradient(-45deg, #1a5a7a, #0f3650, #164e63, #2b8fa3, #1a5a7a)', backgroundSize: '400% 400%', animation: 'gradientShift 15s ease infinite' }}>
      {/* Enterprise Background Animation */}
      <BackgroundAnimationComponent />
      
      <DynamicBackground variant="login" />
      
      {/* Floating orbs for visual interest */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-12 relative overflow-hidden z-10">

        {/* ── Branding content (staggered entrance) ── */}
        <div className="relative z-10 text-center rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900/70 via-slate-950/70 to-slate-900/70 px-12 py-14 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] glow-effect">
          
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-cyan-400/40 rounded-tl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-cyan-400/40 rounded-br-2xl"></div>

          {/* Logo with enhanced styling */}
          <div
            className="w-28 h-28 bg-gradient-to-br from-white to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl overflow-hidden border-4 border-white/30 float-effect glow-effect"
            style={{ animationDelay: `${d + 0}s` }}
          >
            <BrandLogo className="w-28 h-28 scale-[1.1]" />
          </div>

          <h1
            className="text-white text-5xl font-black mb-3 tracking-tight animate-fade-slide-up bg-gradient-to-r from-cyan-200 via-white to-cyan-100 bg-clip-text text-transparent"
            style={{ animationDelay: `${d + 0.1}s` }}
          >
            {getText('title', language)}
          </h1>
          <div className="h-1 w-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mx-auto mb-4"></div>
          <p
            className="text-cyan-100 text-xl font-bold mb-2 animate-fade-slide-up"
            style={{ animationDelay: `${d + 0.2}s` }}
          >
            {getText('subtitle', language)}
          </p>
          <p
            className="text-cyan-100/90 text-base mb-8 animate-fade-slide-up max-w-sm"
            style={{ animationDelay: `${d + 0.28}s` }}
          >
            {getText('description', language)}
          </p>
          <p
            className="text-cyan-100/80 text-sm max-w-xs leading-relaxed animate-fade-slide-up text-center mx-auto mb-8 font-medium"
            style={{ animationDelay: `${d + 0.34}s` }}
          >
            {getText('ministry', language)}<br />
            {getText('country', language)}
          </p>

          <div
            className="mt-8 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/30 animate-fade-slide-up mx-auto max-w-xs text-center shadow-lg hover:shadow-xl hover:from-white/25 hover:to-white/15 transition-all duration-300"
            style={{ animationDelay: `${d + 0.44}s` }}
          >
            <p className="text-white text-sm font-bold mb-3 flex items-center justify-center gap-2">
              <Shield
                size={16}
                className="inline-block text-cyan-300"
                style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
              />
              {getText('eiaNotification', language)}
            </p>
            <p className="text-cyan-100/95 text-xs leading-relaxed font-medium">
              {getText('eiaDescription', language)}
            </p>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-lg">
          {/* Card with entrance animation */}
          <div
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden animate-fade-slide-up border border-white/80 relative group hover:shadow-3xl transition-shadow duration-500"
            style={{ animationDelay: `${d + 0.05}s` }}
          >
            {/* Top gradient bar with animation */}
            <div
              className="h-2 w-full"
              style={{
                background: 'linear-gradient(90deg, #164e63, #25c9d0, #1f7ea4, #164e63)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 4s linear infinite',
              }}
            />
            
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
              style={{ background: 'radial-gradient(circle at center, #25c9d0, transparent)' }}></div>

            <div className="p-10">
              {/* Mobile title */}
              <div
                className="lg:hidden text-center mb-8 animate-fade-slide-up"
                style={{ animationDelay: `${d + 0.1}s` }}
              >
                <h1 className="text-3xl font-black text-transparent bg-gradient-to-r from-[#164e63] to-[#1f7ea4] bg-clip-text mb-2">{getText('title', language)}</h1>
                <div className="h-1 w-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm font-medium">{getText('description', language)}</p>
              </div>

              {/* Mode Tab Switcher with enhanced styling */}
              <div
                className="flex gap-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-1.5 mb-8 animate-fade-slide-up shadow-sm"
                style={{ animationDelay: `${d + 0.11}s` }}
              >
                <TabButton
                  active={loginMode === 'official'}
                  onClick={() => { setLoginMode('official'); setOtpMode(false); clearError(); }}
                >
                  {getText('governmentOfficials', language)}
                </TabButton>
                <TabButton
                  active={loginMode === 'applicant'}
                  onClick={() => { setLoginMode('applicant'); clearError(); }}
                >
                  {getText('applicantsConsultants', language)}
                </TabButton>
              </div>

              <h2
                className="text-2xl font-black text-[#164e63] mb-2 animate-fade-slide-up"
                style={{ animationDelay: `${d + 0.12}s` }}
              >
                {loginMode === 'official' ? getText('signInOfficials', language) : getText('signInApplicants', language)}
              </h2>
              <p
                className="text-gray-500 text-sm mb-6 font-medium animate-fade-slide-up"
                style={{ animationDelay: `${d + 0.18}s` }}
              >
                {loginMode === 'official'
                  ? getText('useCredentials', language)
                  : getText('chooseSignIn', language)}
              </p>

              {error && (
                error.startsWith('Access to the') ? (
                  <div className="mb-6 rounded-2xl border border-cyan-300/50 bg-gradient-to-br from-cyan-50 to-blue-50 px-5 py-4 animate-fade-slide-up shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-start gap-3">
                      <span className="text-cyan-600 text-xl leading-none mt-0.5 font-bold">⚠️</span>
                      <div>
                        <p className="text-sm font-bold text-cyan-900">{getText('portalAccessRestricted', language)}</p>
                        <p className="mt-1 text-xs text-cyan-800 font-medium">{error}</p>
                        <a
                          href="mailto:admin@moef.gov.in"
                          className="mt-2 inline-block text-xs font-bold text-cyan-700 hover:text-cyan-900 underline underline-offset-2 transition-colors duration-200"
                        >
                          {getText('contactAdmin', language)} →
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 bg-gradient-to-br from-red-50 to-rose-50 border border-red-300/50 text-red-800 rounded-2xl px-5 py-4 text-sm font-semibold animate-fade-slide-up shadow-md hover:shadow-lg transition-shadow duration-300">
                    {error}
                  </div>
                )
              )}

              {/* ── Applicant Social / SSO Auth ── */}
              {loginMode === 'applicant' && !otpMode && (
                <div className="mb-3 animate-fade-slide-up" style={{ animationDelay: `${d + 0.2}s` }}>
                  <div className="space-y-3">
                    {/* Google */}
                    <SocialButton
                      disabled={!!socialAuthLoading}
                      onClick={() => handleSocialAuth('Google')}
                      icon={socialAuthLoading === 'Google' ? (
                        <svg className="animate-spin w-5 h-5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      )}
                    >
                      {socialAuthLoading === 'Google' ? getText('connectingGoogle', language) : getText('continueGoogle', language)}
                    </SocialButton>

                    {/* Microsoft */}
                    <SocialButton
                      disabled={!!socialAuthLoading}
                      onClick={() => handleSocialAuth('Microsoft')}
                      icon={socialAuthLoading === 'Microsoft' ? (
                        <svg className="animate-spin w-5 h-5 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      ) : (
                        <svg viewBox="0 0 23 23" className="w-5 h-5 shrink-0"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
                      )}
                    >
                      {socialAuthLoading === 'Microsoft' ? getText('connectingMicrosoft', language) : getText('continueMicrosoft', language)}
                    </SocialButton>

                    {/* DigiLocker */}
                    <a
                      href="https://digilocker.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 border-2 border-gray-200 rounded-xl px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-50/50 hover:border-teal-300 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] no-underline"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="#164e63" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <span className="flex-1">{getText('digiLocker', language)}</span>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>

                    {/* OTP */}
                    <SocialButton
                      disabled={!!socialAuthLoading}
                      onClick={() => { setOtpMode(true); clearError(); }}
                      icon={<svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.56 3.57 2 2 0 0 1 3.53 1.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l1.77-1.77a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                    >
                      {getText('otp', language)}
                    </SocialButton>
                  </div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white/95 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{getText('orContinue', language)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── OTP Flow ── */}
              {loginMode === 'applicant' && otpMode && (
                <div className="mb-6 animate-fade-slide-up" style={{ animationDelay: `${d + 0.2}s` }}>
                  <div className="flex items-center gap-3 mb-6">
                    <BackButton
                      onClick={() => { setOtpMode(false); setOtpSent(false); setOtpCode(''); setOtpContact(''); setOtpError(''); }}
                    >
                      ← {getText('back', language)}
                    </BackButton>
                    <span className="text-lg font-black text-gray-800">{getText('signInOTP', language)}</span>
                  </div>
                  {!otpSent ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={otpContact}
                        onChange={e => setOtpContact(e.target.value)}
                        placeholder={getText('mobileOrEmail', language)}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#164e63] focus:border-[#164e63] transition-all hover:border-[#164e63]/40 focus:shadow-lg"
                      />
                      <PrimaryButton
                        onClick={handleSendOTP}
                        disabled={!otpContact.trim()}
                      >
                        {getText('sendOTP', language)}
                      </PrimaryButton>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-gray-700">{getText('otpSent', language)} <span className="font-bold text-[#164e63]">{otpContact}</span></p>
                      <p className="text-xs font-bold text-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl px-4 py-3">{getText('demoHint', language)} <span className="font-mono text-blue-900 text-sm">123456</span></p>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder={getText('enter6Digit', language)}
                        maxLength={6}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-3xl focus:outline-none focus:ring-2 focus:ring-[#164e63] focus:border-[#164e63] transition-all hover:border-[#164e63]/40 focus:shadow-lg tracking-[1.5em] text-center font-bold font-mono"
                      />
                      {otpError && <p className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{otpError}</p>}
                      <PrimaryButton
                        onClick={handleVerifyOTP}
                        disabled={otpCode.length < 6 || isLoading}
                      >
                        {isLoading ? getText('verifying', language) : getText('verifySignIn', language)}
                      </PrimaryButton>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className={`space-y-5${loginMode === 'applicant' && otpMode ? ' hidden' : ''}`}>
                <div
                  className="animate-fade-slide-up"
                  style={{ animationDelay: `${d + 0.22}s` }}
                >
                  <label className="block text-sm font-black text-gray-800 mb-2">
                    {loginMode === 'official' ? getText('emailLabel', language) : getText('workEmailLabel', language)}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={loginMode === 'official' ? getText('emailPlaceholder', language) : getText('workEmailPlaceholder', language)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#164e63] focus:border-[#164e63] transition-all hover:border-[#164e63]/40 focus:shadow-lg bg-gradient-to-r from-white via-white to-cyan-50"
                  />
                </div>

                <div
                  className="animate-fade-slide-up"
                  style={{ animationDelay: `${d + 0.28}s` }}
                >
                  <label className="block text-sm font-black text-gray-800 mb-2">
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
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium pr-12 focus:outline-none focus:ring-2 focus:ring-[#164e63] focus:border-[#164e63] transition-all hover:border-[#164e63]/40 focus:shadow-lg bg-gradient-to-r from-white via-white to-cyan-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#164e63] transition-colors font-bold hover:scale-125"
                    >
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <PrimaryButton
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="w-full animate-fade-slide-up"
                  style={{ animationDelay: `${d + 0.34}s` }}
                >
                  {isLoading ? getText('verifying', language) : getText('signIn', language)}
                </PrimaryButton>
              </form>

              {/* Demo credentials */}
              <div
                className="mt-8 border-t-2 border-gray-200 pt-7 animate-fade-slide-up"
                style={{ animationDelay: `${d + 0.42}s` }}
              >
                <p className="text-sm font-black text-gray-800 mb-4 text-center uppercase tracking-wider">
                  {loginMode === 'applicant' ? getText('demoAccount', language) : getText('demoCredentials', language)}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {ROLE_HINTS.filter(h => loginMode === 'applicant' ? h.role === 'Applicant' : h.role !== 'Applicant').map((hint, idx) => (
                    <DemoCredentialButton
                      key={hint.email}
                      onClick={() => fillDemo(hint)}
                      role={hint.role === 'Admin' ? getText('admin', language) : 
                             hint.role === 'Applicant' ? getText('applicant', language) :
                             hint.role === 'Scrutiny' ? getText('scrutiny', language) :
                             getText('momSecretary', language)}
                      email={hint.email}
                      style={{ animationDelay: `${d + 0.48 + idx * 0.06}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>


          <p
            className="text-center text-cyan-200/80 text-xs mt-6 font-semibold animate-fade-slide-up"
            style={{ animationDelay: `${d + 0.72}s` }}
          >
            © 2026 {getText('copyright', language)}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
