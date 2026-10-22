import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminService } from '../services/adminService';
import { membershipService } from '../services/membershipService';
import { storageEngine } from '../services/storageEngine';
import {
  Shield,
  Users,
  Layers,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  ChevronRight,
  Sparkles,
  Building2,
  Clock,
  RefreshCw,
  Trash2,
  Download,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [clubApps, setClubApps] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'clubs' | 'users' | 'resources' | 'applications'
  const [selectedApp, setSelectedApp] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = () => {
    setStats(adminService.getStats());
    setAuditLogs(adminService.getAuditLogs());
    setClubApps(adminService.getClubApplications());
    setAllClubs(adminService.getAllClubs());
    setAllUsers(adminService.getAllUsers());
    setAllResources(adminService.getAllResources ? adminService.getAllResources() : storageEngine.getResources());
  };

  const syncFreshData = async () => {
    try {
      setIsSyncing(true);
      await storageEngine.syncWithMongoDB();
      loadData();
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    storageEngine.syncWithMongoDB().then(() => {
      loadData();
      setIsLoading(false);
    }).catch(() => {
      loadData();
      setIsLoading(false);
    });
    loadData();

    // Auto-poll MongoDB every 5 seconds so live submissions from other devices appear in real-time
    const pollInterval = setInterval(() => {
      storageEngine.syncWithMongoDB().then(loadData).catch(() => {});
    }, 5000);

    window.addEventListener('cc_storage_changed', loadData);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('cc_storage_changed', loadData);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center gap-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
          <RefreshCw className="w-7 h-7 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-base text-slate-800 dark:text-white">
            Accessing Platform Administrator Portal
          </h3>
          <p className="text-xs text-slate-500">
            Verifying admin credentials and synchronizing system audit logs...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Privileges Required</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          You are currently signed in as <strong>{user?.full_name || 'Guest'}</strong> ({user?.platform_role || 'Visitor'}). Platform administrator authorization is required to access this portal.
        </p>
      </div>
    );
  }

  // Handle Quick Approve for membership application
  const handleQuickApproveMem = async (appId) => {
    try {
      await membershipService.reviewMembershipApplication(appId, 'approve', user);
      toast.success('Membership request approved!');
      await storageEngine.syncWithMongoDB();
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle Review Club Registration
  const handleReviewClubApp = async (action) => {
    if (!selectedApp) return;
    setIsReviewing(true);
    try {
      await adminService.reviewClubApplication(selectedApp.id, action, user, adminNotes);
      toast.success(`Club application ${action === 'approve' ? 'approved' : 'rejected'}!`);
      setSelectedApp(null);
      setAdminNotes('');
      await storageEngine.syncWithMongoDB();
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsReviewing(false);
    }
  };

  // Toggle Club suspension
  const handleToggleClubStatus = (clubId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      adminService.toggleClubStatus(clubId, nextStatus);
      toast.success(`Club status updated to ${nextStatus}.`);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Administrative Delete Club
  const handleDeleteClub = async (clubId, clubName) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${clubName}"?\n\nThis will remove the club from MongoDB Atlas along with all its resources, memberships, announcements, and events.`
    );
    if (!confirmed) return;

    try {
      await adminService.deleteClub(clubId);
      toast.success(`Club "${clubName}" deleted successfully.`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete club.');
    }
  };

  // Administrative Delete User
  const handleDeleteUser = async (userId, userName) => {
    if (userId === user?.id) {
      toast.error('You cannot delete your own logged-in admin account.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete user "${userName}"?\n\nThis will remove them from MongoDB Atlas and delete all their club memberships.`
    );
    if (!confirmed) return;

    try {
      await adminService.deleteUser(userId);
      toast.success(`User "${userName}" deleted successfully.`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.');
    }
  };

  // Administrative Delete Club Application
  const handleDeleteClubApp = async (appId, clubName) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the registration application for "${clubName}"?`
    );
    if (!confirmed) return;

    try {
      await adminService.deleteClubApplication(appId);
      toast.success(`Application for "${clubName}" deleted.`);
      if (selectedApp?.id === appId) setSelectedApp(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete application.');
    }
  };

  // Administrative Delete Resource
  const handleDeleteResource = async (resourceId, resourceTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete resource "${resourceTitle}"?\n\nThis will remove it from MongoDB Atlas.`
    );
    if (!confirmed) return;

    try {
      await adminService.deleteResource(resourceId);
      toast.success(`Resource "${resourceTitle}" deleted successfully.`);
      await storageEngine.syncWithMongoDB();
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete resource.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Admin Header (Exact dark mode match from screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Platform Administration</span>
            </span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage clubs, users, resources and keep the community safe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['overview', 'clubs', 'users', 'resources', 'applications'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                storageEngine.syncWithMongoDB().then(loadData);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-brand-500 text-white shadow'
                  : 'glass-panel text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={syncFreshData}
            disabled={isSyncing}
            className="px-3 py-2 rounded-xl text-xs font-semibold glass-panel text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Fetch latest data from MongoDB Atlas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-500' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
          </button>
        </div>
      </div>

      {/* 4 Clickable Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Clubs */}
        <div
          onClick={() => {
            setActiveTab('clubs');
            storageEngine.syncWithMongoDB().then(loadData);
          }}
          className={`glass-panel rounded-2xl p-5 border shadow-sm space-y-3 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${
            activeTab === 'clubs'
              ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/40 shadow-brand-500/10'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50'
          }`}
          title="Click to view and manage all campus clubs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clubs</span>
            <Building2 className="w-4 h-4 text-brand-500" />
          </div>
          <div className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
            {stats?.totalClubs ?? 0}
          </div>
          <div className="text-[11px] text-emerald-500 font-medium flex items-center justify-between">
            <span>● {stats?.activeClubs ?? 0} Active</span>
            <span className="text-brand-500 text-[10px] flex items-center gap-0.5 font-semibold">
              Manage <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Total Students */}
        <div
          onClick={() => {
            setActiveTab('users');
            storageEngine.syncWithMongoDB().then(loadData);
          }}
          className={`glass-panel rounded-2xl p-5 border shadow-sm space-y-3 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${
            activeTab === 'users'
              ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/40 shadow-blue-500/10'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50'
          }`}
          title="Click to view and review verified student accounts"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
            {stats?.totalStudents ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Verified campus profiles</span>
            <span className="text-blue-400 text-[10px] flex items-center gap-0.5 font-semibold">
              Review <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Resources */}
        <div
          onClick={() => {
            setActiveTab('resources');
            storageEngine.syncWithMongoDB().then(loadData);
          }}
          className={`glass-panel rounded-2xl p-5 border shadow-sm space-y-3 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${
            activeTab === 'resources'
              ? 'border-teal-500 bg-teal-500/10 ring-2 ring-teal-500/40 shadow-teal-500/10'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-teal-500/50'
          }`}
          title="Click to view and review uploaded resources"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resources</span>
            <FileText className="w-4 h-4 text-teal-400" />
          </div>
          <div className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">
            {stats?.totalResources ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Notes, guides, projects</span>
            <span className="text-teal-400 text-[10px] flex items-center gap-0.5 font-semibold">
              Review <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Pending Requests */}
        <div
          onClick={() => {
            setActiveTab('applications');
            storageEngine.syncWithMongoDB().then(loadData);
          }}
          className={`glass-panel rounded-2xl p-5 border shadow-sm space-y-3 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${
            activeTab === 'applications'
              ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/40 shadow-amber-500/10'
              : 'border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50'
          }`}
          title="Click to inspect and review pending club applications"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Requests</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display font-extrabold text-3xl text-amber-500">
            {stats?.pendingRequests ?? 0}
          </div>
          <div className="text-[11px] text-amber-400/80 font-medium flex items-center justify-between">
            <span>Requires admin action</span>
            <span className="text-amber-400 text-[10px] flex items-center gap-0.5 font-semibold">
              Review <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Recent Activity Section (Exact screenshot match) */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Recent Activity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time events across memberships, uploads, and club registrations.
                </p>
              </div>
              <span className="text-xs font-semibold text-brand-500 hover:underline cursor-pointer">
                View All →
              </span>
            </div>

            <div className="space-y-4">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No recent activity logged yet. New applications, member approvals, and uploads will be recorded here in real time.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-navy-900 transition-colors"
                  >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {log.actor_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {log.description}
                      </p>
                      <span className="text-[11px] text-slate-400">{log.time_ago}</span>
                    </div>
                  </div>

                  {/* Quick Action Button based on activity type */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {log.type === 'membership_request' && (
                      <button
                        onClick={() => handleQuickApproveMem(log.target_id)}
                        className="px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-sm transition-all"
                      >
                        Approve
                      </button>
                    )}
                    {log.type === 'club_application' && (
                      <button
                        onClick={() => {
                          const app = clubApps.find((a) => a.id === log.target_id);
                          setSelectedApp(app || clubApps[0]);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm transition-all"
                      >
                        Review
                      </button>
                    )}
                    {log.type !== 'membership_request' && log.type !== 'club_application' && (
                      <button
                        onClick={() => toast.info(`Viewing details for ${log.description}`)}
                        className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all"
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              )))}
            </div>
          </div>

          {/* Quick Management Cards (Manage Clubs / Manage Users) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div
              onClick={() => setActiveTab('clubs')}
              className="group glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                  Manage Clubs
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  View and manage all registered campus clubs, suspend inactive organizations, and review ownership.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-500">
                <span>Open Club Management</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => setActiveTab('users')}
              className="group glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                  Manage Users
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Handle user roles, verify campus credentials, and audit student access across organizations.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-500">
                <span>Open User Directory</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLUBS MANAGEMENT TAB */}
      {activeTab === 'clubs' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              All Campus Clubs ({allClubs.length})
            </h3>
          </div>

          <div className="table-responsive -mx-6 px-6 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Club Name</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Members</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allClubs.map((club) => (
                  <tr key={club.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-900/30">
                    <td className="py-4 font-semibold text-slate-900 dark:text-white">
                      {club.name}
                    </td>
                    <td className="py-4 text-slate-500">{club.category}</td>
                    <td className="py-4 text-slate-500">{club.member_count}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        club.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}>
                        {club.status}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <Link
                        to={`/clubs/${club.id}`}
                        className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-brand-500 font-medium"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleToggleClubStatus(club.id, club.status)}
                        className={`px-3 py-1 rounded-lg text-white font-medium ${
                          club.status === 'active' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {club.status === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                      <button
                        onClick={() => handleDeleteClub(club.id, club.name)}
                        className="px-3 py-1 rounded-lg text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white dark:bg-rose-950/40 dark:hover:bg-rose-600 dark:hover:text-white font-medium transition-colors"
                        title="Delete club and all associated records from MongoDB Atlas"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            User Accounts ({allUsers.length})
          </h3>

          <div className="table-responsive -mx-6 px-6 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Platform Role</th>
                  <th className="pb-3 font-semibold">Verified</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-900/30">
                    <td className="py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <img src={u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.full_name || 'User')}&backgroundColor=2463ff,7258ff`} alt="" className="w-7 h-7 rounded-full object-cover" />
                      <span>{u.full_name}</span>
                    </td>
                    <td className="py-4 text-slate-500">{u.email}</td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300 uppercase">
                        {u.platform_role}
                      </span>
                    </td>
                    <td className="py-4 text-emerald-500 font-semibold">
                      {u.email_verified ? '✓ Verified' : 'Pending'}
                    </td>
                    <td className="py-4 text-right">
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.full_name || u.email)}
                          className="px-3 py-1 rounded-lg text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white dark:bg-rose-950/40 dark:hover:bg-rose-600 dark:hover:text-white font-medium transition-colors"
                          title="Delete user account and memberships from MongoDB Atlas"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESOURCES MANAGEMENT TAB */}
      {activeTab === 'resources' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Campus Learning Resources ({allResources.length})
            </h3>
            <span className="text-xs text-slate-400">
              MongoDB Atlas Stored Files & Guides
            </span>
          </div>

          <div className="table-responsive -mx-6 px-6 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Resource Title</th>
                  <th className="pb-3 font-semibold">Club</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allResources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      No learning resources uploaded yet across campus clubs.
                    </td>
                  </tr>
                ) : (
                  allResources.map((res) => {
                    const clubName = allClubs.find((c) => c.id === res.club_id)?.name || res.club?.name || 'Campus Resource';
                    return (
                      <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-900/30">
                        <td className="py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="truncate max-w-xs">{res.title}</div>
                            {res.file_name && (
                              <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">{res.file_name}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-slate-500 font-medium">{clubName}</td>
                        <td className="py-4 text-slate-500">{res.category || 'Notes'}</td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300 uppercase">
                            {res.file_type || 'PDF'}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          {res.file_url && (
                            <a
                              href={res.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-brand-500 font-medium inline-flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>View / Download</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteResource(res.id, res.title)}
                            className="px-3 py-1 rounded-lg text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white dark:bg-rose-950/40 dark:hover:bg-rose-600 dark:hover:text-white font-medium transition-colors"
                            title="Delete resource from MongoDB Atlas"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APPLICATIONS TAB */}
      {activeTab === 'applications' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            Pending Club Registration Applications ({clubApps.filter((a) => a.status === 'pending').length})
          </h3>

          <div className="space-y-4">
            {clubApps.map((app) => (
              <div
                key={app.id}
                className="p-5 sm:p-6 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-md transition-shadow"
              >
                {/* Banner & Logo header if present */}
                {(app.banner_url || app.logo_url) && (
                  <div className="relative h-28 sm:h-36 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800">
                    {app.banner_url ? (
                      <img src={app.banner_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-brand-500/20 to-accent-cyan/20" />
                    )}
                    {app.logo_url && (
                      <div className="absolute bottom-2 left-3 w-14 h-14 rounded-xl overflow-hidden border-2 border-white dark:border-slate-900 shadow-md bg-white">
                        <img src={app.logo_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    {!app.banner_url && app.logo_url && (
                      <img src={app.logo_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                    )}
                    <div>
                      <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                        {app.club_name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="px-2 py-0.5 rounded font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                          {app.category}
                        </span>
                        <span>•</span>
                        <span>{app.college_affiliation}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    app.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : app.status === 'rejected'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  }`}>
                    {app.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {app.description}
                </p>

                {/* Structured Credentials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Club Owner</span>
                    <strong className="text-slate-900 dark:text-white">{app.owner_name || app.applicant_name}</strong>
                    <div className="text-[11px] truncate text-slate-500">{app.owner_email || app.applicant_email}</div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Faculty Coordinator</span>
                    <strong className="text-slate-900 dark:text-white">{app.faculty_name || app.faculty_coordinator_name}</strong>
                    <div className="text-[11px] truncate text-slate-500">{app.faculty_email || app.faculty_coordinator_email || 'No email provided'}</div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Location Allocation</span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {app.location || 'Pending allocation'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleDeleteClubApp(app.id, app.club_name)}
                    className="px-4 py-2 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white dark:bg-rose-950/40 dark:hover:bg-rose-600 dark:hover:text-white font-semibold text-xs transition-all flex items-center gap-1.5"
                    title="Delete club application"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                  {app.status === 'pending' && (
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-5 py-2 rounded-xl bg-brand-500 text-white font-semibold text-xs shadow hover:bg-brand-600 transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Decision</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="glass-panel max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Review Club Registration
              </h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Media previews */}
            {(selectedApp.banner_url || selectedApp.logo_url) && (
              <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {selectedApp.banner_url && (
                  <img src={selectedApp.banner_url} alt="" className="w-full h-full object-cover" />
                )}
                {selectedApp.logo_url && (
                  <div className="absolute bottom-2 left-3 w-14 h-14 rounded-xl overflow-hidden border-2 border-white dark:border-slate-900 shadow bg-white">
                    <img src={selectedApp.logo_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{selectedApp.club_name}</h4>
                  <p className="text-slate-500">{selectedApp.category} • {selectedApp.college_affiliation}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Club Owner:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.owner_name || selectedApp.applicant_name} ({selectedApp.owner_email || selectedApp.applicant_email})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Faculty Coordinator:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.faculty_name || selectedApp.faculty_coordinator_name} {selectedApp.faculty_email ? `(${selectedApp.faculty_email})` : ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Allocated Location:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedApp.location || 'Leave blank (none allocated)'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Official Club Email:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{selectedApp.official_email}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Description & Mission:</span>
                <p className="mt-1 text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-navy-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                  {selectedApp.description}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Evaluation Notes
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add compliance, venue confirmation, or onboarding notes..."
                className="w-full px-3 py-2 rounded-xl glass-panel text-xs text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={isReviewing}
                onClick={() => handleReviewClubApp('reject')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold transition"
              >
                Reject Application
              </button>
              <button
                disabled={isReviewing}
                onClick={() => handleReviewClubApp('approve')}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-semibold shadow transition"
              >
                {isReviewing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Approve & Activate Club</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
