import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User / Profile Schema
const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String }, // hashed password
    phone: { type: String, default: '' },
    role: { type: String, enum: ['student', 'owner', 'manager', 'admin'], default: 'student' },
    avatar_url: { type: String, default: '' },
    avatar_public_id: { type: String, default: '' },
    is_admin: { type: Boolean, default: false },
    email_verified: { type: Boolean, default: true },
    is_verified: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (this.password && !this.password.startsWith('$2')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate();
  if (!update) return;
  if (update.password && !update.password.startsWith('$2')) {
    update.password = await bcrypt.hash(update.password, 10);
  }
  if (update.$set && update.$set.password && !update.$set.password.startsWith('$2')) {
    update.$set.password = await bcrypt.hash(update.$set.password, 10);
  }
});

userSchema.pre('updateOne', async function () {
  const update = this.getUpdate();
  if (!update) return;
  if (update.password && !update.password.startsWith('$2')) {
    update.password = await bcrypt.hash(update.password, 10);
  }
  if (update.$set && update.$set.password && !update.$set.password.startsWith('$2')) {
    update.$set.password = await bcrypt.hash(update.$set.password, 10);
  }
});

// Club Schema
const clubSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    category: { type: String, default: 'Technical' },
    college_affiliation: { type: String, default: 'General Campus' },
    official_email: { type: String, default: '' },
    website_url: { type: String, default: '' },
    meeting_schedule: { type: String, default: '' },
    location: { type: String, default: '' },
    club_head_name: { type: String, default: '' },
    club_head_email: { type: String, default: '' },
    faculty_name: { type: String, default: '' },
    faculty_email: { type: String, default: '' },
    logo_url: { type: String, default: '' },
    logo_public_id: { type: String, default: '' },
    banner_url: { type: String, default: '' },
    banner_public_id: { type: String, default: '' },
    applications_open: { type: Boolean, default: true },
    allow_coordinators_invitation: { type: Boolean, default: false },
    social_links: {
      website: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      telegram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      instagram: { type: String, default: '' },
      custom_links: [
        {
          name: { type: String, default: '' },
          url: { type: String, default: '' },
        },
      ],
    },
    gallery: [
      {
        id: { type: String },
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        public_id: { type: String, default: '' },
        uploaded_at: { type: Date, default: Date.now },
      },
    ],
    status: { type: String, enum: ['active', 'suspended', 'archived'], default: 'active' },
    owner_id: { type: String, default: '' },
    club_head_id: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Membership Schema
const membershipSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    club_id: { type: String, required: true },
    user_id: { type: String, required: true },
    role: { type: String, enum: ['member', 'coordinator', 'manager', 'owner'], default: 'member' },
    membership_role: { type: String, default: 'member' },
    status: { type: String, enum: ['active', 'pending', 'inactive', 'approved'], default: 'active' },
    join_source: { type: String, default: 'direct' },
    joined_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
membershipSchema.index({ club_id: 1, user_id: 1 }, { unique: true });

// Resource Schema (Cloudinary PDF / media resources)
const resourceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    club_id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'Notes' },
    file_type: { type: String, default: 'PDF' },
    file_name: { type: String, required: true },
    file_size_bytes: { type: Number, default: 0 },
    file_url: { type: String, required: true },
    cloudinary_public_id: { type: String, default: '' },
    color_accent: { type: String, default: 'blue' },
    uploaded_by: { type: String, default: '' },
    is_protected: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Membership Application Schema
const membershipApplicationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    club_id: { type: String, required: true },
    user_id: { type: String, required: true },
    user_name: { type: String, required: true },
    user_email: { type: String, required: true },
    user_phone: { type: String, default: '' },
    statement_of_interest: { type: String, default: '' },
    skills: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewed_by: { type: String, default: '' },
    reviewed_at: { type: Date },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Club Registration Application Schema (For new clubs submitted to admin)
const clubApplicationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    club_name: { type: String, required: true },
    category: { type: String, default: 'Technical' },
    description: { type: String, default: '' },
    college_affiliation: { type: String, default: '' },
    official_email: { type: String, default: '' },
    website_url: { type: String, default: '' },
    applicant_id: { type: String, default: '' },
    applicant_name: { type: String, default: '' },
    applicant_email: { type: String, default: '' },
    applicant_phone: { type: String, default: '' },
    owner_name: { type: String, default: '' },
    owner_email: { type: String, default: '' },
    faculty_name: { type: String, default: '' },
    faculty_email: { type: String, default: '' },
    location: { type: String, default: '' },
    logo_url: { type: String, default: '' },
    logo_public_id: { type: String, default: '' },
    banner_url: { type: String, default: '' },
    banner_public_id: { type: String, default: '' },
    applications_open: { type: Boolean, default: true },
    admin_notes: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewed_by: { type: String, default: '' },
    reviewed_at: { type: Date },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Announcement Schema
const announcementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    club_id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    author_name: { type: String, default: '' },
    is_pinned: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Club Invitation Schema
const invitationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    club_id: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    link: { type: String, default: '' },
    expires_at: { type: Date, required: true },
    expiration_hours: { type: Number, required: true, default: 24 },
    type: { type: String, enum: ['public', 'restricted'], default: 'public' },
    allowed_emails: [
      {
        email: { type: String, lowercase: true, trim: true },
        joined: { type: Boolean, default: false },
        joined_at: { type: Date },
        user_id: { type: String, default: '' },
        user_name: { type: String, default: '' },
      },
    ],
    created_by: { type: String, required: true },
    created_by_name: { type: String, default: '' },
    created_by_role: { type: String, default: 'owner' },
    status: { type: String, enum: ['active', 'expired', 'completed', 'deleted'], default: 'active' },
    deleted_at: { type: Date },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Event Schema
const eventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    club_id: { type: String, required: true },
    club_name: { type: String, default: '' },
    title: { type: String, required: true },
    type: { type: String, default: 'Workshop' },
    description: { type: String, default: '' },
    date: { type: String, default: '' },
    time: { type: String, default: '' },
    location: { type: String, default: '' },
    is_online: { type: Boolean, default: false },
    meeting_link: { type: String, default: '' },
    banner_url: { type: String, default: '' },
    registration_url: { type: String, default: '' },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Password Reset OTP Schema (TTL: 10 minutes auto-expire)
const passwordResetOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expires_at: { type: Date, required: true },
    created_at: { type: Date, default: Date.now, expires: 600 }, // MongoDB TTL auto-cleanup after 600s
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
export const Club = mongoose.model('Club', clubSchema);
export const Membership = mongoose.model('Membership', membershipSchema);
export const Resource = mongoose.model('Resource', resourceSchema);
export const MembershipApplication = mongoose.model('MembershipApplication', membershipApplicationSchema);
export const ClubApplication = mongoose.model('ClubApplication', clubApplicationSchema);
export const Announcement = mongoose.model('Announcement', announcementSchema);
export const Invitation = mongoose.model('Invitation', invitationSchema);
export const Event = mongoose.model('Event', eventSchema);
export const PasswordResetOtp = mongoose.model('PasswordResetOtp', passwordResetOtpSchema);

