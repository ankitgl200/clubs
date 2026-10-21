import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { API_URL } from '../config/api';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Clock,
  Send,
  Edit3,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtpNotice, setDevOtpNotice] = useState(null);

  const toast = useToast();
  const navigate = useNavigate();

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP to Email via Resend
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid registered email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      toast.success(data.message || `Verification code sent to ${cleanEmail}`);
      if (data.devOtp) {
        setDevOtpNotice(data.devOtp);
      }
      setStep('otp');
      setResendCooldown(60);
    } catch (err) {
      toast.error(err.message || 'Error sending verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password in a single secure backend transaction
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      toast.error('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please retype carefully.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: cleanOtp,
          new_password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password reset failed.');
      }

      setStep('success');
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel max-w-md w-full rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6">
        
        {/* Navigation back */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-brand-500 font-semibold hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        {/* STEP 1: ENTER EMAIL */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-5 animate-in fade-in">
            <div className="space-y-1.5">
              <div className="w-11 h-11 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-2">
                <KeyRound className="w-5 h-5 text-brand-500" />
              </div>
              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                Forgot Password?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Enter your registered campus email. We will send a secure 6-digit one-time password (OTP) via Resend.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Registered Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-panel text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
              <span>
                Dispatched directly from <strong>Clubs@studymyte.tech</strong>. Server-side encrypted and valid for 10 minutes.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP & SET NEW PASSWORD */}
        {step === 'otp' && (
          <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in">
            <div className="space-y-1.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white tracking-tight">
                Verify OTP Code
              </h2>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Code sent to <strong className="text-slate-900 dark:text-white">{email}</strong></span>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-brand-500 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>
            </div>

            {/* Development OTP Banner (if Resend API key is awaiting setup) */}
            {devOtpNotice && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold">Dev Mode Code: </span>
                  <span className="font-mono tracking-widest font-black text-sm">{devOtpNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp(devOtpNotice)}
                  className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            {/* 6-Digit OTP Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                6-Digit Verification Code *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                autoFocus
                className="w-full text-center text-2xl tracking-[0.4em] font-mono font-bold py-3 rounded-xl glass-panel text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
              <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
                <span>Expires in 10 minutes</span>
                {resendCooldown > 0 ? (
                  <span>Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-brand-500 hover:underline font-semibold"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying OTP & Updating MongoDB...</span>
                </>
              ) : (
                <span>Reset Password & Secure Account</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {step === 'success' && (
          <div className="text-center space-y-5 animate-in fade-in py-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                Password Reset Complete
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                Your account password has been securely updated in MongoDB. You can now log into your The Clubs workspace.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition-all inline-block"
            >
              Proceed to Sign In
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
