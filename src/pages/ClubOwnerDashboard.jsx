import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clubService } from '../services/clubService';
import { membershipService } from '../services/membershipService';
import { resourceService } from '../services/resourceService';
import { announcementService } from '../services/announcementService';
import { cloudinaryService } from '../services/cloudinaryService';
import { storageEngine } from '../services/storageEngine';
import { invitationService } from '../services/invitationService';
import { eventService } from '../services/eventService';
import {
  Calendar,
  Megaphone,
  MessageCircle,
  Send,
  AlertCircle,
  Briefcase,
  Users,
  FileText,
  Bell,
  Settings,
  Upload,
  Trash2,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  ExternalLink,
  Building,
  MapPin,
  Clock,
  Mail,
  Globe,
  Camera,
  Image as ImageIcon,
  Copy,
  Check,
  AlertTriangle,
  ArrowRightLeft,
  ShieldAlert,
  Sparkles,
  Lock,
  RefreshCw,
  Search,
  UploadCloud,
  FileCheck,
  Phone,
  KeyRound,
  Share2,
  FileSpreadsheet,
  UserCheck,
  Link2,
  UserCog,
  Edit3,
} from 'lucide-react';
import {
  generateInvitationCode,
  encryptInvitationCode,
  LiveCountdown,
} from '../utils/invitationCrypto';
import { LinkedinIcon, GithubIcon, InstagramIcon } from '../components/common/SocialIcons';

