import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clubService } from '../services/clubService';
import { membershipService } from '../services/membershipService';
import { resourceService } from '../services/resourceService';
import { announcementService } from '../services/announcementService';
import { storageEngine } from '../services/storageEngine';
import ResourceCard from '../components/resources/ResourceCard';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Lock,
  Sparkles,
  FileText,
  UserCheck,
  ChevronRight,
  Shield,
  Briefcase,
  Share2,
  Upload,
  User,
  Mail,
  Phone,
  X,
  Loader2,
  Globe,
  ExternalLink,
  Trash2,
  MessageCircle,
  Send,
  Megaphone,
  Image as ImageIcon,
  Link2,
} from 'lucide-react';
import { LinkedinIcon, GithubIcon, InstagramIcon } from '../components/common/SocialIcons';

export default function ClubDetailPage() {
  const { clubId } = useParams();
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [club, setClub] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [statement, setStatement] = useState('');
  const [skills, setSkills] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  // Upload PDF Resource states for club owners & managers
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Guides');
  const [uploadFileName, setUploadFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = React.useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    }
    setUploadFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileDataUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      toast.error('Please enter a title for the resource.');
      return;
    }
    if (!selectedFile && !fileDataUrl) {
      toast.error('Please choose a file or document to upload.');
      return;
    }
    setUploadingFile(true);
    try {
      const fileSize = selectedFile?.size || 150000;
      const fileName = uploadFileName || selectedFile?.name || `${uploadTitle.replace(/\s+/g, '_')}.pdf`;

      await resourceService.createResource(
        {
          club_id: club.id,
          title: uploadTitle,
          description: uploadDesc,
          category: uploadCategory,
          file_type: selectedFile?.name?.endsWith('.docx') ? 'DOCX' : selectedFile?.name?.endsWith('.zip') ? 'ZIP' : 'PDF',
          file_name: fileName,
          file_size_bytes: fileSize,
          file_url: fileDataUrl,
          color_accent: 'blue',
        },
        user
      );
      toast.success('Resource published to club library!');
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      setSelectedFile(null);
      setFileDataUrl('');
      setUploadFileName('');
      loadClubData();
    } catch (err) {
      toast.error(err.message || 'Failed to upload resource');
    } finally {
      setUploadingFile(false);
    }
  };

  const loadClubData = () => {
    const c = clubService.getClubById(clubId);
    setClub(c);

    if (c) {
      setResources(resourceService.getResources({ club_id: c.id }));
      setEvents(clubService.getEvents(c.id));
      setAnnouncements(announcementService.getAnnouncements(c.id));
      setMembers(membershipService.getClubMembers(c.id));

      if (user) {
        const mem = membershipService.isUserClubMember(user.id, c.id);
        const role = membershipService.getUserRoleInClub(user.id, c.id);
        setIsMember(mem);
        setUserRole(role);

        const pendingApps = membershipService.getUserMembershipApplications(user.id);
        const hasPending = pendingApps.some((a) => a.club_id === c.id && a.status === 'pending');
        setIsPending(hasPending);
      }
    }
  };

  useEffect(() => {
    setIsLoading(true);
    storageEngine.syncWithMongoDB().then(() => {
      loadClubData();
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
    loadClubData();
    window.addEventListener('cc_storage_changed', loadClubData);
    return () => window.removeEventListener('cc_storage_changed', loadClubData);
  }, [clubId, user]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-64 sm:h-80 w-full rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 sm:-mt-20 px-6">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-300 dark:bg-slate-700 shrink-0 border-4 border-white dark:border-slate-900 shadow-xl" />
          <div className="space-y-3 flex-1 pb-2">
            <div className="h-8 w-1/3 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
        <div className="space-y-3 pt-6 max-w-3xl">
          <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-in fade-in">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Club not found</h2>
        <p className="text-xs text-slate-500 mt-2">The club you are looking for does not exist or may have been unlisted.</p>
        <Link to="/clubs" className="text-brand-500 font-semibold hover:underline mt-4 inline-block text-xs">
          Return to clubs directory
        </Link>
      </div>
    );
  }

  const handleOpenApplyModal = () => {
    if (club.status === 'suspended') {
      toast.error('This club is currently suspended and cannot accept applications.');
      return;
    }
    if (!user) {
      toast.warning('Please log in or register to join this club.');
      return;
    }
    setApplicantName(user.full_name || '');
    setApplicantEmail(user.email || '');
    setApplicantPhone(user.phone || '');
    setShowApplyModal(true);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (club.status === 'suspended') {
      toast.error('This club is currently suspended and cannot accept applications.');
      return;
    }
    if (!user) {
      toast.warning('Please log in or register to join this club.');
      return;
    }

    if (!applicantName.trim()) {
      toast.error('Please enter your member name.');
      return;
    }
    if (!applicantEmail.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    if (!applicantPhone.trim()) {
      toast.error('Please enter your phone number.');
      return;
    }
    if (!statement.trim()) {
      toast.error('Please specify your reason for joining.');
      return;
    }

    setIsSubmittingApp(true);
    try {
      await membershipService.applyForMembership(club.id, user, {
        name: applicantName.trim(),
        user_name: applicantName.trim(),
        email: applicantEmail.trim(),
        user_email: applicantEmail.trim(),
        phone: applicantPhone.trim(),
        user_phone: applicantPhone.trim(),
        statement_of_interest: statement.trim(),
        skills: skills.trim(),
      });
      setIsPending(true);
      setShowApplyModal(false);
      setStatement('');
      setSkills('');
      toast.success(`Application to join ${club.name} submitted! Club leaders will review shortly.`);
      loadClubData();
    } catch (err) {
      toast.error(err.message || 'Failed to submit application.');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  // Strictly check if current user is the owner of THIS club
  const isActualClubOwner =
    user &&
    (club.club_head_id === user.id ||
      (club.club_head_email && club.club_head_email.toLowerCase() === user.email?.toLowerCase()) ||
      userRole === 'owner');

  const handleToggleApplications = () => {
    if (club.status === 'suspended') {
      toast.error('Applications cannot be toggled while the club is suspended.');
      return;
    }
    if (!isActualClubOwner) {
      toast.error('Only the verified club owner of this club can change application intake settings.');
      return;
    }
    const nextStatus = club.applications_open === false ? true : false;
    clubService.updateClub(club.id, { applications_open: nextStatus });
    setClub((prev) => ({ ...prev, applications_open: nextStatus }));
    toast.success(`Joining applications are now ${nextStatus ? 'Open' : 'Closed'}!`);
  };

  const appsOpen = club.applications_open !== false && club.status !== 'suspended';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Suspended Club Notice */}
      {club.status === 'suspended' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-800 dark:text-amber-300 animate-in fade-in">
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
              Club Suspended & Unlisted
            </h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
              This club has been suspended by campus administration and unlisted from the public directory. Joining applications and member operations are temporarily paused.
            </p>
          </div>
        </div>
      )}

      {/* Club Banner & Header Card */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm">
        
        {/* Banner Cover Image */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={club.banner_url || club.logo_url}
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        {/* Info & CTA Bar */}
        <div className="p-6 sm:p-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-start sm:items-center gap-5">
              {/* Club Logo Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-navy-900 shadow-xl flex-shrink-0 bg-white">
                <img src={club.logo_url || club.banner_url} alt={club.name} className="w-full h-full object-cover" />
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
                    {club.name}
                  </h1>
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="px-3 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold border border-brand-200/50">
                    {club.category}
                  </span>
                  
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{club.member_count ?? 0} Members</span>
                  </span>

                  {/* Club Location Badge */}
                  <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                    <span>{club.location || club.meeting_location || 'Location: Pending Allocation'}</span>
                  </span>

                  {/* Club Website Header Link (If available) */}
                  {club.website_url && (
                    <a
                      href={club.website_url.startsWith('http') ? club.website_url : `https://${club.website_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800 transition-colors"
                      title="Visit official website"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Website</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                    </a>
                  )}

                  {/* Applications Status Pill */}
                  <span className="inline-flex items-center gap-1.5">
                    {appsOpen ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Applications Open</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800">
                        <Lock className="w-3 h-3" />
                        <span>Applications Closed</span>
                      </span>
                    )}

                    {/* Owner / Admin Quick Toggle Button */}
                    {isActualClubOwner && (
                      <button
                        onClick={handleToggleApplications}
                        className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                        title="Click to toggle member application intake"
                      >
                        ({appsOpen ? 'Turn Off' : 'Turn On'})
                      </button>
                    )}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed pt-1">
                  {club.tagline || club.description}
                </p>
              </div>
            </div>

            {/* Join / Status Action Button */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {isAdmin && (
                <button
                  onClick={async () => {
                    if (window.confirm(`Permanently delete club "${club.name}" from MongoDB Atlas?`)) {
                      await storageEngine.deleteClub(club.id);
                      toast.success(`Club "${club.name}" deleted.`);
                      window.location.href = '/clubs';
                    }
                  }}
                  className="px-4 py-2.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-950/40 dark:hover:bg-rose-600 dark:hover:text-white font-semibold text-xs sm:text-sm border border-rose-200 dark:border-rose-800 transition-all flex items-center gap-1.5"
                  title="Admin: Delete club from MongoDB Atlas"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Club</span>
                </button>
              )}
              {isMember ? (
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-semibold text-xs sm:text-sm border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Member ({userRole || 'Active'})</span>
                  </div>
                  {userRole === 'owner' && (
                    <Link
                      to="/owner/dashboard"
                      className="px-4 py-2.5 rounded-full bg-brand-500 text-white font-semibold text-xs sm:text-sm shadow-md hover:bg-brand-600 transition-all flex items-center gap-1.5"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Owner Dashboard</span>
                    </Link>
                  )}
                  {userRole === 'manager' && (
                    <Link
                      to="/manager/dashboard"
                      className="px-4 py-2.5 rounded-full bg-teal-500 text-white font-semibold text-xs sm:text-sm shadow-md hover:bg-teal-600 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Manager Dashboard</span>
                    </Link>
                  )}
                </div>
              ) : isPending ? (
                <div className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 font-semibold text-xs sm:text-sm border border-amber-200 dark:border-amber-800">
                  <Clock className="w-4 h-4" />
                  <span>Pending Approval</span>
                </div>
              ) : !appsOpen ? (
                <div className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-semibold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 cursor-not-allowed">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Applications Closed</span>
                </div>
              ) : (
                <button
                  onClick={handleOpenApplyModal}
                  className="px-8 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-lg shadow-brand-500/30 hover:-translate-y-0.5 transition-all"
                >
                  Join Club
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (About, Resources, Events, Announcements, Members, Gallery) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto">
        {[
          { id: 'about', label: 'About' },
          { id: 'resources', label: `Resources (${resources.length})` },
          { id: 'events', label: `Events (${events.length})` },
          { id: 'announcements', label: `Announcements (${announcements.length})` },
          { id: 'members', label: `Members (${members.length})` },
          { id: 'gallery', label: `Gallery (${(club.gallery || []).length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 font-semibold text-sm transition-all relative whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-brand-500 dark:text-brand-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: ABOUT (Matches UI Screenshot) */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: About Us & Upcoming Events */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                About Us
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {club.full_description || club.description}
              </p>
            </div>

            {/* Upcoming Events Box */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Upcoming Events
                </h3>
                <span className="text-xs text-brand-500 font-semibold cursor-pointer">View All →</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-white/60 dark:bg-navy-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2 hover:shadow-md transition-shadow"
                  >
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      {evt.type}
                    </span>
                    <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-white">
                      {evt.title}
                    </h4>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{evt.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Faculty Coordinator, Club Owner, Location */}
          <div className="space-y-6">
            
            {/* Coordinator Endorsement / Faculty */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
              <img
                src={club.faculty_mentor_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(club.faculty_mentor_name || 'Coordinator')}&backgroundColor=2463ff,7258ff`}
                alt={club.faculty_mentor_name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/30 flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block truncate">
                  Coordinator Endorsement
                </span>
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                  {club.faculty_mentor_name || 'Coordinator'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {club.college_affiliation} {club.faculty_mentor_email ? `• ${club.faculty_mentor_email}` : ''}
                </p>
              </div>
            </div>

            {/* Club Owner / Head */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
              <img
                src={club.club_head_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(club.club_head_name || 'Club Lead')}&backgroundColor=2463ff,7258ff`}
                alt={club.club_head_name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/30 flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block truncate">
                  Club Owner
                </span>
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                  {club.club_head_name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {club.club_head_email || club.official_email}
                </p>
              </div>
            </div>

            {/* Club Location */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-xs">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>Club Location</span>
              </div>
              <p className="font-display font-bold text-sm text-slate-900 dark:text-white">
                {club.location || club.meeting_location || 'Not allocated yet'}
              </p>
              <p className="text-[11px] text-slate-400 italic">
                {club.location ? 'Campus allocated room / studio' : 'Official venue allocation is pending with campus admin.'}
              </p>
            </div>

            {/* Club Social Links & External Pages */}
            {(() => {
              const links = club.social_links || {};
              const website = links.website || club.website_url;
              const hasAny =
                website ||
                links.whatsapp ||
                links.telegram ||
                links.linkedin ||
                links.github ||
                links.instagram ||
                (links.custom_links && links.custom_links.length > 0);

              if (!hasAny) return null;

              return (
                <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-xs">
                    <Link2 className="w-4 h-4 text-brand-500" />
                    <span>Club Links & Communities</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {website && (
                      <a
                        href={website.startsWith('http') ? website : `https://${website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900/60 hover:bg-brand-500/10 hover:border-brand-500/40 border border-slate-200/60 dark:border-slate-800 transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-500 truncate">
                            Official Website
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 shrink-0" />
                      </a>
                    )}

                    {links.whatsapp && (
                      <a
                        href={links.whatsapp.startsWith('http') ? links.whatsapp : `https://${links.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900/60 hover:bg-emerald-500/10 hover:border-emerald-500/40 border border-slate-200/60 dark:border-slate-800 transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-500 truncate">
                            WhatsApp Community
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 shrink-0" />
                      </a>
                    )}

                    {links.telegram && (
                      <a
                        href={links.telegram.startsWith('http') ? links.telegram : `https://${links.telegram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900/60 hover:bg-sky-500/10 hover:border-sky-500/40 border border-slate-200/60 dark:border-slate-800 transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Send className="w-4 h-4 text-sky-500 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-500 truncate">
                            Telegram Channel
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 shrink-0" />
                      </a>
                    )}

                    {links.linkedin && (
                      <a
                        href={links.linkedin.startsWith('http') ? links.linkedin : `https://${links.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900/60 hover:bg-blue-600/10 hover:border-blue-600/40 border border-slate-200/60 dark:border-slate-800 transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <LinkedinIcon className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 truncate">
                            LinkedIn
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                      </a>
                    )}

                    {links.github && (
                      <a
                        href={links.github.startsWith('http') ? links.github : `https://${links.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900/60 hover:bg-slate-700/10 hover:border-slate-700/40 border border-slate-200/60 dark:border-slate-800 transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <GithubIcon className="w-4 h-4 text-slate-800 dark:text-slate-200 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-500 truncate">
                            GitHub
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 shrink-0" />
                      </a>
                    )}

                    {links.instagram && (
                      <a
                        href={links.instagram.startsWith('http') ? links.instagram : `https://${links.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900/60 hover:bg-pink-500/10 hover:border-pink-500/40 border border-slate-200/60 dark:border-slate-800 transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <InstagramIcon className="w-4 h-4 text-pink-500 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-pink-500 truncate">
                            Instagram
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-500 shrink-0" />
                      </a>
                    )}

                    {links.custom_links &&
                      links.custom_links.map((cl, idx) => {
                        if (!cl.url) return null;
                        const url = cl.url.startsWith('http') ? cl.url : `https://${cl.url}`;
                        return (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900/60 hover:bg-brand-500/10 hover:border-brand-500/40 border border-slate-200/60 dark:border-slate-800 transition group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ExternalLink className="w-4 h-4 text-brand-500 shrink-0" />
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-500 truncate">
                                {cl.name || 'External Link'}
                              </span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 shrink-0" />
                          </a>
                        );
                      })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 2: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Club Learning Library
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isMember || isAdmin
                  ? 'You have active member access. All materials can be downloaded for free.'
                  : 'Materials are free for approved members. Apply to join the club to access downloads.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(userRole === 'owner' || userRole === 'manager' || isAdmin) && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md transition-all flex-shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ Upload PDF Resource</span>
                </button>
              )}
              {!isMember && !isAdmin && (
                <button
                  onClick={handleOpenApplyModal}
                  className="px-5 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold shadow hover:bg-brand-600"
                >
                  Apply for Member Access
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {resources.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  No resources uploaded yet for this club
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {(userRole === 'owner' || userRole === 'manager' || isAdmin)
                    ? 'As a club lead, you can publish study guides, lecture slides, and notes for your members.'
                    : 'Check back soon once club leads upload lecture notes and study materials.'}
                </p>
                {(userRole === 'owner' || userRole === 'manager' || isAdmin) && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold shadow-sm hover:bg-brand-600 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload First PDF</span>
                  </button>
                )}
              </div>
            ) : (
              resources.map((res) => (
                <ResourceCard key={res.id} resource={res} isMember={isMember} />
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Scheduled Club Events ({events.length})
            </h3>
            <span className="text-xs text-slate-400">
              Published by club owners & coordinators
            </span>
          </div>

          {events.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                No events currently scheduled
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                The club owners haven't scheduled any upcoming workshops or hackathons yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="glass-panel rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col justify-between hover:shadow-xl transition-all group"
                >
                  {evt.banner_url && (
                    <div className="h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={evt.banner_url}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                          {evt.type || 'Event'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {evt.date}
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                        {evt.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span>{evt.time || 'TBA'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span>{evt.location || 'Campus'}</span>
                      </div>

                      {evt.registration_url && (
                        <a
                          href={evt.registration_url.startsWith('http') ? evt.registration_url : `https://${evt.registration_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow transition-all"
                        >
                          <span>Register / Attend Event</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ANNOUNCEMENTS (LATEST 10 WITH BROADCAST DETAILS) */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brand-500" />
                <span>Club Broadcasts & Announcements</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Showing the latest updates and alerts from club leadership (max 10 retained).
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800">
              {announcements.length} Active
            </span>
          </div>

          {announcements.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
                <Megaphone className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                No announcements yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Whenever the club owner or coordinators broadcast important news or schedule changes, they will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.slice(0, 10).map((ann, idx) => (
                <div
                  key={ann.id || idx}
                  className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 space-y-2 hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shrink-0" />
                      <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                        {ann.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ann.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1 whitespace-pre-line">
                    {ann.content}
                  </p>

                  <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      {ann.author_name || club.club_head_name || 'Club Lead'}
                    </span>
                    <span>• Official Broadcast</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MEMBERS */}
      {activeTab === 'members' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Active Members ({members.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-sm">
                  {m.user?.full_name?.charAt(0) || 'M'}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">
                    {m.user?.full_name}
                  </div>
                  <div className="text-[11px] text-slate-400 capitalize">
                    {m.membership_role} • Active
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: GALLERY (STRICTLY OWNER UPLOADED, MAX 10, NO DEFAULT PHOTOS) */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-500" />
                <span>Club Photo Gallery</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official moments and activities captured and shared by the club owner.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800">
              {(club.gallery || []).length} / 10 Photos
            </span>
          </div>

          {(!club.gallery || club.gallery.length === 0) ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                No photos in gallery yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                The club owner hasn't uploaded any photos to this club's gallery yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {club.gallery.map((photo, i) => (
                <div
                  key={photo.id || i}
                  className="group relative rounded-2xl overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 aspect-video flex flex-col justify-end"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || `Gallery photo ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {photo.caption && (
                    <div className="relative z-10 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <p className="text-xs text-white font-medium truncate">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Membership Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="glass-panel max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-6 my-8">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                    Apply to Join {club.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your application will be submitted for review by the club head ({club.club_head_name || 'Club Lead'}).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              
              {/* Field 1: Member Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-500" />
                  <span>Applicant / Member Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              {/* Field 2 & 3: Email & Phone Number Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-500" />
                    <span>Member Email *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand-500" />
                    <span>Phone / WhatsApp No. *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    For interview & club WhatsApp updates.
                  </p>
                </div>
              </div>

              {/* Field 4: Reason for Joining */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-500" />
                  <span>Reason for Joining *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Tell us why you want to join this club and what projects or activities you are excited to contribute to..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
              </div>

              {/* Field 5: Relevant Skills or Interests */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Interests or Skills</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Optional</span>
                </div>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. C++, Web Dev, Graphic Design, Event Management, Robotics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 mr-1">Suggestions:</span>
                  {[
                    'Coding & Web',
                    'UI/UX Design',
                    'Event Management',
                    'Content & PR',
                    'Robotics/IoT',
                    'Video Editing',
                    'Public Speaking',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        const current = skills.trim();
                        if (!current) {
                          setSkills(sug);
                        } else if (!current.toLowerCase().includes(sug.toLowerCase())) {
                          setSkills(`${current}, ${sug}`);
                        }
                      }}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-800 dark:hover:bg-brand-950/40 dark:hover:text-brand-300 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700 transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isSubmittingApp}
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApp}
                  className="px-6 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-semibold shadow hover:bg-brand-600 disabled:opacity-60 flex items-center gap-2 transition-all"
                >
                  {isSubmittingApp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Resource Modal for Club Leads */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleUploadResource} className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-500" />
                <span>Upload PDF to {club?.name}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload session notes, assignments, guides, and project documentation for approved club members.
              </p>
            </div>

            {/* Document File Selector & Dropzone */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Choose Document (PDF, Word, Slides) *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-brand-500 bg-slate-50/50 dark:bg-navy-900/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to publish
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setFileDataUrl('');
                        setUploadFileName('');
                      }}
                      className="text-[11px] text-rose-500 hover:underline pt-1 block mx-auto"
                    >
                      Remove and pick another file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-2">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 mx-auto flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Click to choose or drop your PDF document here
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Supports PDF, DOCX, PPTX up to 25 MB
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Title *</label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Advanced ROS 2 Navigation Guide"
                className="w-full px-3.5 py-2 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Notes">Notes</option>
                <option value="Projects">Projects</option>
                <option value="Guides">Guides</option>
                <option value="Papers">Papers</option>
                <option value="Media">Media</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={2}
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                placeholder="Brief summary of what this document covers..."
                className="w-full px-3.5 py-2 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingFile}
                className="px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingFile ? 'Uploading...' : 'Publish to Club Library'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
