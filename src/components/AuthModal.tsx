import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
}) => {
  const { login, register, requestPasswordReset, resetPasswordWithToken } = useAuth();
  const { language, t } = useLanguage();

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>(initialTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('Chanmana, Baheri');

  // Forgot password flow
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetToken, setResetToken] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setTab(initialTab);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Login failed. Please check credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const res = await register({
      name,
      email,
      phone,
      password,
      address: {
        name,
        phone,
        street: 'Main Ward',
        locality: locality || 'Chanmana, Baheri',
        pinCode: '847105',
      },
    });
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await requestPasswordReset(email);
    setLoading(false);

    if (res.success && res.resetToken) {
      setGeneratedToken(res.resetToken);
      setResetToken(res.resetToken); // auto-fill for frictionless UX
      setResetStep(2);
      setSuccessMsg('Reset code generated. Please set your new password.');
    } else {
      setErrorMsg(res.error || 'No registered account found with this email.');
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const res = await resetPasswordWithToken(email, resetToken, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Password has been successfully reset! You can now log in.');
      setTimeout(() => {
        setTab('login');
        setResetStep(1);
        setSuccessMsg(null);
      }, 2000);
    } else {
      setErrorMsg(res.error || 'Invalid reset token.');
    }
  };

  // Quick Demo Logins
  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    const res = await login(demoEmail, demoPass);
    setLoading(false);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden my-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <img
              src="/madhav-logo.jpg"
              alt="Madhav Logo"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white/40 shadow-sm"
            />
            <div>
              <h3 className="font-extrabold text-lg text-white">MADHAV MEDICAL HALL</h3>
              <p className="text-xs text-emerald-200">
                {language === 'hi' ? 'सुरक्षित ग्राहक लॉगिन' : 'Customer Account & Pharmacy Access'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        {tab !== 'forgot' && (
          <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50 text-xs font-bold">
            <button
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`py-3 transition text-center cursor-pointer ${
                tab === 'login'
                  ? 'bg-white text-emerald-800 border-b-2 border-emerald-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`py-3 transition text-center cursor-pointer ${
                tab === 'register'
                  ? 'bg-white text-emerald-800 border-b-2 border-emerald-600'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('register')}
            </button>
          </div>
        )}

        {/* Body Container */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('emailOrPhone')} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">{t('password')} *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-emerald-700 font-semibold hover:underline cursor-pointer"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{t('signInToAccount')}</span>
              </button>

              {/* Demo Logins */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  1-Click Instant Demo Testing
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('customer@example.com', 'password123')}
                    className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-800 transition cursor-pointer"
                  >
                    Customer Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('madhavmedicalhall2016@gmail.com', 'admin123')}
                    className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-900 transition cursor-pointer"
                  >
                    Admin / Pharmacist
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('fullName')} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('mobileNumber')} *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9122260360"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('emailOrPhone')} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramesh@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'गांव / क्षेत्र' : 'Village / Locality'}
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="Chanmana, Baheri, Darbhanga"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('password')} *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('confirmPassword')} *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-500 pt-1">
                By registering, you agree to Madhav Medical Hall's terms of service & prescription dispensing policy.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{t('createAnAccount')}</span>
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">{t('resetPassword')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {resetStep === 1
                    ? 'Enter your registered email address to receive secure reset credentials.'
                    : 'Enter the verification code and choose your new password.'}
                </p>
              </div>

              {resetStep === 1 ? (
                <form onSubmit={handleRequestReset} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registered Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    {loading ? 'Verifying...' : 'Send Password Reset Link / Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompleteReset} className="space-y-3">
                  {generatedToken && (
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-900">
                      <p className="font-bold">Reset Code (Simulation):</p>
                      <p className="font-mono text-sm font-extrabold text-emerald-800">{generatedToken}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Reset Verification Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="MMH-RESET-XXXXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Set New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    {loading ? 'Updating Password...' : 'Save New Password & Log In'}
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
