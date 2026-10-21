import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { resourceService } from '../../services/resourceService';
import { FileText, Lock, Download, CheckCircle, ShieldAlert, Trash2 } from 'lucide-react';

export default function ResourceCard({ resource, isMember, onDownloadSuccess }) {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);

  const hasAccess = isAdmin || isMember;

  // Visual accent styles matching screenshot
  const accentClasses = {
    red: 'bg-rose-50 text-rose-500 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    blue: 'bg-blue-50 text-brand-500 border-blue-200 dark:bg-brand-950/40 dark:text-brand-400 dark:border-brand-800',
    purple: 'bg-purple-50 text-purple-500 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
    teal: 'bg-teal-50 text-teal-500 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800',
    orange: 'bg-amber-50 text-amber-500 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  };

  const iconStyle = accentClasses[resource.color_accent] || accentClasses.blue;

  const handleDownload = async () => {
    if (!hasAccess) {
      setShowLockModal(true);
      return;
    }

    try {
      setDownloading(true);
      const res = await resourceService.downloadResource(resource.id, user);
      
      // Trigger browser download
      const a = document.createElement('a');
      a.href = res.download_url;
      a.download = res.file_name || `${resource.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success(`Downloaded "${resource.title}" successfully!`);
      if (onDownloadSuccess) onDownloadSuccess(resource);
    } catch (err) {
      toast.error(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Oct 12, 2026';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  return (
    <>
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        
        {/* Left Icon and Details */}
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${iconStyle}`}>
            <FileText className="w-6 h-6" />
          </div>

          <div className="min-w-0">
            <h4 className="font-display font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {resource.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              <span>{resource.file_type || 'PDF'}</span>
              <span>•</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {resource.club?.name || 'Club'}
              </span>
              <span>•</span>
              <span>{formatDate(resource.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Right Action */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to permanently delete "${resource.title}" from MongoDB Atlas?`)) {
                  try {
                    await resourceService.deleteResource(resource.id, resource.club_id, user);
                    toast.success(`Deleted "${resource.title}".`);
                  } catch (err) {
                    toast.error(err.message || 'Failed to delete resource');
                  }
                }
              }}
              className="p-2 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white dark:bg-rose-950/40 dark:hover:bg-rose-600 dark:hover:text-white transition-all"
              title="Admin: Delete Resource from MongoDB Atlas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {hasAccess ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 hover:bg-brand-500 hover:text-white dark:bg-brand-500/10 dark:hover:bg-brand-500 dark:hover:text-white transition-all shadow-sm"
              title="Download full resource"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Downloading...' : 'Download'}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowLockModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              title="Locked: Club members only"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Members only</span>
            </button>
          )}
        </div>
      </div>

      {/* Lock Information Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-200 dark:border-amber-800 mx-auto flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Members-Only Resource
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              This resource is completely free, but protected exclusively for approved active members of{' '}
              <strong className="text-brand-600 dark:text-brand-400">{resource.club?.name}</strong>.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-left space-y-1">
              <div className="font-semibold text-slate-700 dark:text-slate-200">Why are resources protected?</div>
              <div>• Free for all eligible student members</div>
              <div>• Zero paywalls or charges</div>
              <div>• Apply to join the club below to gain full access!</div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLockModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <Link
                to={`/clubs/${resource.club_id}`}
                onClick={() => setShowLockModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md transition-all"
              >
                Join {resource.club?.name}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
