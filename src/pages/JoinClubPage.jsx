import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { invitationService } from '../services/invitationService';
import { clubService } from '../services/clubService';
import { decryptInvitationCode } from '../utils/invitationCrypto';
import { API_URL } from '../config/api';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  KeyRound,
  LogIn,
  UserCheck,
} from 'lucide-react';

export default function JoinClubPage() {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [inputCode, setInputCode] = useState(() => (urlCode ? decryptInvitationCode(urlCode) : ''));
  const [invitation, setInvitation] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemedClub, setRedeemedClub] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (urlCode) {
      const clean = decryptInvitationCode(urlCode);
      setInputCode(clean);
      fetchInvitationDetails(clean);
    } else {
      setLoading(false);
    }
  }, [urlCode]);

  const fetchInvitationDetails = async (codeToFetch) => {
    try {
      setLoading(true);
      setError('');
      const clean = decryptInvitationCode(codeToFetch).trim().toUpperCase();
      if (!clean) {
        setLoading(false);
        return;
      }

      // Check local storage engine first
      const localInv = invitationService.getInvitationByCode(clean);
      if (localInv) {
        setInvitation(localInv);
        const clubData = clubService.getClubById(localInv.club_id);
        setClub(clubData);
        setLoading(false);
        return;
      }

      // Try backend API
      const res = await fetch(`${API_URL}/invitations/code/${clean}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid or expired invitation code.');
        setInvitation(null);
      } else {
        setInvitation(data.invitation);
        setClub(data.club);
      }
    } catch (err) {
      setError(err.message || 'Failed to verify invitation code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (e) => {
    if (e) e.preventDefault();
    const targetCode = decryptInvitationCode(inputCode).trim().toUpperCase();
    if (!targetCode) {
      toast.error('Please enter an invitation code.');
      return;
    }

    if (!isAuthenticated || !user) {
      toast.info('Please log in to redeem this invitation.');
      navigate(`/login?redirect=/join/${targetCode}`);
      return;
    }

    try {
      setRedeeming(true);
      setError('');
      const result = await invitationService.redeemInvitation(targetCode, user);
      setRedeemedClub(result.club_name || club?.name || 'Club');
      toast.success(result.message || 'Successfully joined club!');
    } catch (err) {
      setError(err.message || 'Failed to redeem invitation.');
      toast.error(err.message || 'Failed to redeem invitation.');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">
        {/* Main Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Club Invitation Access
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Join exclusive student clubs and campus chapters via an invitation code or link.
            </p>
          </div>

          {/* Success State */}
          {redeemedClub ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-emerald-900 dark:text-emerald-200">
                  Welcome to {redeemedClub}!
                </h3>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1">
                  You are now an official verified member of this club.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to={`/clubs/${invitation?.club_id || ''}`}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow flex items-center justify-center gap-1.5"
                >
                  <span>Go to Club Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/account"
                  className="px-4 py-2.5 rounded-xl glass-panel text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-500 flex items-center justify-center"
                >
                  My Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Club Preview if code valid */}
              {club && !error && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                  {club.logo_url ? (
                    <img
                      src={club.logo_url}
                      alt={club.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xl flex-shrink-0">
                      <Building className="w-7 h-7" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                      {club.category || 'Official Club'}
                    </span>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white truncate mt-0.5">
                      {club.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 flex items-center gap-1.5 border border-brand-200 dark:border-brand-800">
                        <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                        <span>
                          {invitation?.type === 'restricted'
                            ? 'Special Exclusive Invitation'
                            : 'Official Club Invitation'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-800 dark:text-rose-300 text-xs animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">Invitation Error</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Code Input Form */}
              <form onSubmit={handleRedeem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Invitation Code
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        const val = decryptInvitationCode(raw).toUpperCase();
                        setInputCode(val);
                        if (val.length >= 4) fetchInvitationDetails(val);
                      }}
                      placeholder="e.g. LGIE8725 or paste invitation link"
                      className="flex-1 px-4 py-3 rounded-xl glass-panel border border-slate-300 dark:border-slate-700 text-sm font-mono font-bold tracking-wider text-slate-900 dark:text-white uppercase placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Authentication State handling */}
                {!isAuthenticated ? (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      You need to be logged into your student account to join.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Link
                        to={`/login?redirect=/join/${inputCode || ''}`}
                        className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Log In</span>
                      </Link>
                      <Link
                        to={`/register?redirect=/join/${inputCode || ''}`}
                        className="px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-500"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>
                        Joining as <strong>{user?.email}</strong>
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={redeeming || !inputCode.trim()}
                      className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-bold shadow-lg hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      {redeeming ? (
                        <span>Verifying & Joining...</span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Join Club Now</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </>
          )}

          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-400">
            Have questions? Contact your club head or coordinator for access assistance.
          </div>
        </div>
      </div>
    </div>
  );
}
