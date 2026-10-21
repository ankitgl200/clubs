import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clubService } from '../services/clubService';
import { membershipService } from '../services/membershipService';
import { resourceService } from '../services/resourceService';
import { announcementService } from '../services/announcementService';
import {
  Sparkles,
  Users,
  FileText,
  Bell,
  Upload,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Phone,
  Mail,
} from 'lucide-react';

export default function ClubManagerDashboard() {
  const { user, managedClubs, isAdmin } = useAuth();
  const toast = useToast();

  const [activeClub, setActiveClub] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'applications' | 'members' | 'resources' | 'announcements'

  const [members, setMembers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resources, setResources] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Notes');
  const [uploadDesc, setUploadDesc] = useState('');

  // Announcement modal state
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  const loadData = () => {
    const allClubs = clubService.getClubs(false);
    let target = null;
    if (managedClubs.length > 0) {
      target = allClubs.find((c) => c.id === managedClubs[0].club_id);
    }
    if (!target && isAdmin && allClubs.length > 0) {
      target = allClubs[1] || allClubs[0];
    }

    if (target) {
      setActiveClub(target);
      setMembers(membershipService.getClubMembers(target.id));
      setApplications(membershipService.getMembershipApplications(target.id));
      setResources(resourceService.getResources({ club_id: target.id }));
      setAnnouncements(announcementService.getAnnouncements(target.id));
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('cc_storage_changed', loadData);
    return () => window.removeEventListener('cc_storage_changed', loadData);
  }, [user]);

  if (!activeClub) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Assigned Club</h2>
        <p className="text-xs text-slate-500">
          You do not currently manage an active club. Once you are granted manager privileges by a club owner or administrator, you will manage member applications here.
        </p>
      </div>
    );
  }

  const handleReviewApp = (appId, action) => {
    try {
      membershipService.reviewMembershipApplication(appId, action, user);
      toast.success(`Application ${action === 'approve' ? 'approved' : 'rejected'}!`);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUploadResource = (e) => {
    e.preventDefault();
    try {
      resourceService.createResource(
        {
          club_id: activeClub.id,
          title: uploadTitle,
          description: uploadDesc,
          category: uploadCategory,
          file_type: 'PDF',
          file_name: `${uploadTitle.replace(/\s+/g, '_')}.pdf`,
          file_size_bytes: 2800000,
          color_accent: 'blue',
        },
        user
      );
      toast.success('Resource uploaded!');
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    try {
      announcementService.createAnnouncement(
        {
          club_id: activeClub.id,
          title: annTitle,
          content: annContent,
          is_public: true,
        },
        user
      );
      toast.success('Announcement published!');
      setShowAnnModal(false);
      setAnnTitle('');
      setAnnContent('');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pendingApps = applications.filter((a) => a.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Club Manager Dashboard</span>
            </span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
            {activeClub.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Scoped manager permissions: approve applicants, upload learning resources, and broadcast club updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/clubs/${activeClub.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-500"
          >
            <span>Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Resource</span>
          </button>
        </div>
      </div>

      {/* Scoped Restriction Notice */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span>
          <strong>Manager Scope Enforced:</strong> You have authorization to manage members, review applications, and publish files for <strong>{activeClub.name}</strong>. Owner-only actions (transfer ownership, change critical club identity) are reserved for the club owner.
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'applications', label: `Applications (${pendingApps.length})` },
          { id: 'members', label: `Members (${members.length})` },
          { id: 'resources', label: `Resources (${resources.length})` },
          { id: 'announcements', label: `Announcements (${announcements.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Members</span>
              <div className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mt-1">
                {members.length}
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase">Pending Requests</span>
              <div className="font-display font-extrabold text-2xl text-amber-500 mt-1">
                {pendingApps.length}
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase">Resources</span>
              <div className="font-display font-extrabold text-2xl text-brand-500 mt-1">
                {resources.length}
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase">Announcements</span>
              <div className="font-display font-extrabold text-2xl text-teal-500 mt-1">
                {announcements.length}
              </div>
            </div>
          </div>

          {/* Pending Applications Review */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Pending Applicants
              </h3>
              <button
                onClick={() => setActiveTab('applications')}
                className="text-xs text-teal-600 font-semibold hover:underline"
              >
                View all →
              </button>
            </div>

            {pendingApps.length === 0 ? (
              <p className="text-xs text-slate-400">No pending applications at this time.</p>
            ) : (
              <div className="space-y-3">
                {pendingApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {app.user_name}
                        </span>
                        <a href={`mailto:${app.user_email}`} className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
                          {app.user_email}
                        </a>
                        {app.user_phone && (
                          <a href={`tel:${app.user_phone}`} className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <Phone className="w-3 h-3" />
                            <span>{app.user_phone}</span>
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Reason:</span> "{app.statement_of_interest}"
                      </div>
                      {app.skills && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          <span className="font-medium text-slate-600 dark:text-slate-400">Skills / Interests:</span> {app.skills}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReviewApp(app.id, 'reject')}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleReviewApp(app.id, 'approve')}
                        className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Membership Applications
          </h3>
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{app.user_name}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">
                      {app.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>Email: {app.user_email}</span>
                    {app.user_phone && <span>• Phone: {app.user_phone}</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Reason:</span> "{app.statement_of_interest}"
                  </p>
                  {app.skills && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Skills: {app.skills}
                    </div>
                  )}
                </div>
                {app.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReviewApp(app.id, 'reject')}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleReviewApp(app.id, 'approve')}
                      className="px-4 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MEMBERS */}
      {activeTab === 'members' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Club Members ({members.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">{m.user?.full_name}</td>
                    <td className="py-3 text-slate-500">{m.user?.email}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 uppercase">
                        {m.membership_role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Club Resources ({resources.length})
            </h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold shadow"
            >
              + Upload Resource
            </button>
          </div>
          <div className="space-y-3">
            {resources.map((res) => (
              <div key={res.id} className="p-4 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{res.title}</h4>
                <div className="text-xs text-slate-400">{res.category} • {res.file_name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Club Announcements ({announcements.length})
            </h3>
            <button
              onClick={() => setShowAnnModal(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold shadow"
            >
              + Post Announcement
            </button>
          </div>
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ann.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Resource Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleUploadResource} className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Upload Club Resource
            </h3>
            <div>
              <label className="block text-xs font-semibold mb-1">Title *</label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Competitive Programming Workshop Deck"
                className="w-full px-3.5 py-2 rounded-xl glass-panel text-xs border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-panel text-xs border border-slate-700"
              >
                <option value="Notes">Notes</option>
                <option value="Projects">Projects</option>
                <option value="Guides">Guides</option>
                <option value="Papers">Papers</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                placeholder="Brief summary..."
                className="w-full px-3.5 py-2 rounded-xl glass-panel text-xs border border-slate-700"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow"
              >
                Upload & Share
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleCreateAnnouncement} className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Broadcast Announcement
            </h3>
            <div>
              <label className="block text-xs font-semibold mb-1">Headline *</label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. Hackathon Mentorship Slots Open"
                className="w-full px-3.5 py-2 rounded-xl glass-panel text-xs border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Message *</label>
              <textarea
                required
                rows={4}
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                placeholder="Write your announcement to club members..."
                className="w-full px-3.5 py-2 rounded-xl glass-panel text-xs border border-slate-700"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAnnModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow"
              >
                Publish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
