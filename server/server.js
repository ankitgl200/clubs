import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, activeDbInfo } from './config/db.js';
import {
  User,
  Club,
  Membership,
  Resource,
  MembershipApplication,
  ClubApplication,
  Announcement,
  Invitation,
  Event,
  PasswordResetOtp,
} from './models/index.js';
import { sendPasswordResetOtpEmail } from './utils/emailService.js';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'studymyte_secure_jwt_secret_key_2026';

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await ensurePasswordsHashed();
  } catch (e) {}
  res.json({
    status: 'ok',
    message: 'Club Studymyte MongoDB Backend Active',
    environment: activeDbInfo.environment,
    database: activeDbInfo.type,
    host: activeDbInfo.host,
    dbName: activeDbInfo.dbName,
  });
});

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { id, full_name, email, password, phone, role, avatar_url, avatar_public_id } = req.body;
    if (!email || !full_name) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = password.startsWith('$2') ? password : await bcrypt.hash(password, 10);
    const userId = id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const user = await User.create({
      id: userId,
      full_name,
      email: cleanEmail,
      password: hashedPassword,
      phone: phone || '',
      role: role || 'student',
      avatar_url: avatar_url || '',
      avatar_public_id: avatar_public_id || '',
      is_admin: role === 'admin',
      email_verified: true,
      is_verified: true,
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const userSafe = user.toObject();
    delete userSafe.password;

    res.status(201).json({ user: userSafe, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const target = (email || identifier || '').trim();
    if (!target || !password) {
      return res.status(400).json({ error: 'Email/Phone and password required.' });
    }

    // Lookup user by either email or phone
    const cleanDigits = target.replace(/\D/g, '');
    let user = null;
    if (target.includes('@')) {
      user = await User.findOne({ email: target.toLowerCase() });
    } else if (cleanDigits.length >= 10) {
      user = await User.findOne({
        $or: [
          { phone: target },
          { phone: cleanDigits },
          { phone: { $regex: cleanDigits.slice(-10) } },
        ],
      });
    } else {
      user = await User.findOne({ email: target.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ error: 'Invalid email/phone or password. Please check and try again.' });
    }

    if (user.password) {
      let isMatch = false;
      if (user.password.startsWith('$2')) {
        isMatch = await bcrypt.compare(password, user.password).catch(() => false);
      } else {
        // Plain text fallback: if it matches, automatically re-hash and save to MongoDB!
        if (user.password === password) {
          isMatch = true;
          const hashed = await bcrypt.hash(password, 10);
          await User.updateOne({ _id: user._id }, { $set: { password: hashed } });
        }
      }
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password. Please check and try again.' });
      }
    } else {
      // Set initial hashed password if missing
      const hashed = await bcrypt.hash(password, 10);
      await User.updateOne({ _id: user._id }, { $set: { password: hashed } });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const userSafe = user.toObject();
    delete userSafe.password;
    if (userSafe.role === 'admin' || userSafe.is_admin) {
      userSafe.role = 'admin';
      userSafe.is_admin = true;
    }

    res.json({ user: userSafe, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// SECURE PASSWORD RESET VIA RESEND OTP (SERVER-SIDE ONLY)
// -------------------------------------------------------------

// 1. Send OTP to User's Email via Resend
app.post('/api/auth/forgot-password/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email address.' });
    }

    // Generate cryptographically secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any previously issued OTPs for this email
    await PasswordResetOtp.deleteMany({ email: cleanEmail });

    // Store in MongoDB
    await PasswordResetOtp.create({
      email: cleanEmail,
      otp,
      attempts: 0,
      expires_at: expiresAt,
    });

    // Send styled verification email via Resend
    const emailResult = await sendPasswordResetOtpEmail(cleanEmail, otp, user.full_name);

    if (!emailResult.success && !emailResult.devOtp) {
      return res.status(500).json({
        error: emailResult.error || 'Failed to dispatch email via Resend.',
      });
    }

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      expires_in_minutes: 10,
      devOtp: emailResult.devOtp, // Provided in development if Resend API key isn't provided yet
    });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Verify OTP
app.post('/api/auth/forgot-password/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const record = await PasswordResetOtp.findOne({ email: cleanEmail });
    if (!record) {
      return res.status(400).json({ error: 'Verification code expired or not found. Please request a new code.' });
    }

    if (new Date() > new Date(record.expires_at)) {
      await PasswordResetOtp.deleteOne({ _id: record._id });
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    if (record.attempts >= 5) {
      await PasswordResetOtp.deleteOne({ _id: record._id });
      return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new code.' });
    }

    if (record.otp !== cleanOtp) {
      record.attempts += 1;
      await record.save();
      const remaining = 5 - record.attempts;
      return res.status(400).json({
        error: remaining > 0 ? `Invalid verification code. ${remaining} attempts remaining.` : 'Too many incorrect attempts. Please request a new code.',
      });
    }

    // Success: Generate a secure single-use reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    record.otp = `VERIFIED_${resetToken}`;
    await record.save();

    res.json({
      success: true,
      message: 'Code verified successfully!',
      resetToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Reset Password using verified OTP or token
app.post('/api/auth/forgot-password/reset', async (req, res) => {
  try {
    const { email, otp, resetToken, new_password, newPassword } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const pass = (new_password || newPassword || '').trim();

    if (!cleanEmail) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    if (!pass || pass.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    // Server-side verification: Either verified resetToken or valid matching OTP
    const record = await PasswordResetOtp.findOne({ email: cleanEmail });
    if (!record) {
      return res.status(400).json({ error: 'Verification session expired. Please request a new code.' });
    }

    const tokenMatch = resetToken && record.otp === `VERIFIED_${resetToken}`;
    const otpMatch = otp && record.otp === otp.toString().trim();

    if (!tokenMatch && !otpMatch) {
      return res.status(400).json({ error: 'Invalid or unverified reset session. Please verify your OTP code first.' });
    }

    // Hash and update password in MongoDB
    const hashedPassword = await bcrypt.hash(pass, 10);
    await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

    // Clean up OTP record so it cannot be reused
    await PasswordResetOtp.deleteMany({ email: cleanEmail });

    console.log(`🔒 [Security]: Password successfully reset for user ${cleanEmail}`);

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { identifier, email, new_password, password } = req.body;
    const target = (email || identifier || '').trim();
    const newPass = (new_password || password || '').trim();

    if (!target) {
      return res.status(400).json({ error: 'Email or phone number is required.' });
    }
    if (!newPass || newPass.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const cleanDigits = target.replace(/\D/g, '');
    let user = null;
    if (target.includes('@')) {
      user = await User.findOne({ email: target.toLowerCase() });
    } else if (cleanDigits.length >= 10) {
      user = await User.findOne({
        $or: [
          { phone: cleanDigits },
          { phone: `+91${cleanDigits}` },
          { phone: target },
        ],
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email or phone.' });
    }

    const hashed = await bcrypt.hash(newPass, 10);
    await User.updateOne({ _id: user._id }, { $set: { password: hashed } });

    res.json({ success: true, message: 'Password updated successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ created_at: -1 });
    const formatted = users.map((u) => {
      const obj = u.toObject();
      return {
        ...obj,
        email_verified: obj.email_verified !== false,
        is_verified: obj.is_verified !== false,
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clean = (id || '').trim();
    const user = await User.findOne({
      $or: [{ id: clean }, { email: clean.toLowerCase() }],
    }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const userObj = user.toObject();
    if (userObj.role === 'admin' || userObj.is_admin) {
      userObj.role = 'admin';
      userObj.is_admin = true;
    }
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    delete updates.password;

    const updated = await User.findOneAndUpdate({ id }, updates, { new: true, upsert: true }).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clean = (id || '').trim();
    const user = await User.findOne({
      $or: [{ id: clean }, { email: clean.toLowerCase() }],
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    await User.deleteOne({ _id: user._id });
    await Membership.deleteMany({ user_id: user.id });
    await MembershipApplication.deleteMany({ user_id: user.id });
    res.json({ success: true, message: `User ${user.email} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);
    const cleanStr = query.toString().trim();
    const cleanDigits = cleanStr.replace(/\D/g, '');

    const orConditions = [
      { id: cleanStr },
      { email: { $regex: cleanStr, $options: 'i' } },
      { full_name: { $regex: cleanStr, $options: 'i' } },
    ];
    if (cleanDigits.length >= 7) {
      orConditions.push({ phone: { $regex: cleanDigits.slice(-10) } });
    }

    const users = await User.find({ $or: orConditions }).select('-password').limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CLUBS ROUTES
// -------------------------------------------------------------
app.get('/api/clubs', async (req, res) => {
  try {
    const clubs = await Club.find().sort({ created_at: -1 });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clubs', async (req, res) => {
  try {
    const club = await Club.create(req.body);
    res.status(201).json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clubs/:id/transfer-ownership', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetUserId, currentUserId, targetUser } = req.body;

    const club = await Club.findOne({ id });
    if (!club) return res.status(404).json({ error: 'Club not found.' });

    let recipient = await User.findOne({ id: targetUserId });
    if (!recipient && targetUser?.email) {
      recipient = await User.findOneAndUpdate(
        { email: targetUser.email.toLowerCase() },
        { ...targetUser, id: targetUserId },
        { upsert: true, new: true }
      );
    }

    const headName = recipient?.full_name || targetUser?.full_name || 'Club Head';
    const headEmail = recipient?.email || targetUser?.email || '';

    // Update club details
    club.club_head_name = headName;
    club.club_head_email = headEmail;
    club.club_head_id = targetUserId;
    club.owner_id = targetUserId;
    await club.save();

    // Demote former owner to coordinator/manager
    if (currentUserId) {
      await Membership.findOneAndUpdate(
        { club_id: id, user_id: currentUserId },
        { role: 'coordinator', status: 'approved' },
        { upsert: true, new: true }
      );
    }

    // Promote new owner
    const targetMem = await Membership.findOneAndUpdate(
      { club_id: id, user_id: targetUserId },
      { role: 'owner', status: 'approved' },
      { upsert: true, new: true }
    );

    res.json({ success: true, club, membership: targetMem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clubs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clean = (id || '').trim();
    const updated = await Club.findOneAndUpdate(
      { $or: [{ id: clean }, { slug: clean.toLowerCase() }] },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Club not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clubs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clean = (id || '').trim();
    const club = await Club.findOne({
      $or: [{ id: clean }, { slug: clean.toLowerCase() }],
    });
    if (!club) return res.status(404).json({ error: 'Club not found.' });

    const clubId = club.id;
    await Club.deleteOne({ _id: club._id });
    await Membership.deleteMany({ club_id: clubId });
    await MembershipApplication.deleteMany({ club_id: clubId });
    await Resource.deleteMany({ club_id: clubId });
    await Announcement.deleteMany({ club_id: clubId });
    await Event.deleteMany({ club_id: clubId });
    await Invitation.deleteMany({ club_id: clubId });

    res.json({ success: true, message: `Club ${club.name} and all associated records deleted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// RESOURCES ROUTES (Cloudinary integrated)
// -------------------------------------------------------------
app.get('/api/resources', async (req, res) => {
  try {
    const { club_id } = req.query;
    const query = club_id ? { club_id } : {};
    const resources = await Resource.find(query).sort({ created_at: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/resources', async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Resource.findOneAndDelete({ id });
    res.json({ success: true, message: 'Resource deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// MEMBERSHIPS & APPLICATIONS
// -------------------------------------------------------------
app.get('/api/memberships', async (req, res) => {
  try {
    const { user_id, club_id } = req.query;
    const query = {};
    if (user_id) query.user_id = user_id;
    if (club_id) query.club_id = club_id;
    const list = await Membership.find(query);

    const clubs = await Club.find().select('id club_head_id owner_id club_head_email');
    const clubMap = new Map(clubs.map((c) => [c.id, c]));

    const normalized = list.map((m) => {
      const obj = m.toObject();
      const c = clubMap.get(obj.club_id);
      const isOwner =
        obj.role === 'owner' ||
        obj.membership_role === 'owner' ||
        (c && (c.club_head_id === obj.user_id || c.owner_id === obj.user_id));
      const effectiveRole = isOwner ? 'owner' : (obj.role || obj.membership_role || 'member');
      return {
        ...obj,
        role: effectiveRole,
        membership_role: effectiveRole,
      };
    });

    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memberships', async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.membership_role && !payload.role) {
      payload.role = payload.membership_role;
    }
    if (payload.role && !payload.membership_role) {
      payload.membership_role = payload.role;
    }
    const mem = await Membership.create(payload);
    res.status(201).json(mem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/membership-applications', async (req, res) => {
  try {
    const { club_id, user_id } = req.query;
    const query = {};
    if (club_id) query.club_id = club_id;
    if (user_id) query.user_id = user_id;
    const apps = await MembershipApplication.find(query).sort({ created_at: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/membership-applications', async (req, res) => {
  try {
    const newApp = await MembershipApplication.create(req.body);
    res.status(201).json(newApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/membership-applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await MembershipApplication.findOneAndUpdate({ id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/membership-applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await MembershipApplication.findOneAndDelete({ id });
    res.json({ success: true, message: 'Membership application deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Club Creation Applications (Submitted by students/faculty to campus admin)
app.get('/api/club-applications', async (req, res) => {
  try {
    const apps = await ClubApplication.find().sort({ created_at: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/club-applications', async (req, res) => {
  try {
    const appDoc = await ClubApplication.create(req.body);
    res.status(201).json(appDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/club-applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ClubApplication.findOneAndUpdate({ id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/club-applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await ClubApplication.findOneAndDelete({ id });
    res.json({ success: true, message: 'Club application deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// BULK DATA SYNC (To smoothly seed existing clubs & data into MongoDB)
// -------------------------------------------------------------
app.post('/api/sync/bulk', async (req, res) => {
  try {
    const {
      users,
      clubs,
      resources,
      memberships,
      club_applications,
      membership_applications,
      announcements,
      events,
      invitations,
    } = req.body;

    if (users && users.length) {
      for (const u of users) {
        if (!u.email) continue;
        const cleanEmail = u.email.toLowerCase().trim();
        const existing = await User.findOne({ email: cleanEmail });

        if (existing) {
          // MongoDB Atlas is the source of truth! Never overwrite existing roles, admin flags or data
          continue;
        }

        const userToSave = { ...u, email: cleanEmail };
        if (userToSave.password && !userToSave.password.startsWith('$2')) {
          userToSave.password = await bcrypt.hash(userToSave.password, 10);
        }

        await User.create(userToSave);
      }
      await ensurePasswordsHashed();
    }

    if (clubs && clubs.length) {
      for (const c of clubs) {
        await Club.findOneAndUpdate({ id: c.id }, c, { upsert: true });
      }
    }

    if (resources && resources.length) {
      for (const r of resources) {
        await Resource.findOneAndUpdate({ id: r.id }, r, { upsert: true });
      }
    }

    if (memberships && memberships.length) {
      for (const m of memberships) {
        await Membership.findOneAndUpdate({ id: m.id }, m, { upsert: true });
      }
    }

    if (club_applications && club_applications.length) {
      for (const ca of club_applications) {
        await ClubApplication.findOneAndUpdate({ id: ca.id }, ca, { upsert: true });
      }
    }

    if (membership_applications && membership_applications.length) {
      for (const ma of membership_applications) {
        await MembershipApplication.findOneAndUpdate({ id: ma.id }, ma, { upsert: true });
      }
    }

    if (announcements && announcements.length) {
      for (const a of announcements) {
        await Announcement.findOneAndUpdate({ id: a.id }, a, { upsert: true });
      }
    }

    if (events && events.length) {
      for (const e of events) {
        await Event.findOneAndUpdate({ id: e.id }, e, { upsert: true });
      }
    }

    if (invitations && invitations.length) {
      for (const inv of invitations) {
        await Invitation.findOneAndUpdate({ id: inv.id }, inv, { upsert: true });
      }
    }

    res.json({ success: true, message: 'MongoDB synchronized successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// INVITATIONS & EXPIRATION PURGE ROUTINES
// -------------------------------------------------------------
async function cleanupInvitations() {
  try {
    const now = new Date();

    // 1. Mark expired invitations that passed expires_at
    await Invitation.updateMany(
      { status: 'active', expires_at: { $lte: now } },
      { $set: { status: 'expired', deleted_at: now } }
    );

    // 2. Mark completed restricted invitations where all invited emails joined
    const activeRestricted = await Invitation.find({ status: 'active', type: 'restricted' });
    for (const inv of activeRestricted) {
      if (inv.allowed_emails && inv.allowed_emails.length > 0 && inv.allowed_emails.every((e) => e.joined)) {
        inv.status = 'completed';
        inv.deleted_at = now;
        await inv.save();
      }
    }

    // 3. Purge invitations and CSV data 24 hours after deletion/completion
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await Invitation.deleteMany({
      deleted_at: { $lte: twentyFourHoursAgo },
    });
  } catch (err) {
    console.error('Error during invitation cleanup:', err.message);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupInvitations, 5 * 60 * 1000);

// Get active or completed invitations for a club
app.get('/api/invitations', async (req, res) => {
  try {
    await cleanupInvitations();
    const { club_id } = req.query;
    const query = {
      status: { $in: ['active', 'completed'] },
    };
    if (club_id) {
      query.$or = [{ club_id }, { club_id: String(club_id) }];
    }

    const invitations = await Invitation.find(query).sort({ created_at: -1 });
    res.json(invitations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single invitation by code (for preview or validation)
app.get('/api/invitations/code/:code', async (req, res) => {
  try {
    await cleanupInvitations();
    const code = req.params.code?.trim().toUpperCase();
    const inv = await Invitation.findOne({ code });
    if (!inv || !['active', 'completed'].includes(inv.status) || new Date(inv.expires_at) <= new Date()) {
      return res.status(404).json({ error: 'This invitation code is invalid or has expired.' });
    }

    const club = await Club.findOne({ $or: [{ id: inv.club_id }, { slug: inv.club_id }] });
    res.json({
      invitation: inv,
      club: club ? { id: club.id, name: club.name, logo_url: club.logo_url, category: club.category } : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new invitation
app.post('/api/invitations', async (req, res) => {
  try {
    await cleanupInvitations();
    const {
      club_id,
      code,
      expiration_hours = 24,
      type = 'public',
      allowed_emails = [],
      created_by,
      created_by_name = '',
      created_by_role = 'owner',
    } = req.body;

    if (!club_id || !code) {
      return res.status(400).json({ error: 'club_id and code are required' });
    }

    // Verify creator access: must be club owner or coordinator if allowed
    const club = await Club.findOne({ $or: [{ id: club_id }, { slug: club_id }] });
    if (club && created_by_role === 'coordinator' && !club.allow_coordinators_invitation) {
      return res.status(403).json({ error: 'The Club Owner has not enabled coordinator invitations for this club.' });
    }

    // Ensure code uniqueness
    const cleanCode = code.trim().toUpperCase();
    const existing = await Invitation.findOne({ code: cleanCode, status: 'active' });
    if (existing) {
      return res.status(400).json({ error: 'An active invitation with this code already exists. Please choose or regenerate a new code.' });
    }

    const hours = Number(expiration_hours) || 24;
    const expires_at = new Date(Date.now() + hours * 60 * 60 * 1000);

    const formattedEmails = (allowed_emails || []).map((e) => {
      const emailStr = typeof e === 'string' ? e : e.email;
      return {
        email: emailStr?.toLowerCase().trim() || '',
        joined: false,
        user_id: '',
        user_name: '',
      };
    }).filter((e) => e.email.length > 0);

    const inv = await Invitation.create({
      id: req.body.id || `inv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      club_id,
      code: cleanCode,
      link: req.body.link || '',
      expires_at,
      expiration_hours: hours,
      type: type === 'restricted' ? 'restricted' : 'public',
      allowed_emails: formattedEmails,
      created_by,
      created_by_name,
      created_by_role,
      status: 'active',
      created_at: new Date(),
    });

    res.status(201).json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update restricted invitation (allowed emails roster)
app.put('/api/invitations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { allowed_emails, expiration_hours } = req.body;
    const inv = await Invitation.findOne({ $or: [{ id }, { code: id }] });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    if (Array.isArray(allowed_emails)) {
      const formattedEmails = allowed_emails.map((e) => {
        const emailStr = typeof e === 'string' ? e : e.email;
        const existingSlot = inv.allowed_emails?.find(
          (slot) => slot.email?.toLowerCase() === emailStr?.toLowerCase()
        );
        return {
          email: emailStr?.toLowerCase().trim() || '',
          joined: existingSlot ? existingSlot.joined : false,
          joined_at: existingSlot ? existingSlot.joined_at : undefined,
          user_id: existingSlot ? existingSlot.user_id : '',
          user_name: existingSlot ? existingSlot.user_name : '',
        };
      }).filter((e) => e.email.length > 0);
      inv.allowed_emails = formattedEmails;
      inv.markModified('allowed_emails');
    }

    if (expiration_hours) {
      inv.expiration_hours = Number(expiration_hours);
    }
    await inv.save();
    res.json({ success: true, invitation: inv });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete/Revoke invitation
app.delete('/api/invitations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const inv = await Invitation.findOneAndUpdate(
      { $or: [{ id }, { code: id }] },
      { status: 'deleted', deleted_at: new Date() },
      { new: true }
    );
    res.json({ success: true, message: 'Invitation deleted.', invitation: inv });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Redeem invitation
app.post('/api/invitations/redeem', async (req, res) => {
  try {
    await cleanupInvitations();
    const { code, user_id, user_email, user_name } = req.body;

    if (!code || !user_id || !user_email) {
      return res.status(400).json({ error: 'Code, user_id, and user_email are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const inv = await Invitation.findOne({ code: cleanCode, status: { $in: ['active', 'completed'] } });

    if (!inv || new Date(inv.expires_at) <= new Date()) {
      return res.status(404).json({ error: 'Invalid invitation code or this invitation has expired.' });
    }

    const cleanUserEmail = user_email.toLowerCase().trim();

    // Check restricted conditions
    if (inv.type === 'restricted') {
      const matchIndex = inv.allowed_emails.findIndex(
        (item) => item.email?.toLowerCase().trim() === cleanUserEmail
      );

      if (matchIndex === -1) {
        return res.status(403).json({
          error: `Invalid invitation code. Your account email (${user_email}) is not on the exclusive invited roster for this club code.`,
        });
      }

      const slot = inv.allowed_emails[matchIndex];
      if (slot.joined) {
        return res.status(400).json({
          error: 'This invitation has already been redeemed for your email.',
        });
      }

      // Mark this email as joined
      inv.allowed_emails[matchIndex].joined = true;
      inv.allowed_emails[matchIndex].joined_at = new Date();
      inv.allowed_emails[matchIndex].user_id = user_id;
      inv.allowed_emails[matchIndex].user_name = user_name || 'Member';

      // Check if all users have now joined
      if (inv.allowed_emails.every((e) => e.joined)) {
        inv.status = 'completed';
        inv.deleted_at = new Date();
      }

      inv.markModified('allowed_emails');
      await inv.save();
    }

    // Add or activate Membership for user
    const existingMem = await Membership.findOne({ club_id: inv.club_id, user_id });
    if (!existingMem) {
      await Membership.create({
        id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        club_id: inv.club_id,
        user_id,
        role: 'member',
        status: 'active',
        joined_at: new Date(),
      });
      await Club.findOneAndUpdate({ $or: [{ id: inv.club_id }, { slug: inv.club_id }] }, { $inc: { member_count: 1 } });
    } else if (existingMem.status !== 'active') {
      existingMem.status = 'active';
      existingMem.role = 'member';
      existingMem.joined_at = new Date();
      await existingMem.save();
    }

    const club = await Club.findOne({ $or: [{ id: inv.club_id }, { slug: inv.club_id }] });

    res.json({
      success: true,
      message: `Congratulations! You have joined ${club?.name || 'the club'}!`,
      club_id: inv.club_id,
      club_name: club?.name,
      invitation: inv,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// MEMBERSHIPS & COORDINATOR ROLE LIMIT (MAX 4 PER CLUB)
// -------------------------------------------------------------
app.put('/api/memberships/:clubId/:userId/role', async (req, res) => {
  try {
    const { clubId, userId } = req.params;
    const { role } = req.body;

    if (!role) return res.status(400).json({ error: 'Role is required' });

    // Enforce max 4 coordinators per club
    if (role === 'coordinator') {
      const coordCount = await Membership.countDocuments({
        club_id: clubId,
        role: 'coordinator',
        user_id: { $ne: userId },
      });
      if (coordCount >= 4) {
        return res.status(400).json({
          error: 'Maximum 4 Club Coordinators are allowed for this club.',
        });
      }
    }

    const mem = await Membership.findOneAndUpdate(
      { club_id: clubId, user_id: userId },
      { role },
      { new: true }
    );
    res.json(mem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/memberships', async (req, res) => {
  try {
    const { club_id, user_id, id } = req.query;

    if (club_id && user_id) {
      const club = await Club.findOne({ id: club_id });
      if (club && (club.club_head_id === user_id || club.owner_id === user_id)) {
        return res.status(400).json({ error: 'The Club Owner cannot be removed from the club.' });
      }
    }

    const filter = {};
    if (id) filter.id = id;
    if (club_id) filter.club_id = club_id;
    if (user_id) filter.user_id = user_id;
    await Membership.deleteMany(filter);
    if (club_id) {
      await Club.findOneAndUpdate({ id: club_id }, { $inc: { member_count: -1 } });
    }
    res.json({ success: true, message: 'Membership removed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ANNOUNCEMENTS ROUTES
// -------------------------------------------------------------
app.get('/api/announcements', async (req, res) => {
  try {
    const { club_id } = req.query;
    const filter = club_id ? { club_id } : {};
    const list = await Announcement.find(filter).sort({ created_at: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const ann = await Announcement.create(req.body);

    // Keep maximum 10 latest announcements per club (auto-prune 11th and older)
    if (req.body.club_id) {
      const allClubAnns = await Announcement.find({ club_id: req.body.club_id }).sort({ created_at: -1 });
      if (allClubAnns.length > 10) {
        const toDeleteIds = allClubAnns.slice(10).map((a) => a._id);
        await Announcement.deleteMany({ _id: { $in: toDeleteIds } });
      }
    }

    res.status(201).json(ann);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.findOneAndDelete({ id });
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// EVENTS ROUTES
// -------------------------------------------------------------
app.get('/api/events', async (req, res) => {
  try {
    const { club_id } = req.query;
    const filter = club_id ? { club_id } : {};
    const list = await Event.find(filter).sort({ created_at: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const ev = await Event.create(req.body);
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Event.findOneAndUpdate({ id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findOneAndDelete({ id });
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ensure all user passwords in MongoDB are hashed with bcrypt
export async function ensurePasswordsHashed() {
  try {
    const users = await User.find({ password: { $exists: true, $ne: '' } });
    let upgraded = 0;
    for (const u of users) {
      if (u.password && !u.password.startsWith('$2')) {
        const hashed = await bcrypt.hash(u.password, 10);
        await User.updateOne({ _id: u._id }, { $set: { password: hashed } });
        upgraded++;
      }
    }
    if (upgraded > 0) {
      console.log(`🔒 Upgraded ${upgraded} user password(s) to bcrypt hash in MongoDB.`);
    }
  } catch (err) {
    console.error('Password hash upgrade notice:', err.message);
  }
}

app.post('/api/auth/hash-passwords', async (req, res) => {
  try {
    await ensurePasswordsHashed();
    res.json({ success: true, message: 'All passwords ensured hashed with bcrypt.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express server locally (standalone mode)
if (!process.env.VERCEL) {
  connectDB().then(async () => {
    await ensurePasswordsHashed();
    app.listen(PORT, () => {
      console.log(`🚀 Club Studymyte API running on http://localhost:${PORT}`);
      console.log(`📁 Database Mode: [${activeDbInfo.type}] (Env: ${activeDbInfo.environment})`);
    });
  });
}

export default app;
