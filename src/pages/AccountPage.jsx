import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { membershipService } from '../services/membershipService';
import { resourceService } from '../services/resourceService';
import { clubService } from '../services/clubService';
import { notificationService } from '../services/notificationService';
import AvatarUploader from '../components/ui/AvatarUploader';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  BookOpen,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Download,
  Clock,
  ArrowRight,
  Shield,
  Briefcase,
  Sparkles,
  CheckCircle2,
  FileText,
  Camera,
  User,
  Mail,
  Phone,
  Save,
  ShieldCheck,
} from 'lucide-react';

export default function AccountPage() {
  const { user, isAdmin, isOwner, isManager, logout, updateProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [joinedMemberships, setJoinedMemberships] = useState([]);
  const [pendingApps, setPendingApps] = useState([]);
  const [allAccessibleResources, setAllAccessibleResources] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Fallback for user display name
  const displayName = user?.full_name?.trim() || user?.email?.split('@')[0] || 'Member';
  const firstName = displayName.split(' ')[0];

  // Edit profile form state
  const [editFullName, setEditFullName] = useState(user?.full_name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  const loadData = () => {
    if (!user) return;
    const mems = membershipService.getUserMemberships(user.id);
    setJoinedMemberships(mems);

    const apps = membershipService.getUserMembershipApplications(user.id);
    setPendingApps(apps);

    const allRes = resourceService.getResources();
    const joinedClubIds = mems.map((m) => m.club_id);
    const accessible = allRes.filter((r) => joinedClubIds.includes(r.club_id));
    setAllAccessibleResources(accessible);
    setRecentResources(accessible.slice(0, 4));

    setEvents(clubService.getEvents());
    setNotifications(notificationService.getNotifications(user.id));

    setEditFullName(user.full_name || '');
    setEditPhone(user.phone || '');
  };

  useEffect(() => {
    loadData();
    window.addEventListener('cc_storage_changed', loadData);
    return () => window.removeEventListener('cc_storage_changed', loadData);
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In Required</h2>
        <p className="text-sm text-slate-500">Please sign in to access your student portal.</p>
        <Link to="/login" className="px-6 py-2.5 rounded-full bg-brand-500 text-white font-semibold text-sm inline-block">
          Go to Login
        </Link>
      </div>
    );
  }

  const handleDownload = async (res) => {
    try {
      const result = await resourceService.downloadResource(res.id, user);
      const a = document.createElement('a');
      a.href = result.download_url;
      a.download = result.file_name || `${res.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Downloaded ${res.title}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAvatarUpdate = async (newUrl, newPublicId) => {
    try {
      await updateProfile({
        avatar_url: newUrl,
        avatar_public_id: newPublicId,
      });
      toast.success('Profile avatar updated via Cloudinary!');
      setShowAvatarModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update avatar');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: editFullName,
        phone: editPhone,
      });
      toast.success('Profile information saved!');
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar (Matching screenshot) */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-sm">
            
            {/* Avatar with Camera Trigger Overlay */}
            <div className="relative inline-block group">
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || displayName || 'User')}&backgroundColor=2463ff,7258ff`}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-brand-500/20 group-hover:opacity-90 transition-opacity"
              />
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-brand-500 text-white shadow-md hover:bg-brand-600 transition-transform hover:scale-110"
                title="Change Avatar (Cloudinary)"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                {displayName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300 text-xs font-semibold uppercase">
                <span>{user.platform_role}</span>
              </div>
            </div>

            {/* Quick Change Avatar Button */}
            <button
              onClick={() => setShowAvatarModal(true)}
              className="w-full py-1.5 px-3 rounded-xl border border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-300 bg-brand-50/50 dark:bg-brand-500/10 hover:bg-brand-100 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </button>

            {/* Sidebar Navigation Links */}
            <nav className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1 text-left text-xs sm:text-sm font-semibold">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'my-clubs', label: `My Clubs (${joinedMemberships.length})`, icon: Users },
                { id: 'applications', label: `Applications (${pendingApps.length})`, icon: FileCheck },
                { id: 'my-resources', label: `My Resources (${allAccessibleResources.length})`, icon: BookOpen },
                { id: 'events', label: `Events (${events.length})`, icon: Calendar },
                { id: 'notifications', label: `Notifications (${notifications.length})`, icon: Bell },
                { id: 'profile', label: 'Profile Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      activeSection === item.id
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="lg:col-span-3 space-y-8">
          
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 italic">
                "Learn. Build. Belong."
              </p>
            </div>

            {/* Quick shortcuts for elevated roles if present */}
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              {isOwner && (
                <Link
                  to="/owner/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Owner Dashboard</span>
                </Link>
              )}
            </div>
          </div>

          {/* DASHBOARD TAB (Matching screenshot) */}
          {activeSection === 'dashboard' && (
            <div className="space-y-8">
              {/* Metrics 4-Box Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* Joined Clubs */}
                <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-display font-black text-2xl text-slate-900 dark:text-white">
                      {joinedMemberships.length}
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Joined Clubs
                    </div>
                  </div>
                </div>

                {/* Pending Applications */}
                <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-display font-black text-2xl text-slate-900 dark:text-white">
                      {pendingApps.filter((a) => a.status === 'pending').length}
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Pending
                    </div>
                  </div>
                </div>

                {/* Resources Available */}
                <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-500 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-display font-black text-2xl text-slate-900 dark:text-white">
                      {allAccessibleResources.length}
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Resources
                    </div>
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-display font-black text-2xl text-slate-900 dark:text-white">
                      {events.length}
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Upcoming Events
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: My Clubs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                    My Clubs
                  </h2>
                  <Link to="/clubs" className="text-xs font-semibold text-brand-500 hover:underline">
                    View All →
                  </Link>
                </div>

                {joinedMemberships.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-8 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 mx-auto flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">No joined clubs yet</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        Explore student clubs, submit applications, and connect with peers to unlock resources and exclusive events.
                      </p>
                    </div>
                    <div className="pt-1">
                      <Link
                        to="/clubs"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <span>Explore Clubs</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {joinedMemberships.map((mem) => {
                      const club = mem.club;
                      if (!club) return null;
                      return (
                        <div
                          key={mem.id}
                          className="glass-panel rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
                        >
                          <div className="h-32 w-full overflow-hidden relative">
                            <img
                              src={club.banner_url || club.logo_url}
                              alt={club.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute top-2.5 right-2.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow">
                                Member
                              </span>
                            </div>
                          </div>
                          <div className="p-4 space-y-2">
                            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                              {club.name}
                            </h4>
                            <Link
                              to={`/clubs/${club.id}`}
                              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                            >
                              <span>Open Club Space</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section: Recent Resources */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                    Recent Resources
                  </h2>
                  <Link to="/resources" className="text-xs font-semibold text-brand-500 hover:underline">
                    All Resources →
                  </Link>
                </div>

                {recentResources.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-8 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-500 mx-auto flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">No club resources available yet</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        Join a club or check the public repository for lecture notes, study materials, and past papers.
                      </p>
                    </div>
                    <div className="pt-1">
                      <Link
                        to="/resources"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
                      >
                        <span>Browse Resources</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentResources.map((res) => (
                      <div
                        key={res.id}
                        className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4 border border-slate-200/80 dark:border-slate-800 shadow-sm"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-white">
                              {res.title}
                            </h4>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {res.club?.name} • {new Date(res.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownload(res)}
                          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Download resource"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}



          {/* MY CLUBS TAB */}
          {activeSection === 'my-clubs' && (
            <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  My Joined Clubs ({joinedMemberships.length})
                </h3>
                <Link to="/clubs" className="text-xs font-semibold text-brand-500 hover:underline">
                  Browse Clubs →
                </Link>
              </div>

              {joinedMemberships.length === 0 ? (
                <div className="py-12 text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 mx-auto flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-white">You haven't joined any clubs yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Discover clubs matching your skills and interests to start participating.</p>
                  <Link to="/clubs" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold">
                    <span>Discover Clubs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {joinedMemberships.map((mem) => (
                    <div key={mem.id} className="p-4 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{mem.club?.name}</h4>
                        <p className="text-xs text-slate-400 capitalize">{mem.membership_role} • Joined {new Date(mem.approved_at).toLocaleDateString()}</p>
                      </div>
                      <Link to={`/clubs/${mem.club_id}`} className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 text-xs font-semibold">
                        Visit Club
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* APPLICATIONS TAB */}
          {activeSection === 'applications' && (
            <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  My Membership Applications ({pendingApps.length})
                </h3>
                <Link to="/clubs" className="text-xs font-semibold text-brand-500 hover:underline">
                  Find Clubs →
                </Link>
              </div>

              {pendingApps.length === 0 ? (
                <div className="py-12 text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-white">No active applications</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">When you apply to join a club, your application status will appear here.</p>
                  <Link to="/clubs" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold">
                    <span>Apply to a Club</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApps.map((app) => (
                    <div key={app.id} className="p-4 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{app.club?.name || 'Club'}</h4>
                        <p className="text-xs text-slate-500">"{app.statement_of_interest || 'Application submitted'}"</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        app.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                        app.status === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MY RESOURCES TAB */}
          {activeSection === 'my-resources' && (
            <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  My Club Resources ({allAccessibleResources.length})
                </h3>
                <Link to="/resources" className="text-xs font-semibold text-brand-500 hover:underline">
                  All Resources →
                </Link>
              </div>

              {allAccessibleResources.length === 0 ? (
                <div className="py-12 text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-500 mx-auto flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-white">No club resources available</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Join clubs to access private study materials, past question papers, and session notes.</p>
                  <Link to="/resources" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold">
                    <span>Browse Public Resources</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {allAccessibleResources.map((res) => (
                    <div key={res.id} className="p-4 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-white">{res.title}</h4>
                          <div className="text-xs text-slate-400 mt-0.5">{res.club?.name} • {new Date(res.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(res)}
                        className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Download resource"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EVENTS TAB */}
          {activeSection === 'events' && (
            <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Upcoming Events ({events.length})
                </h3>
                <Link to="/events" className="text-xs font-semibold text-brand-500 hover:underline">
                  All Events →
                </Link>
              </div>

              {events.length === 0 ? (
                <div className="py-12 text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 mx-auto flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-white">No upcoming events</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">There are no upcoming club events scheduled at the moment.</p>
                  <Link to="/events" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold">
                    <span>Check Events Calendar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {events.map((evt) => (
                    <div key={evt.id} className="p-4 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{evt.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{evt.description}</p>
                      <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-3">
                        <span>📅 {new Date(evt.date).toLocaleDateString()}</span>
                        {evt.location && <span>📍 {evt.location}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeSection === 'notifications' && (
            <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Notifications ({notifications.length})
                </h3>
              </div>

              {notifications.length === 0 ? (
                <div className="py-12 text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-white">You're all caught up!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">No unread notifications or announcements right now.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 space-y-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                      <p className="text-xs text-slate-500">{n.message}</p>
                      <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE SETTINGS TAB */}
          {activeSection === 'profile' && (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                    Profile & Account Settings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage your personal details, student identity, and Cloudinary avatar.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Profile</span>
                </div>
              </div>

              {/* Avatar Quick Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || displayName || 'User')}&backgroundColor=2463ff,7258ff`}
                    alt={displayName}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-brand-500/30"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Profile Photo</h4>
                    <p className="text-xs text-slate-400">Stored and served with automated face detection on Cloudinary CDN.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                </button>
              </div>

              {/* Profile Edit Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(Registered Account)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Contact Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-xs shadow-md hover:bg-brand-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Cloudinary Change Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Update Profile Avatar
            </h3>
            <p className="text-xs text-slate-500">
              Select any photo from your computer or phone. Cloudinary will automatically center your face, crop it to a square, and optimize the file.
            </p>

            <div className="py-4 flex justify-center">
              <AvatarUploader
                currentAvatarUrl={user.avatar_url}
                size="lg"
                label="Choose Photo"
                onUploadSuccess={handleAvatarUpdate}
              />
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