export default function ClubOwnerDashboard() {
  const { user, ownedClubs, isAdmin } = useAuth();
  const toast = useToast();

  const [activeClub, setActiveClub] = useState(null);
  const [allUserOwnedClubs, setAllUserOwnedClubs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'members' | 'applications' | 'resources' | 'announcements' | 'events' | 'gallery' | 'invitations' | 'settings'

  const [members, setMembers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resources, setResources] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [clubEvents, setClubEvents] = useState([]);
  const [galleryPhotos, setGalleryPhotos] = useState([]);

  // Event modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState('Workshop');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventRegUrl, setEventRegUrl] = useState('');
  const [eventBannerUrl, setEventBannerUrl] = useState('');
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  // Gallery states
  const [galleryCaption, setGalleryCaption] = useState('');
  const [isUploadingGalleryPhoto, setIsUploadingGalleryPhoto] = useState(false);
  const galleryInputRef = useRef(null);

  // Additional links state
  const [editLinks, setEditLinks] = useState({
    website: '',
    whatsapp: '',
    telegram: '',
    linkedin: '',
    github: '',
    instagram: '',
    custom_links: [],
  });

  // Invitation creation state
  const [invType, setInvType] = useState('public'); // 'public' | 'restricted'
  const [invExpirationHours, setInvExpirationHours] = useState(24);
  const [invCode, setInvCode] = useState('');
  const [invAllowedEmails, setInvAllowedEmails] = useState([]);
  const [manualEmailInput, setManualEmailInput] = useState('');
  const [isGeneratingInv, setIsGeneratingInv] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const csvFileInputRef = useRef(null);

  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Guides');
  const [uploadFileName, setUploadFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileType, setFileType] = useState('PDF');
  const [isDragging, setIsDragging] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const resourceFileInputRef = useRef(null);

  // Announcement modal states
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // Settings form states
  const [editName, setEditName] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('Technology');
  const [editSchedule, setEditSchedule] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editCollegeAffiliation, setEditCollegeAffiliation] = useState('');
  const [editFacultyName, setEditFacultyName] = useState('');
  const [editFacultyEmail, setEditFacultyEmail] = useState('');
  const [editAppsOpen, setEditAppsOpen] = useState(true);
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editLogoPublicId, setEditLogoPublicId] = useState('');
  const [editBannerUrl, setEditBannerUrl] = useState('');
  const [editBannerPublicId, setEditBannerPublicId] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // File input refs
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Transfer Ownership states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferStep, setTransferStep] = useState(1); // 1 = enter phone, 2 = confirmation
  const [transferPhone, setTransferPhone] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferTargetUser, setTransferTargetUser] = useState(null);
  const [transferError, setTransferError] = useState('');
  const [confirmClubName, setConfirmClubName] = useState('');
  const [hasCopiedName, setHasCopiedName] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  // Restricted Invitation Edit Roster modal states
  const [showEditRosterModal, setShowEditRosterModal] = useState(false);
  const [editingInvitation, setEditingInvitation] = useState(null);
  const [editRosterEmails, setEditRosterEmails] = useState([]);
  const [editRosterInput, setEditRosterInput] = useState('');
  const [isSavingRoster, setIsSavingRoster] = useState(false);

  const generateRandomCode = () => {
    return generateInvitationCode();
  };

  const loadData = () => {
    const allClubs = clubService.getClubs(false);

    // Find memberships of current user
    const userMemberships = user ? membershipService.getUserMemberships(user.id) : [];
    const coordinatorClubIds = userMemberships
      .filter((m) => m.membership_role === 'coordinator' || m.membership_role === 'manager' || m.role === 'coordinator')
      .map((m) => m.club_id);

    // Find clubs where user is owner OR coordinator
    let targets = allClubs.filter(
      (c) =>
        c.club_head_id === user?.id ||
        (user?.email && c.club_head_email?.toLowerCase() === user?.email?.toLowerCase()) ||
        ownedClubs.some((oc) => oc.club_id === c.id) ||
        coordinatorClubIds.includes(c.id)
    );

    setAllUserOwnedClubs(targets);

    const current = targets.find((c) => c.id === activeClub?.id) || targets[0] || null;

    if (current) {
      setActiveClub(current);
      setMembers(membershipService.getClubMembers(current.id));
      setApplications(membershipService.getMembershipApplications(current.id));
      setResources(resourceService.getResources({ club_id: current.id }));
      setAnnouncements(announcementService.getAnnouncements(current.id));
      setInvitations(invitationService.getInvitations(current.id));
      setClubEvents(eventService.getEvents(current.id));
      setGalleryPhotos(current.gallery || []);
      if (!invCode) {
        setInvCode(generateInvitationCode());
      }

      setEditName(current.name || '');
      setEditTagline(current.tagline || '');
      setEditDesc(current.description || '');
      setEditCategory(current.category || 'Technology');
      setEditSchedule(current.meeting_schedule || '');
      setEditLocation(current.location || current.meeting_location || '');
      setEditEmail(current.official_email || '');
      setEditWebsite(current.website_url || '');
      setEditCollegeAffiliation(current.college_affiliation || '');
      setEditFacultyName(current.faculty_mentor_name || '');
      setEditFacultyEmail(current.faculty_mentor_email || '');
      setEditAppsOpen(current.applications_open !== false);
      setEditLogoUrl(current.logo_url || '');
      setEditLogoPublicId(current.logo_public_id || '');
      setEditBannerUrl(current.banner_url || '');
      setEditBannerPublicId(current.banner_public_id || '');
      setEditLinks(current.social_links || {
        website: current.website_url || '',
        whatsapp: '',
        telegram: '',
        linkedin: '',
        github: '',
        instagram: '',
        custom_links: [],
      });
    } else {
      setActiveClub(null);
    }
  };

  useEffect(() => {
    setIsInitialLoading(true);
    storageEngine.syncWithMongoDB().then(() => {
      loadData();
      setIsInitialLoading(false);
    }).catch(() => {
      loadData();
      setIsInitialLoading(false);
    });
    loadData();

    const pollInterval = setInterval(() => {
      storageEngine.syncWithMongoDB().then(loadData).catch(() => {});
    }, 5000);

    window.addEventListener('cc_storage_changed', loadData);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('cc_storage_changed', loadData);
    };
  }, [user]);

  if (isInitialLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center gap-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-3xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 shadow-lg shadow-brand-500/10">
          <RefreshCw className="w-7 h-7 animate-spin" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-bold text-base text-slate-800 dark:text-white">
            Loading Club Management Portal
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Synchronizing club data, resources, and permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!activeClub) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center animate-in fade-in space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20 shadow-lg">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-display font-extrabold text-slate-800 dark:text-white">
          Club Owner Access Only
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          This Club Dashboard is strictly reserved for verified Club Owners. You currently do not own any active club.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Go to Platform Admin Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                to="/apply-club"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Register a New Club</span>
              </Link>
              <Link
                to="/account"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
              >
                <span>My Student Dashboard</span>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const isSuspended = activeClub.status === 'suspended';

  const isActualClubOwner =
    activeClub &&
    (activeClub.club_head_id === user?.id ||
      (user?.email && activeClub.club_head_email?.toLowerCase() === user?.email?.toLowerCase()) ||
      ownedClubs.some((oc) => oc.club_id === activeClub.id && (oc.membership_role === 'owner' || oc.role === 'owner')));

  const isClubCoordinator =
    !isActualClubOwner &&
    user &&
    activeClub &&
    (membershipService.getUserRoleInClub(user.id, activeClub.id) === 'coordinator' ||
     membershipService.getUserRoleInClub(user.id, activeClub.id) === 'manager');

  const coordinators = members.filter(
    (m) => m.membership_role === 'coordinator' || m.role === 'coordinator' || m.membership_role === 'manager'
  );
  const coordinatorsCount = coordinators.length;

  // Handle member promote / demote (Max 4 Club Coordinators)
  const handleRoleChange = (memberId, currentRole) => {
    if (!isActualClubOwner) {
      toast.error('Only the Club Owner can change member roles.');
      return;
    }
    const isCurrentlyCoord = currentRole === 'coordinator' || currentRole === 'manager';
    const nextRole = isCurrentlyCoord ? 'member' : 'coordinator';

    if (nextRole === 'coordinator' && coordinatorsCount >= 4) {
      toast.error('Maximum 4 Club Coordinators are allowed for this club.');
      return;
    }

    try {
      membershipService.updateMemberRole(activeClub.id, memberId, nextRole, user.id);
      toast.success(
        `Member role updated to ${nextRole === 'coordinator' ? 'Club Coordinator' : 'Member'}!`
      );
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Remove a club member (Owner cannot be removed)
  const handleRemoveMember = async (memberUserId) => {
    if (!isActualClubOwner) {
      toast.error('Only the Club Owner can remove members.');
      return;
    }
    const isOwnerTarget =
      memberUserId === activeClub?.club_head_id ||
      memberUserId === activeClub?.owner_id ||
      members.some(
        (m) =>
          (m.user_id === memberUserId || m.id === memberUserId) &&
          (m.membership_role === 'owner' || m.role === 'owner')
      );

    if (isOwnerTarget) {
      toast.error('The Club Owner cannot be removed from the club.');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this member from the club?')) {
      return;
    }

    try {
      await membershipService.removeMember(activeClub.id, memberUserId);
      toast.success('Member removed from club successfully.');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to remove member.');
    }
  };

  // Direct ownership transfer to coordinator or member
  const handleTransferToCoordinator = (memberRecord) => {
    if (isSuspended) {
      toast.error('Cannot transfer ownership of a suspended club.');
      return;
    }
    const targetId = memberRecord.user_id || memberRecord.user?.id || memberRecord.id;
    const targetUserObj = (user && user.id === targetId) ? user : (storageEngine.getUserById(targetId) || memberRecord.user || {});
    const target = {
      id: targetId,
      full_name: targetUserObj.full_name || memberRecord.user?.full_name || memberRecord.user_name || 'Coordinator',
      email: targetUserObj.email || memberRecord.user?.email || memberRecord.user_email || '',
      phone: targetUserObj.phone || memberRecord.user?.phone || memberRecord.user_phone || '',
      avatar_url: targetUserObj.avatar_url || memberRecord.user?.avatar_url || '',
    };
    storageEngine.updateProfile(target.id, target);
    setTransferTargetUser(target);
    setTransferStep(2);
    setConfirmClubName('');
    setHasCopiedName(false);
    setShowTransferModal(true);
  };

  // Toggle coordinator invitation creation permissions
  const handleToggleCoordinatorInvite = (checked) => {
    if (!isActualClubOwner) return;
    try {
      clubService.updateClub(activeClub.id, { allow_coordinators_invitation: checked });
      setActiveClub((prev) => ({ ...prev, allow_coordinators_invitation: checked }));
      toast.success(
        `Coordinators are ${checked ? 'now permitted' : 'no longer permitted'} to generate invitation links.`
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  // CSV Roster upload for Special Restricted Invitations
  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const cleanList = Array.from(new Set(emailMatches.map((em) => em.toLowerCase().trim())));
      if (cleanList.length === 0) {
        toast.error('No valid email addresses found in the uploaded file.');
        return;
      }
      setInvAllowedEmails((prev) => Array.from(new Set([...prev, ...cleanList])));
      toast.success(`Imported ${cleanList.length} email(s) into invite roster!`);
      if (csvFileInputRef.current) csvFileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Manual email addition
  const handleAddManualEmails = () => {
    if (!manualEmailInput.trim()) return;
    const emailMatches = manualEmailInput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    if (emailMatches.length === 0) {
      toast.error('Please enter valid email addresses.');
      return;
    }
    const cleanList = emailMatches.map((em) => em.toLowerCase().trim());
    setInvAllowedEmails((prev) => Array.from(new Set([...prev, ...cleanList])));
    setManualEmailInput('');
    toast.success(`Added ${cleanList.length} email(s) to roster!`);
  };

  const handleRemoveAllowedEmail = (emailToRemove) => {
    setInvAllowedEmails((prev) => prev.filter((em) => em !== emailToRemove));
  };

  // Generate Invitation Code & Link
  const handleCreateInvitation = async (e) => {
    e.preventDefault();
    if (isSuspended) {
      toast.error('Cannot create invitations for a suspended club.');
      return;
    }

    if (isClubCoordinator && !activeClub.allow_coordinators_invitation) {
      toast.error('The Club Owner has not enabled coordinator invitations for this club.');
      return;
    }

    const cleanCode = (invCode.trim() || generateRandomCode()).toUpperCase();
    if (invType === 'restricted' && invAllowedEmails.length === 0) {
      toast.error('Please add at least one email address for a Special Restricted invitation.');
      return;
    }

    try {
      setIsGeneratingInv(true);
      const newInv = await invitationService.createInvitation(
        activeClub.id,
        {
          code: cleanCode,
          expiration_hours: invExpirationHours,
          type: invType,
          allowed_emails: invAllowedEmails,
          created_by_role: isActualClubOwner ? 'owner' : 'coordinator',
        },
        user
      );
      toast.success(`🎉 Invitation Code "${newInv.code}" generated successfully!`);
      setInvCode(generateRandomCode());
      setInvAllowedEmails([]);
      setManualEmailInput('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to generate invitation.');
    } finally {
      setIsGeneratingInv(false);
    }
  };

  const handleDeleteInvitation = async (invId) => {
    if (window.confirm('Revoke and delete this invitation immediately?')) {
      try {
        await invitationService.deleteInvitation(invId);
        toast.success('Invitation revoked.');
        loadData();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied plain invitation code "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCopyLink = (invOrCode) => {
    let linkToCopy = '';
    let codeStr = '';
    if (typeof invOrCode === 'object' && invOrCode !== null) {
      codeStr = invOrCode.code;
      linkToCopy = invOrCode.link || `${window.location.origin}/join/${encryptInvitationCode(invOrCode.code)}`;
    } else {
      codeStr = invOrCode;
      linkToCopy = `${window.location.origin}/join/${encryptInvitationCode(invOrCode)}`;
    }
    navigator.clipboard.writeText(linkToCopy);
    setCopiedLink(codeStr);
    toast.success('Permanent invitation link copied to clipboard!');
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Edit Roster for Restricted Invitations
  const handleOpenEditRoster = (inv) => {
    setEditingInvitation(inv);
    setEditRosterEmails(inv.allowed_emails ? JSON.parse(JSON.stringify(inv.allowed_emails)) : []);
    setEditRosterInput('');
    setShowEditRosterModal(true);
  };

  const handleAddEmailToEditRoster = () => {
    if (!editRosterInput.trim()) return;
    const emailMatches = editRosterInput.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    if (emailMatches.length === 0) {
      toast.error('Please enter valid email addresses.');
      return;
    }
    const cleanList = emailMatches.map((em) => em.toLowerCase().trim());
    setEditRosterEmails((prev) => {
      const existing = new Set(prev.map((item) => (typeof item === 'string' ? item.toLowerCase() : item.email.toLowerCase())));
      const newItems = cleanList
        .filter((em) => !existing.has(em))
        .map((em) => ({ email: em, joined: false, user_id: '', user_name: '' }));
      return [...prev, ...newItems];
    });
    setEditRosterInput('');
    toast.success(`Added ${cleanList.length} email(s) to roster!`);
  };

  const handleRemoveEmailFromEditRoster = (emailToRemove) => {
    setEditRosterEmails((prev) =>
      prev.filter((item) => {
        const e = typeof item === 'string' ? item : item.email;
        return e.toLowerCase() !== emailToRemove.toLowerCase();
      })
    );
  };

  const handleSaveEditRoster = async () => {
    if (!editingInvitation) return;
    try {
      setIsSavingRoster(true);
      await invitationService.updateInvitation(editingInvitation.id, {
        allowed_emails: editRosterEmails,
      });
      toast.success('Restricted invitation email roster updated successfully!');
      setShowEditRosterModal(false);
      setEditingInvitation(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update invitation roster.');
    } finally {
      setIsSavingRoster(false);
    }
  };

  // Handle application review
  const handleReviewApp = (appId, action) => {
    try {
      membershipService.reviewMembershipApplication(appId, action, user);
      toast.success(`Application ${action === 'approve' ? 'approved' : 'rejected'}!`);
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResourceFile = (file) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds 50 MB limit.');
      return;
    }
    setSelectedFile(file);
    setUploadFileName(file.name);
    setFileSize(file.size);

    const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
    setFileType(ext);

    if (!uploadTitle.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setUploadTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileDataUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle resource upload
  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      toast.error('Please enter a title for the resource.');
      return;
    }
    setIsPublishing(true);
    try {
      resourceService.createResource(
        {
          club_id: activeClub.id,
          title: uploadTitle.trim(),
          description: uploadDesc.trim(),
          category: uploadCategory,
          file_type: fileType || 'PDF',
          file_name: uploadFileName || selectedFile?.name || `${uploadTitle.replace(/\s+/g, '_')}.pdf`,
          file_size_bytes: fileSize || 3500000,
          file_url: fileDataUrl || null,
          file_data: fileDataUrl || null,
          color_accent: 'blue',
        },
        user
      );
      toast.success('Resource file uploaded and published to club library!');
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      setUploadFileName('');
      setSelectedFile(null);
      setFileDataUrl('');
      setFileSize(0);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle resource delete
  const handleDeleteResource = (resId) => {
    if (window.confirm('Delete this resource permanently?')) {
      try {
        resourceService.deleteResource(resId, activeClub.id, user);
        toast.success('Resource deleted.');
        loadData();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  // Handle announcement create
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
      toast.success('Announcement broadcasted!');
      setShowAnnModal(false);
      setAnnTitle('');
      setAnnContent('');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle announcement delete
  const handleDeleteAnnouncement = (annId) => {
    try {
      announcementService.deleteAnnouncement(annId, activeClub.id, user);
      toast.success('Announcement removed.');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle Logo Upload (Cloudinary with auto-cleanup of previous logo)
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isSuspended) {
      toast.error('Cannot change the logo of a suspended club.');
      return;
    }

    try {
      setIsUploadingLogo(true);
      const res = await cloudinaryService.uploadClubLogo(file, editLogoPublicId);
      setEditLogoUrl(res.url);
      setEditLogoPublicId(res.publicId);
      toast.success('Club logo uploaded! Click Save Settings to persist changes.');
    } catch (err) {
      toast.error(err.message || 'Failed to upload logo.');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  // Handle Banner Upload (Cloudinary with auto-cleanup of previous banner)
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isSuspended) {
      toast.error('Cannot change the banner of a suspended club.');
      return;
    }

    try {
      setIsUploadingBanner(true);
      const res = await cloudinaryService.uploadClubBanner(file, editBannerPublicId);
      setEditBannerUrl(res.url);
      setEditBannerPublicId(res.publicId);
      toast.success('Club banner uploaded! Click Save Settings to persist changes.');
    } catch (err) {
      toast.error(err.message || 'Failed to upload banner.');
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  // Handle Settings Save
  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (isSuspended) {
      toast.error('This club is suspended. Club settings cannot be edited.');
      return;
    }

    try {
      setIsSavingSettings(true);
      clubService.updateClub(activeClub.id, {
        name: editName,
        tagline: editTagline,
        category: editCategory,
        description: editDesc,
        meeting_schedule: editSchedule,
        location: editLocation,
        meeting_location: editLocation,
        official_email: editEmail,
        website_url: editLinks.website || editWebsite,
        social_links: editLinks,
        college_affiliation: editCollegeAffiliation,
        faculty_mentor_name: editFacultyName,
        faculty_mentor_email: editFacultyEmail,
        applications_open: editAppsOpen,
        logo_url: editLogoUrl,
        logo_public_id: editLogoPublicId,
        banner_url: editBannerUrl,
        banner_public_id: editBannerPublicId,
      });
      toast.success('Club settings and information saved successfully!');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // --- Event Handlers ---
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      toast.error('Please enter an event title.');
      return;
    }
    if (!eventDate || !eventTime) {
      toast.error('Please provide event date and time.');
      return;
    }
    setIsSavingEvent(true);
    try {
      await eventService.createEvent(
        {
          club_id: activeClub.id,
          club_name: activeClub.name,
          title: eventTitle.trim(),
          type: eventType,
          date: eventDate,
          time: eventTime,
          location: eventLocation.trim() || 'Campus Venue',
          description: eventDesc.trim(),
          registration_url: eventRegUrl.trim(),
          banner_url: eventBannerUrl.trim(),
        },
        user
      );
      toast.success('Event published! It is now live on the Club Page and Universal Events Page.');
      setShowEventModal(false);
      setEventTitle('');
      setEventDate('');
      setEventTime('');
      setEventLocation('');
      setEventDesc('');
      setEventRegUrl('');
      setEventBannerUrl('');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to create event');
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event? It will be removed from all campus listings.')) return;
    try {
      await eventService.deleteEvent(eventId);
      toast.success('Event deleted.');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete event');
    }
  };

  // --- Gallery Handlers (Max 10 Photos) ---
  const handleGalleryPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentPhotos = activeClub.gallery || [];
    if (currentPhotos.length >= 10) {
      toast.error('Maximum 10 photos limit reached! Please delete an older photo first.');
      return;
    }

    try {
      setIsUploadingGalleryPhoto(true);
      const res = await cloudinaryService.uploadClubLogo(file);
      const newPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        url: res.url,
        public_id: res.publicId || '',
        caption: galleryCaption.trim() || 'Club Moment',
        uploaded_at: new Date().toISOString(),
      };
      const updatedGallery = [...currentPhotos, newPhoto];
      await clubService.updateClub(activeClub.id, { gallery: updatedGallery });
      setGalleryPhotos(updatedGallery);
      setGalleryCaption('');
      toast.success(`Photo uploaded to club gallery! (${updatedGallery.length}/10)`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to upload photo to gallery.');
    } finally {
      setIsUploadingGalleryPhoto(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleDeleteGalleryPhoto = async (photoId) => {
    if (!window.confirm('Delete this photo from the club gallery?')) return;
    try {
      const currentPhotos = activeClub.gallery || [];
      const updatedGallery = currentPhotos.filter((p) => p.id !== photoId);
      await clubService.updateClub(activeClub.id, { gallery: updatedGallery });
      setGalleryPhotos(updatedGallery);
      toast.success('Photo removed from club gallery.');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete photo.');
    }
  };

  // --- Transfer Ownership Flow ---
  const handleOpenTransferModal = () => {
    if (isSuspended) {
      toast.error('Cannot transfer ownership while the club is suspended.');
      return;
    }
    setTransferPhone('');
    setTransferError('');
    setTransferTargetUser(null);
    setTransferStep(1);
    setConfirmClubName('');
    setHasCopiedName(false);
    setShowTransferModal(true);
  };

  const handleVerifyMobile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setTransferError('');

    const cleanInput = transferPhone.trim();
    if (!cleanInput) {
      setTransferError('Please enter a valid mobile number or email address.');
      return;
    }

    try {
      setTransferLoading(true);
      const target = await clubService.findUser(cleanInput);

      if (!target) {
        setTransferError(`No account found with "${cleanInput}". Please ensure the recipient has registered on StudyMyte first.`);
        setTransferTargetUser(null);
        return;
      }

      if (target.id === user?.id || (user?.email && target.email?.toLowerCase() === user?.email?.toLowerCase())) {
        setTransferError('You are already the owner of this club. Please enter the details of another member.');
        setTransferTargetUser(null);
        return;
      }

      // User exists! Save to local profiles cache and advance to Step 2
      storageEngine.updateProfile(target.id, target);
      setTransferTargetUser(target);
      setTransferStep(2);
    } catch (err) {
      setTransferError(err.message || 'Error searching user.');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleCopyClubName = () => {
    if (!activeClub?.name) return;
    navigator.clipboard.writeText(activeClub.name);
    setHasCopiedName(true);
    toast.success('Club name copied to clipboard!');
    setTimeout(() => setHasCopiedName(false), 3000);
  };

  const handleExecuteTransfer = async () => {
    if (confirmClubName.trim().toLowerCase() !== activeClub.name.trim().toLowerCase()) {
      toast.error('The typed club name does not match.');
      return;
    }

    try {
      setIsTransferring(true);
      await clubService.transferOwnership(activeClub.id, transferTargetUser.id, user.id, transferTargetUser);
      toast.success(`🎉 Ownership of "${activeClub.name}" transferred to ${transferTargetUser.full_name}!`);
      setShowTransferModal(false);
      loadData();
      window.dispatchEvent(new CustomEvent('cc_auth_changed', { detail: { user } }));
      window.dispatchEvent(new CustomEvent('cc_storage_changed', { detail: { key: 'cc_clubs_v1' } }));
    } catch (err) {
      toast.error(err.message || 'Failed to transfer ownership');
    } finally {
      setIsTransferring(false);
    }
  };

  const pendingApps = applications.filter((a) => a.status === 'pending');
  const managersCount = members.filter((m) => m.membership_role === 'manager').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Club Suspension Notice Banner */}
      {isSuspended && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-800 dark:text-amber-300 animate-in fade-in">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <span>Club Suspended & Unlisted</span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300">
                Action Blocked
              </span>
            </h4>
            <p className="text-xs leading-relaxed text-amber-800/80 dark:text-amber-300/80">
              This club is currently suspended by campus administrators and has been unlisted from the public club section.
              The club owner cannot edit any settings, upload branding, or transfer ownership until the suspension is resolved.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold uppercase flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{isActualClubOwner ? 'Club Owner Workspace' : 'Club Coordinator Workspace'}</span>
            </span>

            {isSuspended && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold uppercase flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Suspended</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
              {activeClub.name}
            </h1>
            {allUserOwnedClubs.length > 1 && (
              <select
                value={activeClub.id}
                onChange={(e) => {
                  const sel = allUserOwnedClubs.find((c) => c.id === e.target.value);
                  if (sel) setActiveClub(sel);
                }}
                className="text-xs px-2.5 py-1 rounded-lg glass-panel border border-slate-300 dark:border-slate-700 font-semibold"
              >
                {allUserOwnedClubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your club members, review membership applications, generate invitations, and customize your club space.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to={`/clubs/${activeClub.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-500"
          >
            <span>Public Club Space</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Resource</span>
          </button>

          {isActualClubOwner && (
            <button
              onClick={handleOpenTransferModal}
              disabled={isSuspended}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isSuspended
                  ? 'border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                  : 'border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer Ownership</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px no-scrollbar scroll-smooth">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'members', label: `Members (${members.length})` },
          { id: 'applications', label: `Applications (${pendingApps.length})` },
          { id: 'resources', label: `Resources (${resources.length})` },
          { id: 'announcements', label: `Announcements (${announcements.length})` },
          { id: 'events', label: `Events (${clubEvents.length})` },
          { id: 'gallery', label: `Gallery (${galleryPhotos.length}/10)` },
          { id: 'invitations', label: `Invitations (${invitations.length})` },
          { id: 'settings', label: isActualClubOwner ? 'Club Settings' : 'Club Settings (Locked)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-brand-500 dark:text-brand-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Members</span>
              <div className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
                {members.length}
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Pending Applicants</span>
              <div className="font-display font-extrabold text-2xl text-amber-500">
                {pendingApps.length}
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Resources</span>
              <div className="font-display font-extrabold text-2xl text-brand-500">
                {resources.length}
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold">Managers</span>
              <div className="font-display font-extrabold text-2xl text-teal-500">
                {managersCount}
              </div>
            </div>
          </div>

          {/* Quick Applications Review Box */}
          {pendingApps.length > 0 && (
            <div className="glass-panel rounded-3xl p-6 border border-amber-200 dark:border-amber-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Applicants Awaiting Your Approval ({pendingApps.length})
                </h3>
                <button
                  onClick={() => setActiveTab('applications')}
                  className="text-xs text-brand-500 font-semibold hover:underline"
                >
                  Manage All →
                </button>
              </div>

              <div className="space-y-3">
                {pendingApps.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {app.user_name}
                        </span>
                        <a
                          href={`mailto:${app.user_email}`}
                          className="text-xs text-brand-600 hover:underline dark:text-brand-400"
                        >
                          {app.user_email}
                        </a>
                        {app.user_phone && (
                          <a
                            href={`tel:${app.user_phone}`}
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline dark:text-emerald-400 font-medium"
                          >
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
                        className="px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-sm"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEMBERS */}
      {activeTab === 'members' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Club Roster ({members.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage club members and assign up to 4 Club Coordinators.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Coordinators: {coordinatorsCount}/4</span>
              </span>
            </div>
          </div>

          <div className="table-responsive -mx-6 px-6 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Member</th>
                  <th className="pb-3 font-semibold">Contact Info</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Joined Date</th>
                  <th className="pb-3 font-semibold">Join Source</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m) => {
                  const isOwner =
                    m.membership_role === 'owner' ||
                    m.role === 'owner' ||
                    m.user_id === activeClub?.club_head_id ||
                    m.user_id === activeClub?.owner_id ||
                    (activeClub?.club_head_email && m.user?.email && activeClub.club_head_email.toLowerCase() === m.user.email.toLowerCase());

                  const isCoord =
                    !isOwner &&
                    (m.membership_role === 'coordinator' || m.membership_role === 'manager' || m.role === 'coordinator' || m.role === 'manager');

                  const joinedDateStr = m.joined_at || m.approved_at || m.created_at;
                  const formattedDate = joinedDateStr
                    ? new Date(joinedDateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Active Member';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-900/30">
                      <td className="py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-1 shrink-0 ${
                          isOwner
                            ? 'bg-amber-500/10 text-amber-600 ring-amber-500/40'
                            : isCoord
                            ? 'bg-indigo-500/10 text-indigo-600 ring-indigo-500/40'
                            : 'bg-brand-500/10 text-brand-500 ring-brand-500/30'
                        }`}>
                          {m.user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold block truncate">{m.user?.full_name || 'Member'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {m.user_id?.slice(-8) || m.id?.slice(-8)}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="space-y-0.5">
                          {m.user?.email && (
                            <a
                              href={`mailto:${m.user.email}`}
                              className="text-xs text-brand-600 hover:underline dark:text-brand-400 flex items-center gap-1"
                            >
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate">{m.user.email}</span>
                            </a>
                          )}
                          {(m.user?.phone || m.phone) && (
                            <a
                              href={`tel:${m.user?.phone || m.phone}`}
                              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                            >
                              <Phone className="w-3 h-3 shrink-0" />
                              <span>{m.user?.phone || m.phone}</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        {isOwner ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1 shadow-sm">
                            👑 Club Owner
                          </span>
                        ) : isCoord ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>Coordinator</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            Member
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-slate-500 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formattedDate}</span>
                        </span>
                      </td>
                      <td className="py-4 text-slate-400 capitalize text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                          {isOwner ? 'Club Founder' : (m.join_source || 'direct member')}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2 whitespace-nowrap">
                        {isOwner ? (
                          <span className="text-slate-400 dark:text-slate-500 font-semibold text-xs italic px-2 py-1">
                            Club Head (Primary)
                          </span>
                        ) : isActualClubOwner ? (
                          <>
                            {isCoord ? (
                              <button
                                type="button"
                                onClick={() => handleRoleChange(m.user_id, m.membership_role || m.role)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:text-brand-500 text-[11px] font-semibold transition"
                              >
                                Demote to Member
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRoleChange(m.user_id, m.membership_role || m.role)}
                                disabled={coordinatorsCount >= 4}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                                  coordinatorsCount >= 4
                                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 cursor-not-allowed'
                                    : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 hover:bg-indigo-100'
                                }`}
                                title={coordinatorsCount >= 4 ? 'Maximum 4 Coordinators reached' : 'Promote to Club Coordinator'}
                              >
                                {coordinatorsCount >= 4 ? 'Max Coordinators (4/4)' : '+ Make Coordinator'}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveMember(m.user_id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-[11px] font-semibold transition"
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">View Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            Membership Applications ({applications.length})
          </h3>

          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                      {app.user_name}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        app.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <a
                      href={`mailto:${app.user_email}`}
                      className="inline-flex items-center gap-1.5 hover:text-brand-500 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.user_email}</span>
                    </a>
                    {app.user_phone && (
                      <>
                        <a
                          href={`tel:${app.user_phone}`}
                          className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{app.user_phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/${app.user_phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold hover:bg-emerald-500/20"
                        >
                          WhatsApp
                        </a>
                      </>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Reason for Joining:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 italic">
                      "{app.statement_of_interest}"
                    </p>
                  </div>

                  {app.skills && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-medium text-slate-500">Skills / Interests:</span>
                      {app.skills.split(',').map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300 border border-brand-100 dark:border-brand-900/50"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {app.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReviewApp(app.id, 'reject')}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleReviewApp(app.id, 'approve')}
                      className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow"
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

      {/* TAB 4: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Published Resources ({resources.length})
            </h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold shadow"
            >
              + Upload Resource
            </button>
          </div>

          <div className="space-y-3">
            {resources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    {res.title}
                  </h4>
                  <div className="text-xs text-slate-400">
                    {res.category} • {res.file_name} • {(res.file_size_bytes / 1000000).toFixed(1)} MB
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteResource(res.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Delete resource"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Announcements ({announcements.length})
            </h3>
            <button
              onClick={() => setShowAnnModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold shadow"
            >
              + Broadcast Announcement
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{ann.content}</p>
                  <span className="text-[11px] text-slate-400">
                    Posted on {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: EVENTS */}
      {activeTab === 'events' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-500" />
                <span>Club Events & Activities ({clubEvents.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Schedule workshops, hackathons, and webinars. Events appear on your Club Page and the Universal Campus Events calendar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEventModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Schedule Event</span>
            </button>
          </div>

          {clubEvents.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                No events scheduled yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Publish your upcoming workshops, guest lectures, hackathons, or audition rounds here.
              </p>
              <button
                type="button"
                onClick={() => setShowEventModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold shadow-sm hover:bg-brand-600"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule First Event</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                        {evt.type || 'Workshop'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      <span>{evt.date} • {evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                    {evt.registration_url && (
                      <a
                        href={evt.registration_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-brand-500 hover:underline flex items-center gap-1 pt-1 font-semibold"
                      >
                        <span>Registration Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: GALLERY (Max 10 Photos, No default photos) */}
      {activeTab === 'gallery' && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-brand-500" />
                  <span>Club Photo Gallery</span>
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  galleryPhotos.length >= 10
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                }`}>
                  {galleryPhotos.length} / 10 Photos
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Upload up to 10 photos of workshops, competitions, and team memories. If you reach 10 photos, delete an older photo to upload a new one.
              </p>
            </div>
          </div>

          {/* Max 10 Notice */}
          {galleryPhotos.length >= 10 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500" />
              <span>
                <strong>Gallery Full (10/10 photos):</strong> Maximum upload limit reached for this club. To upload a new photo, please delete an older photo below.
              </span>
            </div>
          )}

          {/* Upload Box (Only available if < 10) */}
          {galleryPhotos.length < 10 && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-brand-500" />
                <span>Upload New Gallery Photo ({10 - galleryPhotos.length} slots remaining)</span>
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Optional Photo Caption (e.g. Annual Autonomous Drone Demonstration)"
                  value={galleryCaption}
                  onChange={(e) => setGalleryCaption(e.target.value)}
                  className="w-full sm:flex-1 px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700"
                />

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryPhotoUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isUploadingGalleryPhoto}
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition whitespace-nowrap"
                >
                  {isUploadingGalleryPhoto ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading Photo...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>Choose Photo to Upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Photos Grid */}
          {galleryPhotos.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                No gallery photos uploaded yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Photos you upload here will be featured in the public club gallery.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {galleryPhotos.map((photo, pIdx) => (
                <div
                  key={photo.id || pIdx}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-navy-950 aspect-square shadow-xs"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Club moment'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryPhoto(photo.id)}
                        className="p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 shadow transition"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <p className="text-white text-[11px] font-semibold truncate">
                        {photo.caption || 'Club Photo'}
                      </p>
                      <span className="text-[9px] text-slate-300">
                        {photo.uploaded_at ? new Date(photo.uploaded_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: INVITATIONS */}
      {activeTab === 'invitations' && (
        <div className="space-y-8 max-w-5xl">
          {/* Header & Coordinator Permissions toggle */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-brand-500" />
                  <span>Club Invitations & Link Generator</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Generate instant invite codes and direct join links. Anyone with a valid code or link can join according to your intake conditions.
                </p>
              </div>

              {isActualClubOwner && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/50 dark:bg-navy-950/60 border border-indigo-200 dark:border-indigo-800">
                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                      Coordinator Permissions
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Allow coordinators to generate codes
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleCoordinatorInvite(!activeClub.allow_coordinators_invitation)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      activeClub.allow_coordinators_invitation
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {activeClub.allow_coordinators_invitation ? '✓ Enabled' : 'Disabled'}
                  </button>
                </div>
              )}
            </div>

            {/* Coordinator Access Lock Notice */}
            {isClubCoordinator && !activeClub.allow_coordinators_invitation ? (
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                <Lock className="w-8 h-8 text-amber-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Coordinator Invitation Privileges Disabled
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  The Club Owner has not enabled invitation generation for Club Coordinators in this club. You can still view active invitations below.
                </p>
              </div>
            ) : (
              /* Generator Form */
              <form onSubmit={handleCreateInvitation} className="space-y-6 pt-2">
                {/* 1. Invite Type Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Invitation Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInvType('public')}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        invType === 'public'
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 shadow-md ring-2 ring-brand-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <Share2 className={`w-5 h-5 mt-0.5 ${invType === 'public' ? 'text-brand-500' : 'text-slate-400'}`} />
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                          Standard Public Invite
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Anyone with the link or code can immediately join the club before it expires.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInvType('restricted')}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        invType === 'restricted'
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 shadow-md ring-2 ring-brand-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <UserCheck className={`w-5 h-5 mt-0.5 ${invType === 'restricted' ? 'text-brand-500' : 'text-slate-400'}`} />
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Special Restricted Invite</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-brand-500/10 text-brand-500">
                            Exclusive Roster
                          </span>
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Only invited emails (via CSV or manual table) can join. Others receive invalid code.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Expiration Time Selector (1hr, 5hr, 12hr, 24hr, 48hr, 72hr) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Expiration Time Limit
                    </label>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Auto-deletes from database after expiration</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { hours: 1, label: '1 Hour' },
                      { hours: 5, label: '5 Hours' },
                      { hours: 12, label: '12 Hours' },
                      { hours: 24, label: '24 Hours' },
                      { hours: 48, label: '48 Hours' },
                      { hours: 72, label: '72 Hours' },
                    ].map((opt) => (
                      <button
                        key={opt.hours}
                        type="button"
                        onClick={() => setInvExpirationHours(opt.hours)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all border ${
                          invExpirationHours === opt.hours
                            ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Code & Shareable Link Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Invitation Code
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={invCode}
                        onChange={(e) => setInvCode(e.target.value.toUpperCase())}
                        placeholder="e.g. LGIE8725"
                        className="flex-1 px-3.5 py-2.5 rounded-xl glass-panel text-xs font-mono font-bold tracking-wider uppercase border border-slate-300 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setInvCode(generateRandomCode())}
                        className="px-3 py-2.5 rounded-xl glass-panel text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-500 whitespace-nowrap"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Direct Join Link (Encrypted Token)
                    </label>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                      <Link2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{`${window.location.origin}/join/${encryptInvitationCode(invCode) || 'enc_token'}`}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Special Restricted: CSV Upload & Manual Table */}
                {invType === 'restricted' && (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-brand-500" />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          Restricted Email Roster ({invAllowedEmails.length} staged)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Only these emails can redeem this code
                      </span>
                    </div>

                    {/* Upload CSV or Manual Entry Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          ref={csvFileInputRef}
                          type="file"
                          accept=".csv,.txt"
                          onChange={handleCsvUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => csvFileInputRef.current?.click()}
                          className="w-full py-2.5 px-4 rounded-xl border border-dashed border-brand-400 bg-brand-500/5 hover:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Email CSV / TXT File</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={manualEmailInput}
                          onChange={(e) => setManualEmailInput(e.target.value)}
                          placeholder="student@college.edu or comma-separated"
                          className="flex-1 px-3 py-2 rounded-xl glass-panel text-xs border border-slate-300 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={handleAddManualEmails}
                          className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-brand-500 hover:text-white text-xs font-semibold whitespace-nowrap transition-all"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Staged Emails Table Preview */}
                    {invAllowedEmails.length > 0 && (
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-navy-950 text-slate-500 text-[10px] uppercase font-bold">
                            <tr>
                              <th className="py-2 px-3">#</th>
                              <th className="py-2 px-3">Invited Email</th>
                              <th className="py-2 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {invAllowedEmails.map((em, idx) => (
                              <tr key={idx} className="hover:bg-white dark:hover:bg-navy-900">
                                <td className="py-1.5 px-3 text-slate-400">{idx + 1}</td>
                                <td className="py-1.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                                  {em}
                                </td>
                                <td className="py-1.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAllowedEmail(em)}
                                    className="text-rose-500 hover:text-rose-700 text-[11px] font-semibold"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isGeneratingInv}
                    className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    {isGeneratingInv ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Invitation...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Invitation Code & Link</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ACTIVE INVITATIONS LIST */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Active Club Invitations ({invitations.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live invitation codes and links currently active in your database.
                </p>
              </div>
            </div>

            {invitations.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50/50 dark:bg-navy-900/30 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                <KeyRound className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500">
                  No active invitations for this club yet. Use the generator above to create one.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((inv) => {
                  const encryptedToken = encryptInvitationCode(inv.code);
                  const fullShareLink = (inv.link && !inv.link.includes('undefined')) ? inv.link : `${window.location.origin}/join/${encryptedToken}`;
                  const joinedCount = inv.allowed_emails ? inv.allowed_emails.filter((e) => e.joined).length : 0;
                  const totalAllowed = inv.allowed_emails ? inv.allowed_emails.length : 0;

                  return (
                    <div
                      key={inv.id}
                      className="p-5 sm:p-6 rounded-2xl bg-white/60 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
                    >
                      {/* Top bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-extrabold text-base px-3 py-1 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 tracking-wider">
                            {inv.code}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              inv.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : inv.type === 'restricted'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                            }`}
                          >
                            {inv.status === 'completed'
                              ? 'All Joined (Completed)'
                              : inv.type === 'restricted'
                              ? 'Special Restricted'
                              : 'Public Invite'}
                          </span>
                          <LiveCountdown expiresAt={inv.expires_at} onExpire={loadData} />
                        </div>

                        <div className="flex items-center gap-2">
                          {inv.type === 'restricted' && isActualClubOwner && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditRoster(inv)}
                              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-1.5 border border-purple-200 dark:border-purple-800 transition shadow-xs"
                            >
                              <UserCog className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                              <span>Edit Roster</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCopyCode(inv.code)}
                            className="px-3 py-1.5 rounded-xl glass-panel text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-500 flex items-center gap-1"
                          >
                            {copiedCode === inv.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCode === inv.code ? 'Copied' : 'Copy Code'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyLink(inv)}
                            className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                          >
                            {copiedLink === inv.code ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Share2 className="w-3.5 h-3.5" />}
                            <span>{copiedLink === inv.code ? 'Link Copied!' : 'Copy Link'}</span>
                          </button>

                          {isActualClubOwner && (
                            <button
                              type="button"
                              onClick={() => handleDeleteInvitation(inv.id)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Revoke / Delete Invitation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Share link snippet */}
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 dark:bg-navy-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
                        <Link2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                        <span className="truncate">{fullShareLink}</span>
                      </div>

                      {/* Interactive Roster Table for Restricted Invites */}
                      {inv.type === 'restricted' && inv.allowed_emails && inv.allowed_emails.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                Exclusive Roster Status ({joinedCount} / {totalAllowed} Joined)
                              </span>
                              {isActualClubOwner && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditRoster(inv)}
                                  className="px-2 py-0.5 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[11px] font-semibold flex items-center gap-1 transition"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit Emails</span>
                                </button>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Auto-expires when all join • 24hr purge after deletion
                            </span>
                          </div>

                          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 dark:bg-navy-950 text-slate-500 text-[10px] uppercase font-bold">
                                <tr>
                                  <th className="py-2 px-3">#</th>
                                  <th className="py-2 px-3">Invited Email</th>
                                  <th className="py-2 px-3">Joined Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {inv.allowed_emails.map((slot, sIdx) => (
                                  <tr key={sIdx} className="hover:bg-white dark:hover:bg-navy-900">
                                    <td className="py-2 px-3 text-slate-400">{sIdx + 1}</td>
                                    <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                                      {slot.email}
                                    </td>
                                    <td className="py-2 px-3">
                                      {slot.joined ? (
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs inline-flex items-center gap-1.5 border border-emerald-500/20">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>Joined {slot.user_name ? `(${slot.user_name})` : ''}</span>
                                        </span>
                                      ) : (
                                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs inline-flex items-center gap-1.5 border border-amber-500/20">
                                          <Clock className="w-3.5 h-3.5" />
                                          <span>Pending (Not Joined Yet)</span>
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === 'settings' && (
        !isActualClubOwner ? (
          <div className="glass-panel rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Owner-Only Settings
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                Only the official Club Owner who owns <strong>{activeClub.name}</strong> has permission to edit club details, change branding, and toggle joining applications intake.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 inline-block">
              Your Role: <span className="font-bold text-indigo-600 dark:text-indigo-400">Club Coordinator</span> (Operational Access: Members, Applications, Resources, Invitations)
            </div>
          </div>
        ) : (
        <div className="space-y-8 max-w-4xl">
          {/* Suspended Lock Alert */}
          {isSuspended && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
              <Lock className="w-5 h-5 flex-shrink-0 text-amber-500" />
              <span>
                <strong>Settings Locked:</strong> This club is suspended by campus administration and unlisted from the public directory.
                All settings edits, logo/banner uploads, and ownership transfers are disabled.
              </span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-brand-500" />
                  <span>Club Profile & Settings</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your club branding, schedule, location, and registration settings.
                </p>
              </div>

              {isSuspended ? (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Suspended</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Active & Listed</span>
                </span>
              )}
            </div>

            {/* SECTION 1: VISUAL BRANDING (LOGO & BANNER) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visual Branding (Cloudinary Cloud Storage)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Logo Uploader */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Club Logo
                  </label>
                  <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
                    {editLogoUrl ? (
                      <img
                        src={editLogoUrl}
                        alt="Club Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building className="w-10 h-10 text-slate-400" />
                    )}

                    <button
                      type="button"
                      disabled={isSuspended || isUploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-semibold gap-1 disabled:opacity-0"
                    >
                      {isUploadingLogo ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          <span>Change Logo</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={isSuspended || isUploadingLogo}
                  />
                  <p className="text-[11px] text-slate-400">
                    Square PNG, JPG, or WEBP (up to 8 MB). Auto-deletes old logo.
                  </p>
                </div>

                {/* Banner Uploader */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Club Header Banner
                  </label>
                  <div className="relative group w-full h-32 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
                    {editBannerUrl ? (
                      <img
                        src={editBannerUrl}
                        alt="Club Banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-slate-400" />
                    )}

                    <button
                      type="button"
                      disabled={isSuspended || isUploadingBanner}
                      onClick={() => bannerInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1.5 disabled:opacity-0"
                    >
                      {isUploadingBanner ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Uploading Banner...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-5 h-5" />
                          <span>Upload / Change Banner</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                    disabled={isSuspended || isUploadingBanner}
                  />
                  <p className="text-[11px] text-slate-400">
                    Wide 16:9 banner displayed on public club space. Auto-deletes old banner.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 2: CLUB DETAILS */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Core Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Club Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSuspended}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    disabled={isSuspended}
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Arts & Culture">Arts & Culture</option>
                    <option value="Academic">Academic</option>
                    <option value="Entrepreneurship">Entrepreneurship</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                    <option value="Social Impact">Social Impact</option>
                    <option value="Media & Design">Media & Design</option>
                    <option value="Science & Research">Science & Research</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  disabled={isSuspended}
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  placeholder="e.g. Innovating hands-on autonomous robotics and AI"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={4}
                  disabled={isSuspended}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50 leading-relaxed"
                />
              </div>
            </div>

            {/* SECTION 3: TIMING & LOCATION */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Schedule & Meeting Location
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>Club Timing / Schedule</span>
                  </label>
                  <input
                    type="text"
                    disabled={isSuspended}
                    value={editSchedule}
                    onChange={(e) => setEditSchedule(e.target.value)}
                    placeholder="e.g. Every Wednesday 4:00 PM - 6:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                    <span>Club Location / Room</span>
                  </label>
                  <input
                    type="text"
                    disabled={isSuspended}
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Lab 402, Engineering Block or Virtual"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Leave blank if not yet allocated.
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 4: CONTACT & COORDINATOR ENDORSEMENT */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Contact & Coordinator Endorsement
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Official Club Email</span>
                  </label>
                  <input
                    type="email"
                    disabled={isSuspended}
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="e.g. robotics@studymyte.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Website or Community Link</span>
                  </label>
                  <input
                    type="url"
                    disabled={isSuspended}
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Coordinator / Faculty Name *
                  </label>
                  <input
                    type="text"
                    disabled={isSuspended}
                    value={editFacultyName}
                    onChange={(e) => setEditFacultyName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Coordinator Email (Optional)
                  </label>
                  <input
                    type="email"
                    disabled={isSuspended}
                    value={editFacultyEmail}
                    onChange={(e) => setEditFacultyEmail(e.target.value)}
                    placeholder="e.g. rajesh.kumar@college.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: MEMBERSHIP APPLICATIONS TOGGLE */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                  Accepting Student Applications
                </h4>
                <p className="text-[11px] text-slate-500">
                  Allow students to submit join requests directly from the public club space.
                </p>
              </div>

              <button
                type="button"
                disabled={isSuspended}
                onClick={() => setEditAppsOpen(!editAppsOpen)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  editAppsOpen
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                } disabled:opacity-50`}
              >
                {editAppsOpen ? 'Applications OPEN' : 'Applications CLOSED'}
              </button>
            </div>

            {/* SECTION 6: ADDITIONAL LINKS & SOCIAL PROFILES */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Additional Links & Social Profiles
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Configure official links and community channels to display on your public club page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditLinks((prev) => ({
                      ...prev,
                      custom_links: [...(prev.custom_links || []), { name: '', url: '' }],
                    }));
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Links</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>Website</span>
                  </label>
                  <input
                    type="url"
                    disabled={isSuspended}
                    value={editLinks.website || ''}
                    onChange={(e) => setEditLinks((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>WhatsApp</span>
                  </label>
                  <input
                    type="url"
                    disabled={isSuspended}
                    value={editLinks.whatsapp || ''}
                    onChange={(e) => setEditLinks((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-sky-500" />
                    <span>Telegram</span>
                  </label>
                  <input
                    type="url"
                    disabled={isSuspended}
                    value={editLinks.telegram || ''}
                    onChange={(e) => setEditLinks((prev) => ({ ...prev, telegram: e.target.value }))}
                    placeholder="https://t.me/..."
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <LinkedinIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>LinkedIn</span>
                  </label>
                  <input
                    type="url"
                    disabled={isSuspended}
                    value={editLinks.linkedin || ''}
                    onChange={(e) => setEditLinks((prev) => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/company/..."
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <GithubIcon className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" />
                    <span>GitHub</span>
                  </label>
                  <input
                    type="url"
                    disabled={isSuspended}
                    value={editLinks.github || ''}
                    onChange={(e) => setEditLinks((prev) => ({ ...prev, github: e.target.value }))}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                    <span>Instagram</span>
                  </label>
                  <input
                    type="url"
                    disabled={isSuspended}
                    value={editLinks.instagram || ''}
                    onChange={(e) => setEditLinks((prev) => ({ ...prev, instagram: e.target.value }))}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Custom Links Repeater */}
              {editLinks.custom_links && editLinks.custom_links.length > 0 && (
                <div className="space-y-3 pt-3">
                  <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Custom Page Links (Name & Link)
                  </h5>
                  <div className="space-y-2">
                    {editLinks.custom_links.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          disabled={isSuspended}
                          value={link.name}
                          onChange={(e) => {
                            const updated = [...editLinks.custom_links];
                            updated[idx].name = e.target.value;
                            setEditLinks((prev) => ({ ...prev, custom_links: updated }));
                          }}
                          placeholder="Name of page (e.g. Discord, Notion)"
                          className="w-1/3 px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700"
                        />
                        <input
                          type="url"
                          disabled={isSuspended}
                          value={link.url}
                          onChange={(e) => {
                            const updated = [...editLinks.custom_links];
                            updated[idx].url = e.target.value;
                            setEditLinks((prev) => ({ ...prev, custom_links: updated }));
                          }}
                          placeholder="Link (https://...)"
                          className="flex-1 px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          disabled={isSuspended}
                          onClick={() => {
                            const updated = editLinks.custom_links.filter((_, i) => i !== idx);
                            setEditLinks((prev) => ({ ...prev, custom_links: updated }));
                          }}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                          title="Remove custom link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSuspended || isSavingSettings}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Club Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* DANGER ZONE: TRANSFER OWNERSHIP */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-rose-200 dark:border-rose-950/80 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-display font-bold text-lg text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5" />
                  <span>Transfer Club Ownership</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                  Transfer primary administrative authority and ownership of {activeClub.name} to another registered member using their mobile number.
                  Once transferred, you will become a Club Manager and forfeit owner control.
                </p>
              </div>

              <button
                type="button"
                disabled={isSuspended}
                onClick={handleOpenTransferModal}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow transition-all whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Transfer Ownership</span>
              </button>
            </div>
          </div>
        </div>
        )
      )}

      {/* TRANSFER OWNERSHIP MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-slate-700 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                    Transfer Ownership
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Step {transferStep} of 2 • {transferStep === 1 ? 'Verify Recipient' : 'Confirm Transfer'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: ENTER MOBILE / EMAIL OR SELECT COORDINATOR / MEMBER */}
            {transferStep === 1 && (
              <form onSubmit={handleVerifyMobile} className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Enter the registered mobile number or email of the recipient you want to transfer <strong>{activeClub.name}</strong> to, or choose an existing team member below.
                </p>

                {/* Coordinator Quick Select */}
                {coordinators.length > 0 && (
                  <div className="space-y-2 p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-navy-950/60 border border-indigo-100 dark:border-indigo-900/50">
                    <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-500" />
                      <span>Select Appointed Club Coordinator:</span>
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {coordinators.map((coord) => {
                        const coordUserId = coord.user_id || coord.user?.id || coord.id;
                        const coordUser = (user && user.id === coordUserId) ? user : (storageEngine.getUserById(coordUserId) || coord.user || {});
                        return (
                          <button
                            key={coord.id || coordUserId}
                            type="button"
                            onClick={() => {
                              const target = {
                                id: coordUserId,
                                full_name: coordUser.full_name || coord.user?.full_name || coord.user_name || 'Coordinator',
                                email: coordUser.email || coord.user?.email || coord.user_email || '',
                                phone: coordUser.phone || coord.user?.phone || coord.user_phone || '',
                                avatar_url: coordUser.avatar_url || coord.user?.avatar_url || '',
                              };
                              storageEngine.updateProfile(target.id, target);
                              setTransferTargetUser(target);
                              setTransferStep(2);
                              setConfirmClubName('');
                              setHasCopiedName(false);
                            }}
                            className="w-full p-2.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-brand-500 flex items-center justify-between text-left transition-all group"
                          >
                            <div>
                              <div className="font-semibold text-xs text-slate-900 dark:text-white">
                                {coordUser.full_name || coord.user?.full_name || coord.user_name || 'Coordinator'}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {coordUser.email || coord.user?.email || coord.user_email || 'No email registered'}
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-brand-500 group-hover:translate-x-0.5 transition-transform">
                              Select →
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Other Members Quick Select */}
                {members.filter((m) => m.user_id !== user?.id && m.membership_role !== 'owner' && m.membership_role !== 'coordinator' && m.membership_role !== 'manager').length > 0 && (
                  <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span>Or Select an Approved Club Member:</span>
                    </span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {members
                        .filter((m) => m.user_id !== user?.id && m.membership_role !== 'owner' && m.membership_role !== 'coordinator' && m.membership_role !== 'manager')
                        .map((mem) => {
                          const memUserId = mem.user_id || mem.user?.id || mem.id;
                          const memUser = storageEngine.getUserById(memUserId) || mem.user || {};
                          return (
                            <button
                              key={mem.id || memUserId}
                              type="button"
                              onClick={() => {
                                const target = {
                                  id: memUserId,
                                  full_name: memUser.full_name || mem.user?.full_name || mem.user_name || 'Member',
                                  email: memUser.email || mem.user?.email || mem.user_email || '',
                                  phone: memUser.phone || mem.user?.phone || mem.user_phone || '',
                                  avatar_url: memUser.avatar_url || mem.user?.avatar_url || '',
                                };
                                storageEngine.updateProfile(target.id, target);
                                setTransferTargetUser(target);
                                setTransferStep(2);
                                setConfirmClubName('');
                                setHasCopiedName(false);
                              }}
                              className="w-full p-2.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800 hover:border-brand-500 flex items-center justify-between text-left transition-all group"
                            >
                              <div>
                                <div className="font-semibold text-xs text-slate-900 dark:text-white">
                                  {memUser.full_name || mem.user?.full_name || mem.user_name || 'Member'}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {memUser.email || mem.user?.email || mem.user_email}
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-brand-500 group-hover:translate-x-0.5 transition-transform">
                                Select →
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Or Enter Recipient Mobile Number or Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={transferPhone}
                      onChange={(e) => {
                        setTransferPhone(e.target.value);
                        setTransferError('');
                      }}
                      placeholder="e.g. 9876543210 or student@studymyte.edu"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl glass-panel text-xs border border-slate-300 dark:border-slate-700"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Error Banner */}
                {transferError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{transferError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={transferLoading || !transferPhone.trim()}
                    className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {transferLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying Account...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: CONFIRMATION POPUP WITH CLUB NAME COPY BUTTON */}
            {transferStep === 2 && transferTargetUser && (
              <div className="space-y-4 animate-in fade-in">
                {/* Verified Target Recipient Card */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-sm shadow">
                    {transferTargetUser.avatar_url ? (
                      <img
                        src={transferTargetUser.avatar_url}
                        alt={transferTargetUser.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      transferTargetUser.full_name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {transferTargetUser.full_name}
                      </h4>
                      <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Verified Member
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {transferTargetUser.email} • {transferTargetUser.phone || transferPhone}
                    </p>
                  </div>
                </div>

                {/* Warning callout */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
                  <span className="leading-relaxed">
                    <strong>Important:</strong> You are transferring complete owner control of <strong>{activeClub.name}</strong> to <strong>{transferTargetUser.full_name}</strong>.
                    Your role will be updated to Club Coordinator.
                  </span>
                </div>

                {/* Club Name Copy Box & Confirmation Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    To confirm transfer, please type your club name below:
                  </label>

                  {/* Club Name Display with Copy Button */}
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white truncate">
                      {activeClub.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyClubName}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                        hasCopiedName
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {hasCopiedName ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Club Name</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Typing input */}
                  <input
                    type="text"
                    value={confirmClubName}
                    onChange={(e) => setConfirmClubName(e.target.value)}
                    placeholder={`Type "${activeClub.name}" to transfer`}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-300 dark:border-slate-700"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTransferStep(1);
                      setConfirmClubName('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={
                      confirmClubName.trim().toLowerCase() !== activeClub.name.trim().toLowerCase() || isTransferring
                    }
                    onClick={handleExecuteTransfer}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isTransferring ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Transferring...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Confirm & Transfer Ownership</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Resource Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleUploadResource}
            className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl"
          >
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Upload New Club Resource
            </h3>
            <p className="text-xs text-slate-500">
              Uploaded files are stored securely and accessible only to approved club members.
            </p>

            <div>
              <label className="block text-xs font-semibold mb-1">Title *</label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. Advanced ROS 2 Navigation Guide"
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
                <option value="Media">Media</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                placeholder="Brief summary of what this document covers..."
                className="w-full px-3.5 py-2 rounded-xl glass-panel text-xs border border-slate-700"
              />
            </div>

            {/* File Upload Zone */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Resource Document (PDF, DOCX, ZIP, PPTX)
              </label>
              <input
                type="file"
                ref={resourceFileInputRef}
                onChange={(e) => handleResourceFile(e.target.files?.[0])}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.csv,.xls,.xlsx,image/*"
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5 text-brand-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {fileType} • Ready to publish
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => resourceFileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileDataUrl('');
                        setFileSize(0);
                        setUploadFileName('');
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleResourceFile(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => resourceFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                    isDragging
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-slate-300 dark:border-slate-700 hover:border-brand-500/60 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-white">
                    Click to browse or drag & drop your file here
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Supports PDF, Word, PowerPoint, TXT, or ZIP (Max 50 MB)
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Display File Name</label>
              <input
                type="text"
                value={uploadFileName}
                onChange={(e) => setUploadFileName(e.target.value)}
                placeholder="e.g. ROS2_Navigation_v2.pdf"
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
                disabled={isPublishing}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs shadow transition-all"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing Resource...</span>
                  </>
                ) : (
                  <span>Publish Resource</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleCreateAnnouncement}
            className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl"
          >
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Broadcast New Announcement
            </h3>

            <div>
              <label className="block text-xs font-semibold mb-1">Headline *</label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="e.g. Next Hardware Hack Session Rescheduled"
                className="w-full px-3.5 py-2 rounded-xl glass-panel text-xs border border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Details *</label>
              <textarea
                required
                rows={4}
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                placeholder="Provide event or schedule updates for club members..."
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
                className="px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow"
              >
                Broadcast
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedule Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleCreateEvent}
            className="glass-panel max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-500" />
                <span>Schedule New Event</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Annual Autonomous Drone Workshop"
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-700"
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Meetup">Meetup</option>
                  <option value="Competition">Competition</option>
                  <option value="Orientation">Orientation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Time *</label>
                <input
                  type="text"
                  required
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="e.g. 4:00 PM - 6:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Location / Venue</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g. Audi 2 / Zoom Link"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                placeholder="Give students details about what will happen at the event..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Registration Link (Optional)</label>
              <input
                type="url"
                value={eventRegUrl}
                onChange={(e) => setEventRegUrl(e.target.value)}
                placeholder="https://forms.gle/... or https://unstop.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Banner Image URL (Optional)</label>
              <input
                type="url"
                value={eventBannerUrl}
                onChange={(e) => setEventBannerUrl(e.target.value)}
                placeholder="https://example.com/image.jpg or upload link"
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-700"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEvent}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs shadow transition-all"
              >
                {isSavingEvent ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing Event...</span>
                  </>
                ) : (
                  <span>Publish Event</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Restricted Invitation Roster Modal */}
      {showEditRosterModal && editingInvitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-base px-3 py-1 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {editingInvitation.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                    Restricted Roster
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                  Edit Allowed Invited Emails
                </h3>
                <p className="text-xs text-slate-500">
                  Add or remove user emails. Only accounts matching these addresses can redeem this code.
                </p>
              </div>

              <div>
                <LiveCountdown expiresAt={editingInvitation.expires_at} />
              </div>
            </div>

            {/* Add New Email Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Add Email Addresses
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editRosterInput}
                  onChange={(e) => setEditRosterInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEmailToEditRoster();
                    }
                  }}
                  placeholder="student@college.edu or comma-separated emails"
                  className="flex-1 px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-300 dark:border-slate-700"
                />
                <button
                  type="button"
                  onClick={handleAddEmailToEditRoster}
                  className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow transition-all whitespace-nowrap"
                >
                  Add Email
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                You can paste multiple comma-separated emails or add them one by one.
              </p>
            </div>

            {/* Allowed Emails Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Roster Emails ({editRosterEmails.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  {editRosterEmails.filter((e) => (typeof e === 'object' && e.joined)).length} already joined
                </span>
              </div>

              {editRosterEmails.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-navy-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  No emails in this roster. Add at least one email address.
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-navy-950 text-slate-500 text-[10px] uppercase font-bold sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Email Address</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {editRosterEmails.map((item, idx) => {
                        const emailStr = typeof item === 'string' ? item : item.email;
                        const hasJoined = typeof item === 'object' && item.joined;
                        const userName = typeof item === 'object' ? item.user_name : '';

                        return (
                          <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-navy-900/60">
                            <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                              {emailStr}
                            </td>
                            <td className="py-2 px-3">
                              {hasJoined ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Joined ({userName || 'Member'})</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 font-medium text-[10px]">
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveEmailFromEditRoster(emailStr)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                                title="Remove email from roster"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowEditRosterModal(false);
                  setEditingInvitation(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingRoster}
                onClick={handleSaveEditRoster}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all"
              >
                {isSavingRoster ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
