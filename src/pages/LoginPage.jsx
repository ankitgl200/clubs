import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ArrowRight,
  Lock,
  Mail,
  LogIn,
  Eye,
  EyeOff,
  UserPlus,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function LoginPage() {
  const { login, resendConfirmationEmail } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isVerifiedParam = searchParams.get('verified') === 'true';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      setSubmitting(true);
      await login(identifier, password);
      toast.success('Welcome back!');
      navigate('/account');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
      toast.error(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!identifier.includes('@')) {
      toast.error('Please enter your registered email address above to resend verification.');
      return;
    }
    try {
      setResending(true);
      await resendConfirmationEmail(identifier);
      toast.success('Verification email resent! Please check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const isEmailNotConfirmed = errorMessage?.toLowerCase().includes('not verified') || errorMessage?.toLowerCase().includes('not confirmed');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel max-w-md w-full rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-cyan p-0.5 mx-auto flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-white dark:bg-navy-900 rounded-[14px] flex items-center justify-center font-display font-black text-xl text-brand-500">
              <LogIn className="w-5 h-5 text-brand-500" />
            </div>
          </div>
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            Welcome to The Clubs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in with your verified campus email or registered mobile number.
          </p>
        </div>

        {/* Verification Success Notice */}
        {isVerifiedParam && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Email verified successfully! You can now log in with your credentials.</span>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>

            {isEmailNotConfirmed && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-semibold hover:bg-rose-700 transition-colors flex items-center gap-1.5"
                >
                  {resending ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Resending Link...</span>
                    </>
                  ) : (
                    <span>Resend Verification Email</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email or Mobile Number *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="name@studymyte.edu or 9876543210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password *
              </label>
              <Link to="/forgot-password" className="text-[11px] text-brand-500 hover:underline inline-flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                <span>Forgot password?</span>
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-panel text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <span>New to The Clubs?</span>
          <Link to="/register" className="text-brand-500 font-semibold hover:underline inline-flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Join Now</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
