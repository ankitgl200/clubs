import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clubService } from '../services/clubService';
import AvatarUploader from '../components/ui/AvatarUploader';
import {
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  UserPlus,
  Eye,
  EyeOff,
  Camera,
  CheckCircle2,
  LogIn,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function RegisterPage() {
  const { register, resendConfirmationEmail } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const clubs = clubService.getClubs(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPublicId, setAvatarPublicId] = useState('');
  const [registeredWithClub, setRegisteredWithClub] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState(clubs[0]?.id || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Email confirmation state
  const [needsVerification, setNeedsVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!terms) {
      toast.warning('Please accept the Terms of Service.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await register({
        full_name: fullName,
        email,
        phone,
        password,
        registered_with_club: registeredWithClub,
        club_id: registeredWithClub ? selectedClubId : null,
        avatar_url: avatarUrl,
        avatar_public_id: avatarPublicId,
      });

      if (res?.email_confirmation_required) {
        setRegisteredEmail(email);
        setNeedsVerification(true);
        toast.info('Verification link sent! Please check your email.');
      } else {
        toast.success('Registration successful! Welcome to The Clubs.');
        navigate('/account');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    try {
      setResending(true);
      await resendConfirmationEmail(registeredEmail);
      toast.success('Verification email resent! Please check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Failed to resend email.');
    } finally {
      setResending(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="glass-panel max-w-lg w-full rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6 text-center animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-500 mx-auto flex items-center justify-center">
            <Mail className="w-8 h-8 text-brand-500" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
              Verify Your Email
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              Your account has been created! A confirmation notice has been sent to:
              <br />
              <strong className="text-brand-500 font-bold text-sm block mt-1">{registeredEmail}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs text-left leading-relaxed">
            <strong>Next Step:</strong> Open your email inbox (or spam folder) and click the link to confirm your email address. Once confirmed, you can log in with your email or mobile number!
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Go to Sign In</span>
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl glass-panel border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:text-brand-500 transition-all disabled:opacity-50"
            >
              {resending ? 'Resending Link...' : 'Resend Email'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel max-w-lg w-full rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-cyan p-0.5 mx-auto flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-white dark:bg-navy-900 rounded-[14px] flex items-center justify-center font-display font-black text-xl text-brand-500">
              <UserPlus className="w-5 h-5 text-brand-500" />
            </div>
          </div>
          <h2 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            Create Student Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join your campus clubs and get instant access to community learning resources.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Cloudinary Profile Photo Uploader (Optional) */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-navy-900/40 border border-slate-200/70 dark:border-slate-800">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-brand-500" />
              <span>Profile Photo</span>
            </span>
            <AvatarUploader
              currentAvatarUrl={avatarUrl}
              label="Add Avatar (Optional)"
              optional={true}
              onUploadSuccess={(url, pubId) => {
                setAvatarUrl(url);
                setAvatarPublicId(pubId);
                toast.success('Avatar uploaded to Cloudinary!');
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aryan Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campus Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@studymyte.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>
            </div>
          </div>

          {/* Existing Club Affiliation Toggle */}
          <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-navy-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-500" />
                <span>Are you already a member of a campus club?</span>
              </span>
              <input
                type="checkbox"
                id="registeredWithClub"
                checked={registeredWithClub}
                onChange={(e) => setRegisteredWithClub(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500/20"
              />
            </div>

            {registeredWithClub && (
              <div className="pt-2 animate-in fade-in">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Select Your Club
                </label>
                <select
                  value={selectedClubId}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-panel text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  A verification request will be dispatched to the club manager.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-panel text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-panel text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500/20"
            />
            <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400">
              I agree to the{' '}
              <a href="#terms" className="text-brand-500 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-brand-500 hover:underline">
                Privacy Policy
              </a>
              .
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <span>Already registered?</span>
          <Link to="/login" className="text-brand-500 font-semibold hover:underline inline-flex items-center gap-1">
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
