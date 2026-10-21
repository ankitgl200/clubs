import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { clubService } from '../services/clubService';
import { cloudinaryService } from '../services/cloudinaryService';
import {
  Building2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  MapPin,
  User,
  Mail,
  Camera,
  X,
  Loader2,
  Globe,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function ClubApplicationPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Basic Details
  const [clubName, setClubName] = useState('');
  const [category, setCategory] = useState('Technical');
  const [affiliation, setAffiliation] = useState('School of Engineering');
  const [officialEmail, setOfficialEmail] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');

  // Logo & Banner Cloudinary Assets
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPublicId, setLogoPublicId] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef(null);

  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerPublicId, setBannerPublicId] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerInputRef = useRef(null);

  // Coordinator Endorsement & Owner Details
  const [ownerName, setOwnerName] = useState(user?.full_name || '');
  const [ownerEmail, setOwnerEmail] = useState(user?.email || '');
  const [facultyName, setFacultyName] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');
  const [applicationsOpen, setApplicationsOpen] = useState(true);

  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  // Handle Logo Upload with Auto-Deletion of Previous Logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const res = await cloudinaryService.uploadClubLogo(file, logoPublicId);
      setLogoUrl(res.url);
      setLogoPublicId(res.publicId);
      toast.success('Club logo uploaded to Cloudinary!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (logoPublicId) {
      await cloudinaryService.deleteImage(logoPublicId).catch(() => {});
    }
    setLogoUrl('');
    setLogoPublicId('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  // Handle Banner Upload with Auto-Deletion of Previous Banner
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      const res = await cloudinaryService.uploadClubBanner(file, bannerPublicId);
      setBannerUrl(res.url);
      setBannerPublicId(res.publicId);
      toast.success('Club banner uploaded to Cloudinary!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload banner.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (bannerPublicId) {
      await cloudinaryService.deleteImage(bannerPublicId).catch(() => {});
    }
    setBannerUrl('');
    setBannerPublicId('');
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmed) {
      toast.warning('Please confirm you have authority to register this club.');
      return;
    }
    if (!ownerName.trim() || !ownerEmail.trim()) {
      toast.warning('Club owner name and email are compulsory.');
      return;
    }
    if (!facultyName.trim()) {
      toast.warning('Faculty coordinator name is compulsory.');
      return;
    }

    try {
      setSubmitting(true);
      const app = await clubService.submitClubApplication(
        {
          club_name: clubName,
          category,
          college_affiliation: affiliation,
          official_email: officialEmail,
          website_url: websiteUrl,
          description: desc,
          location: location.trim(),
          logo_url: logoUrl,
          logo_public_id: logoPublicId,
          banner_url: bannerUrl,
          banner_public_id: bannerPublicId,
          owner_name: ownerName.trim(),
          owner_email: ownerEmail.trim(),
          faculty_name: facultyName.trim(),
          faculty_email: facultyEmail.trim(),
          faculty_coordinator_name: facultyName.trim(),
          faculty_coordinator_email: facultyEmail.trim(),
          applications_open: applicationsOpen,
        },
        user || {
          id: `usr_guest_${Date.now()}`,
          full_name: ownerName,
          email: ownerEmail,
        }
      );

      setSubmittedApp(app);
      toast.success('Club registration application submitted for Admin approval!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedApp) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-black text-3xl text-slate-900 dark:text-white">
            Application Submitted!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your registration for <strong>{submittedApp.club_name}</strong> is now in <strong>Pending</strong> status. Platform Administrators will review all organization media, location, owner credentials, and coordinator endorsement.
          </p>
        </div>
        <div className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Application ID:</span>
            <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">{submittedApp.id}</span>
          </div>
          <div>• <strong>Club Owner:</strong> {submittedApp.owner_name} ({submittedApp.owner_email})</div>
          <div>• <strong>Faculty Coordinator:</strong> {submittedApp.faculty_name} {submittedApp.faculty_email ? `(${submittedApp.faculty_email})` : ''}</div>
          <div>• <strong>Allocated Location:</strong> {submittedApp.location || 'Pending allocation'}</div>
          {submittedApp.logo_url && <div>• <strong>Logo:</strong> Uploaded to Cloudinary CDN</div>}
          {submittedApp.banner_url && <div>• <strong>Banner:</strong> Uploaded to Cloudinary CDN</div>}
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/clubs"
            className="px-6 py-2.5 rounded-full bg-brand-500 text-white font-semibold text-xs shadow hover:bg-brand-600 transition-all"
          >
            Explore Active Clubs
          </Link>
          <Link
            to="/admin"
            className="px-6 py-2.5 rounded-full glass-panel text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Review in Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 mb-2 border border-brand-200/50">
          <Building2 className="w-3.5 h-3.5" />
          <span>New Campus Community</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Register a New Club
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Bring your student organization to The Clubs ecosystem. All new clubs undergo platform administrative verification prior to public activation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8">
        
        {/* SECTION 1: ORGANIZATION DETAILS */}
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-500" />
              <span>1. Organization Details</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">* indicates required</span>
          </div>

          {/* Logo & Banner Upload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Club Logo Upload (Optional) */}
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-navy-900/40 border border-slate-200/70 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-brand-500" />
                  <span>Club Logo (Optional)</span>
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-[11px] text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div
                  onClick={() => !uploadingLogo && logoInputRef.current?.click()}
                  className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 flex items-center justify-center cursor-pointer overflow-hidden bg-slate-50 dark:bg-navy-950 flex-shrink-0 relative group"
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                  ) : logoUrl ? (
                    <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                  )}
                </div>

                <div className="text-xs">
                  <button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 hover:bg-brand-100 font-semibold text-xs border border-brand-200 dark:border-brand-500/30 inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">Square format, auto-crops on Cloudinary.</p>
                </div>
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>

            {/* Club Banner Upload (Optional) */}
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-navy-900/40 border border-slate-200/70 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
                  <span>Club Banner (Optional)</span>
                </label>
                {bannerUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveBanner}
                    className="text-[11px] text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div
                onClick={() => !uploadingBanner && bannerInputRef.current?.click()}
                className="w-full h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 flex items-center justify-center cursor-pointer overflow-hidden bg-slate-50 dark:bg-navy-950 relative group"
              >
                {uploadingBanner ? (
                  <div className="flex items-center gap-2 text-xs text-brand-500 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading Banner to Cloudinary...</span>
                  </div>
                ) : bannerUrl ? (
                  <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-brand-500 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Click to upload wide header banner</span>
                  </div>
                )}
              </div>

              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Club Name *
              </label>
              <input
                type="text"
                required
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="e.g. AI & Neurotech Society"
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Academic">Academic</option>
                <option value="Creative">Creative</option>
                <option value="Social">Social</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                College Affiliation / Department *
              </label>
              <input
                type="text"
                required
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="e.g. Department of Computer Science"
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Club Email *
              </label>
              <input
                type="email"
                required
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                placeholder="e.g. neurotech@studymyte.edu"
                className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Club Location (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
                <span>Club Location (Optional)</span>
              </span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Student Center Room 304, Innovation Wing"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
              Note: Leave it blank if not allocated location of club.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              External Website URL (Optional)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Club Description & Mission *
            </label>
            <textarea
              required
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Outline the core vision, weekly workshops, student projects, and activities..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
          </div>
        </div>

        {/* SECTION 2: COORDINATOR ENDORSEMENT */}
        <div className="space-y-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-brand-500" />
              <span>2. Coordinator Endorsement</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified leadership details for club ownership and institutional compliance.
            </p>
          </div>

          {/* Club Owner Details */}
          <div className="p-4 rounded-2xl bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200/50 dark:border-brand-500/20 space-y-3">
            <h4 className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-500" />
              <span>Club Owner Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Owner Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Aryan Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Owner Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="e.g. aryan@studymyte.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Faculty Coordinator Details */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/40 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              <span>Faculty Coordinator Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    placeholder="e.g. Dr. Sandeep Goel"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Faculty Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={facultyEmail}
                    onChange={(e) => setFacultyEmail(e.target.value)}
                    placeholder="e.g. sandeep.goel@college.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Joining Applications Toggle */}
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-navy-900/30 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4">
            <div>
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Membership Applications
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Allow students to submit join requests as soon as the club is approved.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={applicationsOpen}
                onChange={(e) => setApplicationsOpen(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>
        </div>

        {/* Confirmation & Submit */}
        <div className="pt-2 space-y-4 border-t border-slate-200 dark:border-slate-800">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 rounded text-brand-500 focus:ring-brand-500"
            />
            <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              I certify that I am authorized to register this club on behalf of the institution, all uploaded media and documents are accurate, and our community abides by college guidelines.
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/clubs"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-lg shadow-brand-500/25 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <span>Submit Club Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
