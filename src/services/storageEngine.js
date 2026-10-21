// ==============================================================================
// CLUB COLLECTION: PERSISTENT REACTIVE DATA ENGINE
// 100% MongoDB (Localhost / Atlas)
// ==============================================================================

import {
  INITIAL_USERS,
  INITIAL_CLUBS,
  INITIAL_MEMBERSHIPS,
  INITIAL_MEMBERSHIP_APPLICATIONS,
  INITIAL_CLUB_APPLICATIONS,
  INITIAL_RESOURCES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_EVENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { encryptInvitationCode } from '../utils/invitationCrypto';
import { API_URL } from '../config/api';

const STORAGE_KEYS = {
  USERS: 'cc_users_v1',
  CLUBS: 'cc_clubs_v1',
  MEMBERSHIPS: 'cc_memberships_v1',
  MEM_APPS: 'cc_mem_apps_v1',
  CLUB_APPS: 'cc_club_apps_v1',
  RESOURCES: 'cc_resources_v1',
  ANNOUNCEMENTS: 'cc_announcements_v1',
  EVENTS: 'cc_events_v1',
  NOTIFICATIONS: 'cc_notifications_v1',
  AUDIT_LOGS: 'cc_audit_logs_v1',
  INTEGRATIONS: 'cc_integrations_v1',
  INVITATIONS: 'cc_invitations_v1',
};

export function generateUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function loadItem(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    console.error(`Error loading key ${key}`, e);
    return fallback;
  }
}

function saveItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for cross-component reactive updates
    window.dispatchEvent(new CustomEvent('cc_storage_changed', { detail: { key } }));
  } catch (e) {
    console.error(`Error saving key ${key}`, e);
  }
}

// Sort items latest to oldest by created_at, joined_at, or date
export function sortByLatest(items) {
  if (!Array.isArray(items)) return items;
  return [...items].sort((a, b) => {
    const timeA = new Date(a.created_at || a.createdAt || a.joined_at || a.date || 0).getTime();
    const timeB = new Date(b.created_at || b.createdAt || b.joined_at || b.date || 0).getTime();
    return timeB - timeA;
  });
}

// Helper: POST/PUT/DELETE to MongoDB with proper await and error handling
async function apiPost(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API POST ${path} failed`);
  }
  return res.json();
}

async function apiPut(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API PUT ${path} failed`);
  }
  return res.json();
}

async function apiDelete(path) {
  const res = await fetch(`${API_URL}${path}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API DELETE ${path} failed`);
  }
  return res.json();
}

async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) return null;
  return res.json();
}

class StorageEngine {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      saveItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLUBS)) {
      saveItem(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS)) {
      saveItem(STORAGE_KEYS.MEMBERSHIPS, INITIAL_MEMBERSHIPS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEM_APPS)) {
      saveItem(STORAGE_KEYS.MEM_APPS, INITIAL_MEMBERSHIP_APPLICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLUB_APPS)) {
      saveItem(STORAGE_KEYS.CLUB_APPS, INITIAL_CLUB_APPLICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESOURCES)) {
      saveItem(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
      saveItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      saveItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      saveItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      saveItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (import.meta.env?.MODE !== 'test') {
      this.syncWithMongoDB();
    }
  }

  async syncWithMongoDB() {
    try {
      // Fetch ALL data from MongoDB Atlas in parallel
      const [
        clubsRes,
        resRes,
        memAppsRes,
        memsRes,
        annRes,
        evRes,
        clubAppsRes,
        usersRes,
        invRes,
      ] = await Promise.all([
        fetch(`${API_URL}/clubs`).catch(() => null),
        fetch(`${API_URL}/resources`).catch(() => null),
        fetch(`${API_URL}/membership-applications`).catch(() => null),
        fetch(`${API_URL}/memberships`).catch(() => null),
        fetch(`${API_URL}/announcements`).catch(() => null),
        fetch(`${API_URL}/events`).catch(() => null),
        fetch(`${API_URL}/club-applications`).catch(() => null),
        fetch(`${API_URL}/users`).catch(() => null),
        fetch(`${API_URL}/invitations`).catch(() => null),
      ]);

      if (clubsRes?.ok) {
        const data = await clubsRes.json();
        if (Array.isArray(data)) saveItem(STORAGE_KEYS.CLUBS, data);
      }

      if (resRes?.ok) {
        const data = await resRes.json();
        if (Array.isArray(data)) saveItem(STORAGE_KEYS.RESOURCES, data);
      }

      if (memAppsRes?.ok) {
        const data = await memAppsRes.json();
        if (Array.isArray(data)) saveItem(STORAGE_KEYS.MEM_APPS, data);
      }

      if (memsRes?.ok) {
        const data = await memsRes.json();
        if (Array.isArray(data)) saveItem(STORAGE_KEYS.MEMBERSHIPS, data);
      }

      if (annRes?.ok) {
        const data = await annRes.json();
        if (Array.isArray(data)) saveItem(STORAGE_KEYS.ANNOUNCEMENTS, data);
      }

      if (evRes?.ok) {
        const data = await evRes.json();
        if (Array.isArray(data)) saveItem(STORAGE_KEYS.EVENTS, data);
      }

      if (clubAppsRes?.ok) {
        const data = await clubAppsRes.json();
        if (Array.isArray(data)) saveItem(STORAGE_KEYS.CLUB_APPS, data);
      }

      if (invRes?.ok) {
        const data = await invRes.json();
        if (Array.isArray(data)) saveItem(STORAGE_KEYS.INVITATIONS, data);
      }

      if (usersRes?.ok) {
        const mongoUsers = await usersRes.json();
        if (Array.isArray(mongoUsers)) {
          const normalizedUsers = mongoUsers.map((u) => {
            const isAdmin = Boolean(u.is_admin || u.role === 'admin');
            return {
              ...u,
              role: isAdmin ? 'admin' : (u.role || 'student'),
              is_admin: isAdmin,
              platform_role: isAdmin ? 'admin' : (u.role || 'student'),
            };
          });
          saveItem(STORAGE_KEYS.USERS, normalizedUsers);
        }
      }

      // Broadcast storage change so all React components re-render with fresh MongoDB data
      window.dispatchEvent(new CustomEvent('cc_storage_changed'));
    } catch (e) {
      console.warn('MongoDB sync notice:', e.message);
    }
  }

  // --- Users & Profiles ---
  getUsers() {
    return loadItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  getUserById(id) {
    const users = this.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  findUserByPhone(phone) {
    if (!phone) return null;
    const cleanDigits = phone.toString().replace(/\D/g, '');
    if (!cleanDigits) return null;
    const target10 = cleanDigits.slice(-10);

    const users = this.getUsers();
    return (
      users.find((u) => {
        if (!u.phone) return false;
        const uDigits = u.phone.toString().replace(/\D/g, '');
        if (uDigits === cleanDigits) return true;
        if (target10.length >= 10 && uDigits.slice(-10) === target10) return true;
        return false;
      }) || null
    );
  }

  findUser(identifier) {
    if (!identifier) return null;
    const cleanStr = identifier.toString().trim();
    if (!cleanStr) return null;

    const users = this.getUsers();

    // 1. By exact ID
    const byId = users.find((u) => u.id === cleanStr);
    if (byId) return byId;

    // 2. By Email (case-insensitive)
    if (cleanStr.includes('@')) {
      const byEmail = users.find((u) => u.email?.toLowerCase() === cleanStr.toLowerCase());
      if (byEmail) return byEmail;
    }

    // 3. By Phone
    const cleanDigits = cleanStr.replace(/\D/g, '');
    if (cleanDigits.length >= 7) {
      const target10 = cleanDigits.slice(-10);
      const byPhone = users.find((u) => {
        if (!u.phone) return false;
        const uDigits = u.phone.toString().replace(/\D/g, '');
        return uDigits === cleanDigits || (target10.length >= 10 && uDigits.slice(-10) === target10);
      });
      if (byPhone) return byPhone;
    }

    // 4. By Full Name
    const byName = users.find((u) => u.full_name?.toLowerCase() === cleanStr.toLowerCase());
    if (byName) return byName;

    return null;
  }

  async updateProfile(id, updates) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id || (updates.email && u.email?.toLowerCase() === updates.email.toLowerCase()));
    let targetUser;
    if (idx === -1) {
      targetUser = {
        id: id || `usr_${Date.now()}`,
        ...updates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      users.push(targetUser);
    } else {
      users[idx] = { ...users[idx], ...updates, updated_at: new Date().toISOString() };
      targetUser = users[idx];
    }
    saveItem(STORAGE_KEYS.USERS, users);

    // Sync to MongoDB Backend
    try {
      await apiPut(`/users/${targetUser.id}`, targetUser);
    } catch (e) {
      console.warn('MongoDB updateProfile notice:', e.message);
    }

    return targetUser;
  }

  // --- Clubs ---
  getClubs(filterActiveOnly = true) {
    const clubs = loadItem(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
    if (filterActiveOnly) {
      return clubs.filter((c) => c.status === 'active');
    }
    return clubs;
  }

  getClubById(id) {
    const clubs = loadItem(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
    return clubs.find((c) => c.id === id || c.slug === id) || null;
  }

  async updateClub(id, updates) {
    const clubs = loadItem(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
    const idx = clubs.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Club not found');
    if (clubs[idx].status === 'suspended' && updates.status !== 'active') {
      throw new Error('This club is suspended and cannot be modified while suspended.');
    }
    clubs[idx] = { ...clubs[idx], ...updates, updated_at: new Date().toISOString() };
    saveItem(STORAGE_KEYS.CLUBS, clubs);

    // Sync to MongoDB Backend
    try {
      await apiPut(`/clubs/${id}`, updates);
    } catch (e) {
      console.warn('MongoDB updateClub notice:', e.message);
    }

    return clubs[idx];
  }

  async transferClubOwnership(clubId, targetUserId, currentUserId, targetUserObj = null) {
    const clubs = loadItem(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
    const clubIdx = clubs.findIndex((c) => c.id === clubId);
    if (clubIdx === -1) throw new Error('Club not found.');

    const club = clubs[clubIdx];
    if (club.status === 'suspended') {
      throw new Error('This club is suspended. Ownership cannot be transferred while suspended.');
    }

    const users = this.getUsers();
    let targetUser = users.find((u) => u.id === targetUserId);

    // If not found in local users but targetUserObj passed, persist and use it
    if (!targetUser && targetUserObj && (targetUserObj.id || targetUserObj.email)) {
      targetUser = {
        id: targetUserId || targetUserObj.id || generateUuid(),
        full_name: targetUserObj.full_name || 'Member',
        email: targetUserObj.email || '',
        phone: targetUserObj.phone || '',
        avatar_url: targetUserObj.avatar_url || '',
        role: targetUserObj.role || 'student',
      };
      await this.updateProfile(targetUser.id, targetUser);
    }

    // If still not found, check memberships
    if (!targetUser) {
      const mems = this.getMemberships();
      const mem = mems.find((m) => m.user_id === targetUserId);
      if (mem) {
        targetUser = {
          id: targetUserId,
          full_name: mem.user_name || mem.user?.full_name || 'Member',
          email: mem.user_email || mem.user?.email || '',
          phone: mem.user_phone || mem.user?.phone || '',
          role: 'student',
        };
        await this.updateProfile(targetUser.id, targetUser);
      }
    }

    if (!targetUser) throw new Error('Target recipient account not found.');

    const currentUser = users.find((u) => u.id === currentUserId) || this.getUserById(currentUserId);

    // 1. Update club record head & ownership
    clubs[clubIdx] = {
      ...club,
      club_head_id: targetUser.id,
      club_head_name: targetUser.full_name,
      club_head_email: targetUser.email,
      owner_id: targetUser.id,
      updated_at: new Date().toISOString(),
    };

    // 2. Update memberships
    const memberships = this.getMemberships();

    // Demote current owner to coordinator / manager
    if (currentUserId) {
      const currentMem = memberships.find(
        (m) => m.club_id === clubId && m.user_id === currentUserId
      );
      if (currentMem) {
        currentMem.membership_role = 'coordinator';
        currentMem.role = 'coordinator';
        currentMem.updated_at = new Date().toISOString();
      } else {
        memberships.push({
          id: generateUuid(),
          club_id: clubId,
          user_id: currentUserId,
          membership_role: 'coordinator',
          role: 'coordinator',
          status: 'approved',
          join_source: 'ownership_transfer',
          approved_at: new Date().toISOString(),
        });
      }
    }

    // Promote target user to owner
    const targetMem = memberships.find(
      (m) => m.club_id === clubId && m.user_id === targetUser.id
    );
    if (targetMem) {
      targetMem.membership_role = 'owner';
      targetMem.role = 'owner';
      targetMem.status = 'approved';
      targetMem.updated_at = new Date().toISOString();
    } else {
      memberships.push({
        id: generateUuid(),
        club_id: clubId,
        user_id: targetUser.id,
        membership_role: 'owner',
        role: 'owner',
        status: 'approved',
        join_source: 'ownership_transfer',
        approved_at: new Date().toISOString(),
      });
      clubs[clubIdx].member_count = (clubs[clubIdx].member_count || 1) + 1;
    }

    saveItem(STORAGE_KEYS.CLUBS, clubs);
    saveItem(STORAGE_KEYS.MEMBERSHIPS, memberships);

    // Sync to MongoDB Backend API
    try {
      await apiPost(`/clubs/${clubId}/transfer-ownership`, {
        targetUserId: targetUser.id,
        currentUserId,
        targetUser,
      });
    } catch (e) {
      // Fallback update individual endpoints
      try {
        await apiPut(`/clubs/${clubId}`, {
          club_head_id: targetUser.id,
          club_head_name: targetUser.full_name,
          club_head_email: targetUser.email,
          owner_id: targetUser.id,
        });
      } catch (e2) {}
    }

    // 3. Dispatch reactive notifications
    this.addNotification({
      user_id: targetUser.id,
      title: 'Club Ownership Transferred! 👑',
      message: `You are now the official owner of "${club.name}"! Ownership was transferred to you by ${currentUser?.full_name || 'the previous owner'}.`,
      type: 'ownership_transfer',
      link_url: '/owner/dashboard',
    });

    if (currentUserId) {
      this.addNotification({
        user_id: currentUserId,
        title: 'Ownership Transferred Successfully',
        message: `You successfully transferred ownership of "${club.name}" to ${targetUser.full_name}. Your role is now Club Coordinator.`,
        type: 'ownership_transfer',
        link_url: `/clubs/${clubId}`,
      });
    }

    // 4. Record audit log
    this.addAuditLog({
      actor_id: currentUserId,
      actor_name: currentUser?.full_name || 'Club Owner',
      action: 'club_ownership_transferred',
      description: `${currentUser?.full_name || 'Owner'} transferred ownership of "${club.name}" to ${targetUser.full_name} (${targetUser.email})`,
      type: 'transfer',
      target_id: clubId,
    });

    // 5. Dispatch cross-component updates
    window.dispatchEvent(new CustomEvent('cc_auth_changed', { detail: { user: currentUser } }));
    window.dispatchEvent(new CustomEvent('cc_storage_changed', { detail: { key: STORAGE_KEYS.CLUBS } }));

    return clubs[clubIdx];
  }

  // --- Memberships ---
  getMemberships() {
    return loadItem(STORAGE_KEYS.MEMBERSHIPS, INITIAL_MEMBERSHIPS);
  }

  getUserMemberships(userId) {
    const memberships = this.getMemberships();
    const userMems = memberships.filter((m) => m.user_id === userId && m.status === 'approved');
    const clubs = this.getClubs(false);
    return sortByLatest(
      userMems.map((m) => ({
        ...m,
        club: clubs.find((c) => c.id === m.club_id) || null,
      }))
    );
  }

  getClubMembers(clubId) {
    const memberships = this.getMemberships();
    const users = this.getUsers();
    const club = this.getClubById(clubId);

    const filtered = memberships.filter(
      (m) => m.club_id === clubId && (m.status === 'approved' || m.status === 'active')
    );

    // If club has a club_head_id / owner_id, ensure owner is present in the list
    const ownerUserId = club?.club_head_id || club?.owner_id;
    const hasOwnerInList = filtered.some((m) => {
      const u = users.find((usr) => usr.id === m.user_id);
      return (
        m.user_id === ownerUserId ||
        m.role === 'owner' ||
        m.membership_role === 'owner' ||
        (club?.club_head_email && u?.email && club.club_head_email.toLowerCase() === u.email.toLowerCase()) ||
        (club?.club_head_email && m.user_email && club.club_head_email.toLowerCase() === m.user_email.toLowerCase())
      );
    });

    if (club && ownerUserId && !hasOwnerInList) {
      const ownerUser = users.find(
        (u) =>
          u.id === ownerUserId ||
          (club.club_head_email && u.email && u.email.toLowerCase() === club.club_head_email.toLowerCase())
      );
      filtered.unshift({
        id: `mem_owner_${club.id}`,
        club_id: club.id,
        user_id: ownerUserId,
        role: 'owner',
        membership_role: 'owner',
        status: 'approved',
        joined_at: club.created_at || new Date().toISOString(),
        join_source: 'Club Founder',
        user: ownerUser || {
          id: ownerUserId,
          full_name: club.club_head_name || 'Club Owner',
          email: club.club_head_email || '',
          phone: club.club_head_phone || '',
        },
      });
    }

    return sortByLatest(
      filtered.map((m) => {
        const u = m.user || users.find((usr) => usr.id === m.user_id);
        const isOwner =
          m.membership_role === 'owner' ||
          m.role === 'owner' ||
          Boolean(
            club && (
              club.club_head_id === m.user_id ||
              club.owner_id === m.user_id ||
              (club.club_head_email && u?.email && club.club_head_email.toLowerCase() === u.email.toLowerCase()) ||
              (club.club_head_email && m.user_email && club.club_head_email.toLowerCase() === m.user_email.toLowerCase())
            )
          );
        const isCoord = !isOwner && (m.membership_role === 'coordinator' || m.membership_role === 'manager' || m.role === 'coordinator' || m.role === 'manager');
        const effectiveRole = isOwner ? 'owner' : (isCoord ? 'coordinator' : 'member');

        return {
          ...m,
          role: effectiveRole,
          membership_role: effectiveRole,
          join_source: isOwner ? 'Club Founder' : (m.join_source || 'direct member'),
          user: u || {
            id: m.user_id,
            full_name: m.user_name || (isOwner ? (club?.club_head_name || 'Club Owner') : 'Club Member'),
            email: m.user_email || (isOwner ? (club?.club_head_email || '') : 'member@studymyte.edu'),
            phone: m.user_phone || '',
          },
        };
      })
    );
  }

  isUserClubMember(userId, clubId) {
    if (!userId || !clubId) return false;
    const club = this.getClubById(clubId);
    if (club && (club.club_head_id === userId || club.owner_id === userId || (club.club_head_email && club.club_head_email.toLowerCase() === this.getUserById(userId)?.email?.toLowerCase()))) {
      return true;
    }
    const memberships = this.getMemberships();
    return memberships.some(
      (m) => m.user_id === userId && m.club_id === clubId && (m.status === 'approved' || m.status === 'active')
    );
  }

  getUserRoleInClub(userId, clubId) {
    if (!userId || !clubId) return null;
    const club = this.getClubById(clubId);
    if (club && (club.club_head_id === userId || club.owner_id === userId || (club.club_head_email && club.club_head_email.toLowerCase() === this.getUserById(userId)?.email?.toLowerCase()))) {
      return 'owner';
    }
    const memberships = this.getMemberships();
    const match = memberships.find(
      (m) => m.user_id === userId && m.club_id === clubId && (m.status === 'approved' || m.status === 'active')
    );
    if (match) {
      if (match.membership_role === 'owner' || match.role === 'owner') return 'owner';
      return match.membership_role || match.role || null;
    }
    return null;
  }

  // --- Membership Applications ---
  getMembershipApplications(clubId = null) {
    const apps = loadItem(STORAGE_KEYS.MEM_APPS, INITIAL_MEMBERSHIP_APPLICATIONS);
    if (clubId) {
      return sortByLatest(apps.filter((a) => a.club_id === clubId));
    }
    return sortByLatest(apps);
  }

  getUserMembershipApplications(userId) {
    const apps = loadItem(STORAGE_KEYS.MEM_APPS, INITIAL_MEMBERSHIP_APPLICATIONS);
    const clubs = this.getClubs(false);
    return sortByLatest(
      apps
        .filter((a) => a.user_id === userId)
        .map((a) => ({
          ...a,
          club: clubs.find((c) => c.id === a.club_id),
        }))
    );
  }

  async applyForMembership(clubId, user, details = {}) {
    const apps = this.getMembershipApplications();
    const existing = apps.find(
      (a) => a.club_id === clubId && a.user_id === user.id && a.status === 'pending'
    );
    if (existing) {
      throw new Error('You already have a pending application for this club.');
    }

    const userName = details.name || details.user_name || user.full_name || 'Member';
    const userEmail = details.email || details.user_email || user.email || '';
    const userPhone = details.phone || details.user_phone || user.phone || '';

    const newApp = {
      id: generateUuid(),
      club_id: clubId,
      user_id: user.id,
      user_name: userName,
      user_email: userEmail,
      user_phone: userPhone,
      statement_of_interest: details.statement_of_interest || 'Excited to contribute to club projects.',
      skills: details.skills || 'General interests',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    apps.unshift(newApp);
    saveItem(STORAGE_KEYS.MEM_APPS, apps);

    // Sync to MongoDB Backend (awaited!)
    try {
      await apiPost('/membership-applications', newApp);
    } catch (e) {
      console.warn('MongoDB membership app notice:', e.message);
    }

    // Audit log
    this.addAuditLog({
      actor_id: user.id,
      actor_name: user.full_name,
      action: 'membership_applied',
      description: `${user.full_name} requested to join ${this.getClubById(clubId)?.name || 'club'}`,
      type: 'membership_request',
      target_id: newApp.id,
    });

    return newApp;
  }

  async reviewMembershipApplication(applicationId, action, reviewer) {
    const apps = this.getMembershipApplications();
    const idx = apps.findIndex((a) => a.id === applicationId);
    if (idx === -1) throw new Error('Application not found');

    const app = apps[idx];
    app.status = action === 'approve' ? 'approved' : 'rejected';
    app.reviewed_by = reviewer.id;
    app.reviewed_at = new Date().toISOString();
    apps[idx] = app;
    saveItem(STORAGE_KEYS.MEM_APPS, apps);

    // Sync review status to MongoDB Backend
    try {
      await apiPut(`/membership-applications/${app.id}`, {
        status: app.status,
        reviewed_by: app.reviewed_by,
        reviewed_at: app.reviewed_at,
      });
    } catch (e) {
      console.warn('MongoDB review membership app notice:', e.message);
    }

    if (action === 'approve') {
      const memberships = this.getMemberships();
      const existingIdx = memberships.findIndex(
        (m) => m.club_id === app.club_id && m.user_id === app.user_id
      );
      let memRecord;
      if (existingIdx !== -1) {
        memberships[existingIdx].status = 'approved';
        memberships[existingIdx].membership_role = 'member';
        memRecord = memberships[existingIdx];
      } else {
        memRecord = {
          id: generateUuid(),
          club_id: app.club_id,
          user_id: app.user_id,
          membership_role: 'member',
          status: 'approved',
          join_source: 'application',
          approved_at: new Date().toISOString(),
        };
        memberships.push(memRecord);
      }
      saveItem(STORAGE_KEYS.MEMBERSHIPS, memberships);

      // Sync approved membership to MongoDB
      try {
        await apiPost('/sync/bulk', { memberships: [memRecord] });
      } catch (e) {
        console.warn('MongoDB sync membership notice:', e.message);
      }

      // Increment club member count
      const club = this.getClubById(app.club_id);
      if (club) {
        await this.updateClub(app.club_id, { member_count: (club.member_count || 0) + 1 });
      }

      // Notify applicant
      this.addNotification({
        user_id: app.user_id,
        title: 'Membership Approved! 🎉',
        message: `Your application to join ${club?.name || 'the club'} was approved.`,
        type: 'membership_update',
        link_url: `/clubs/${app.club_id}`,
      });
    }

    return app;
  }

  async updateMemberRole(clubId, userId, newRole, actorId) {
    const memberships = this.getMemberships();
    const idx = memberships.findIndex((m) => m.club_id === clubId && m.user_id === userId);
    if (idx === -1) throw new Error('Membership not found');

    if (newRole === 'coordinator') {
      const existingCoordinators = memberships.filter(
        (m) =>
          m.club_id === clubId &&
          (m.membership_role === 'coordinator' || m.role === 'coordinator') &&
          m.user_id !== userId &&
          m.status === 'approved'
      );
      if (existingCoordinators.length >= 4) {
        throw new Error('Maximum 4 Club Coordinators are allowed for this club.');
      }
    }

    memberships[idx].membership_role = newRole;
    memberships[idx].role = newRole;
    memberships[idx].updated_at = new Date().toISOString();
    saveItem(STORAGE_KEYS.MEMBERSHIPS, memberships);

    // Sync to MongoDB Backend
    try {
      await apiPut(`/memberships/${clubId}/${userId}/role`, { role: newRole });
    } catch (e) {
      console.warn('MongoDB updateMemberRole notice:', e.message);
    }

    return memberships[idx];
  }

  async removeMember(clubId, userId) {
    const club = this.getClubById(clubId);
    if (
      club &&
      (club.club_head_id === userId ||
        club.owner_id === userId ||
        (club.club_head_email && this.getUserById(userId)?.email?.toLowerCase() === club.club_head_email.toLowerCase()))
    ) {
      throw new Error('The Club Owner cannot be removed from the club.');
    }

    const memberships = this.getMemberships();
    const updated = memberships.filter((m) => !(m.club_id === clubId && m.user_id === userId));
    saveItem(STORAGE_KEYS.MEMBERSHIPS, updated);

    // Sync to MongoDB Backend
    try {
      await apiDelete(`/memberships?club_id=${clubId}&user_id=${userId}`);
    } catch (e) {
      console.warn('MongoDB removeMember notice:', e.message);
    }

    if (club && club.member_count > 0) {
      await this.updateClub(clubId, { member_count: club.member_count - 1 });
    }
    return true;
  }

  // --- Club Applications (Platform Registration) ---
  getClubApplications() {
    const apps = loadItem(STORAGE_KEYS.CLUB_APPS, INITIAL_CLUB_APPLICATIONS);
    return sortByLatest(apps);
  }

  async submitClubApplication(data, applicant) {
    const apps = this.getClubApplications();
    const newApp = {
      id: generateUuid(),
      ...data,
      applicant_id: applicant.id,
      applicant_name: data.owner_name || applicant.full_name,
      applicant_email: data.owner_email || applicant.email,
      applicant_phone: applicant.phone || data.applicant_phone || '+91 99999 00000',
      owner_name: data.owner_name || applicant.full_name,
      owner_email: data.owner_email || applicant.email,
      faculty_name: data.faculty_name || data.faculty_coordinator_name,
      faculty_email: data.faculty_email || data.faculty_coordinator_email || '',
      location: data.location || '',
      logo_url: data.logo_url || '',
      logo_public_id: data.logo_public_id || '',
      banner_url: data.banner_url || '',
      banner_public_id: data.banner_public_id || '',
      applications_open: data.applications_open !== false,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    apps.unshift(newApp);
    saveItem(STORAGE_KEYS.CLUB_APPS, apps);

    // Sync to MongoDB Backend (AWAITED - critical for admin visibility!)
    try {
      await apiPost('/club-applications', newApp);
    } catch (e) {
      console.warn('MongoDB club application submit notice:', e.message);
    }

    this.addAuditLog({
      actor_id: applicant.id,
      actor_name: applicant.full_name,
      action: 'club_registered',
      description: `${applicant.full_name} requested to create a club: ${data.club_name}`,
      type: 'club_application',
      target_id: newApp.id,
    });

    return newApp;
  }

  async reviewClubApplication(appId, action, admin, notes = '') {
    const apps = this.getClubApplications();
    const idx = apps.findIndex((a) => a.id === appId);
    if (idx === -1) throw new Error('Application not found');

    const app = apps[idx];
    app.status = action === 'approve' ? 'approved' : 'rejected';
    app.admin_notes = notes;
    app.reviewed_by = admin.id;
    app.reviewed_at = new Date().toISOString();
    apps[idx] = app;
    saveItem(STORAGE_KEYS.CLUB_APPS, apps);

    // Sync review status to MongoDB Backend
    try {
      await apiPut(`/club-applications/${app.id}`, {
        status: app.status,
        admin_notes: app.admin_notes,
        reviewed_by: app.reviewed_by,
        reviewed_at: app.reviewed_at,
      });
    } catch (e) {
      console.warn('MongoDB review club app notice:', e.message);
    }

    if (action === 'approve') {
      const clubs = this.getClubs(false);
      const slug = app.club_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newClubId = generateUuid();
      const newClub = {
        id: newClubId,
        name: app.club_name,
        slug,
        category: app.category || 'General',
        description: app.description || '',
        college_affiliation: app.college_affiliation || 'Campus Affiliation',
        official_email: app.official_email || 'club@studymyte.com',
        website_url: app.website_url || null,
        club_head_id: app.applicant_id,
        club_head_name: app.owner_name || app.applicant_name,
        club_head_email: app.owner_email || app.applicant_email,
        faculty_mentor_name: app.faculty_name || app.faculty_coordinator_name || 'Coordinator',
        faculty_mentor_email: app.faculty_email || '',
        location: app.location || '',
        meeting_location: app.location || '',
        applications_open: app.applications_open !== false,
        member_count: 1,
        established: new Date().getFullYear().toString(),
        tagline: app.description ? app.description.slice(0, 60) + '...' : 'Welcome to our club',
        meeting_schedule: 'TBD',
        logo_url: app.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(app.name || 'Club')}&backgroundColor=2463ff,7258ff`,
        logo_public_id: app.logo_public_id || null,
        banner_url: app.banner_url || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%231e1b4b"/><stop offset="100%" stop-color="%232463ff"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="system-ui,-apple-system,sans-serif" font-size="34" font-weight="700" letter-spacing="1" opacity="0.9">${encodeURIComponent(app.name || 'STUDENT CLUB')}</text></svg>`,
        banner_public_id: app.banner_public_id || null,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      clubs.unshift(newClub);
      saveItem(STORAGE_KEYS.CLUBS, clubs);

      // Add owner membership
      const memberships = this.getMemberships();
      const ownerMem = {
        id: generateUuid(),
        club_id: newClub.id,
        user_id: app.applicant_id,
        role: 'owner',
        membership_role: 'owner',
        status: 'approved',
        join_source: 'direct',
        approved_at: new Date().toISOString(),
      };
      memberships.push(ownerMem);
      saveItem(STORAGE_KEYS.MEMBERSHIPS, memberships);

      // Sync new approved club & membership to MongoDB Backend
      try {
        await apiPost('/clubs', newClub);
        await apiPost('/sync/bulk', { memberships: [ownerMem] });
      } catch (e) {
        console.warn('MongoDB sync new club notice:', e.message);
      }

      // Notify
      this.addNotification({
        user_id: app.applicant_id,
        title: 'Club Application Approved! 🎉',
        message: `Congratulations! "${newClub.name}" has been approved. You are now the official club owner.`,
        type: 'club_approval',
        link_url: `/clubs/${newClub.id}`,
      });
    }

    return app;
  }

  // --- Resources ---
  getResources(filters = {}) {
    let resources = loadItem(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    const clubs = this.getClubs(false);

    resources = resources.map((r) => ({
      ...r,
      club: clubs.find((c) => c.id === r.club_id) || { name: 'Club' },
    }));

    if (filters.club_id) {
      resources = resources.filter((r) => r.club_id === filters.club_id);
    }
    if (filters.category && filters.category !== 'All') {
      resources = resources.filter((r) => r.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      resources = resources.filter(
        (r) => r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
      );
    }
    return sortByLatest(resources);
  }

  async createResource(resourceData, user) {
    const resources = loadItem(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
    const newRes = {
      id: `res_${Date.now()}`,
      ...resourceData,
      is_protected: true,
      uploaded_by: user.id,
      created_at: new Date().toISOString(),
    };
    resources.unshift(newRes);
    saveItem(STORAGE_KEYS.RESOURCES, resources);

    // Sync to MongoDB Backend
    try {
      await apiPost('/resources', newRes);
    } catch (e) {
      console.warn('MongoDB createResource notice:', e.message);
    }

    const club = this.getClubById(resourceData.club_id);
    this.addAuditLog({
      actor_id: user.id,
      actor_name: user.full_name,
      action: 'resource_uploaded',
      description: `New resource uploaded in ${club?.name || 'Club'}: ${resourceData.title}`,
      type: 'resource',
      target_id: newRes.id,
    });

    return newRes;
  }

  downloadResource(resourceId, user) {
    const resources = this.getResources();
    const resource = resources.find((r) => r.id === resourceId);
    if (!resource) throw new Error('Resource not found');

    const isAdmin = user?.platform_role === 'admin';
    const isMember = user ? this.isUserClubMember(user.id, resource.club_id) : false;

    if (!isAdmin && !isMember) {
      throw new Error('Access denied. This resource is free and exclusive to approved members of this club.');
    }

    if (resource.file_data) {
      return {
        success: true,
        title: resource.title,
        download_url: resource.file_data,
        file_name: resource.file_name || `${resource.title}.pdf`,
      };
    }

    if (resource.file_url && resource.file_url.startsWith('http')) {
      return {
        success: true,
        title: resource.title,
        download_url: resource.file_url,
        file_name: resource.file_name || `${resource.title}.pdf`,
      };
    }

    // Fallback document download
    const blobContent = `%PDF-1.4\n1 0 obj << /Title (${resource.title}) /Creator (Club Collection) >>\nendobj\nstream\n${resource.title}\n${resource.description || ''}\nendstream\n%%EOF`;
    const blob = new Blob([blobContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    return {
      success: true,
      title: resource.title,
      download_url: url,
      file_name: resource.file_name || `${resource.title}.pdf`,
    };
  }

  // --- Announcements ---
  getAnnouncements(clubId = null) {
    let announcements = loadItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    const clubs = this.getClubs(false);
    announcements = announcements.map((a) => ({
      ...a,
      club: clubs.find((c) => c.id === a.club_id),
    }));

    if (clubId) {
      return sortByLatest(announcements.filter((a) => a.club_id === clubId));
    }
    return sortByLatest(announcements);
  }

  async createAnnouncement(data, user) {
    let announcements = loadItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    const newAnn = {
      id: generateUuid(),
      ...data,
      created_by: user?.id || 'lead',
      created_at: new Date().toISOString(),
    };
    announcements.unshift(newAnn);

    // Enforce maximum 10 latest announcements per club (auto-prune 11th and older)
    if (data.club_id) {
      const clubAnns = announcements.filter((a) => a.club_id === data.club_id);
      if (clubAnns.length > 10) {
        const keepIds = new Set(clubAnns.slice(0, 10).map((a) => a.id));
        const pruned = clubAnns.slice(10);
        announcements = announcements.filter((a) => a.club_id !== data.club_id || keepIds.has(a.id));
        for (const old of pruned) {
          apiDelete(`/announcements/${old.id}`).catch(() => {});
        }
      }
    }

    saveItem(STORAGE_KEYS.ANNOUNCEMENTS, announcements);

    // Sync to MongoDB Backend
    try {
      await apiPost('/announcements', newAnn);
    } catch (e) {
      console.warn('MongoDB createAnnouncement notice:', e.message);
    }

    // Broadcast instant notifications to club members
    try {
      const members = this.getClubMembers(data.club_id);
      for (const m of members) {
        if (m.user_id !== user?.id) {
          this.addNotification({
            user_id: m.user_id,
            title: `📢 Announcement: ${data.title}`,
            message: data.content,
            type: 'announcement',
            link_url: `/clubs/${data.club_id}`,
          });
        }
      }
    } catch (e) {}

    window.dispatchEvent(new Event('cc_storage_changed'));
    return newAnn;
  }

  // --- Events ---
  getEvents(clubId = null) {
    let events = loadItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const clubs = this.getClubs(false);
    events = events.map((e) => {
      const matchedClub = clubs.find((c) => c.id === e.club_id || c.slug === e.club_id);
      return {
        ...e,
        club: matchedClub,
        club_name: e.club_name || matchedClub?.name || '',
      };
    });
    if (clubId) {
      return sortByLatest(events.filter((e) => e.club_id === clubId));
    }
    return sortByLatest(events);
  }

  async createEvent(data, user) {
    const events = loadItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const club = data.club_id ? this.getClubById(data.club_id) : null;
    const newEvent = {
      id: generateUuid(),
      ...data,
      club_name: data.club_name || club?.name || '',
      created_by: user?.id,
      created_at: new Date().toISOString(),
    };
    events.unshift(newEvent);
    saveItem(STORAGE_KEYS.EVENTS, events);

    // Sync to MongoDB Backend
    try {
      await apiPost('/events', newEvent);
    } catch (e) {
      console.warn('MongoDB createEvent notice:', e.message);
    }

    window.dispatchEvent(new CustomEvent('cc_storage_changed'));
    return newEvent;
  }

  async updateEvent(id, updates) {
    const events = loadItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Event not found');

    events[idx] = { ...events[idx], ...updates, updated_at: new Date().toISOString() };
    saveItem(STORAGE_KEYS.EVENTS, events);

    // Sync to MongoDB Backend
    try {
      await apiPut(`/events/${id}`, updates);
    } catch (e) {
      console.warn('MongoDB updateEvent notice:', e.message);
    }

    return events[idx];
  }

  // --- Notifications ---
  getNotifications(userId) {
    const notifs = loadItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const userNotifs = notifs.filter((n) => n.user_id === userId);
    // Sort latest to oldest and ensure maximum 10 notifications
    return sortByLatest(userNotifs).slice(0, 10);
  }

  addNotification(notif) {
    let notifs = loadItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newN = {
      id: `notif_${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
      ...notif,
    };

    // Prepend new notification
    notifs.unshift(newN);

    // Limit notifications to maximum 10 per user: automatically purge 11th and older
    if (notif.user_id) {
      const userNotifs = sortByLatest(notifs.filter((n) => n.user_id === notif.user_id));
      const keptUserIds = new Set(userNotifs.slice(0, 10).map((n) => n.id));
      notifs = notifs.filter((n) => n.user_id !== notif.user_id || keptUserIds.has(n.id));
    }

    saveItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newN;
  }

  markNotificationAsRead(id) {
    const notifs = loadItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const idx = notifs.findIndex((n) => n.id === id);
    if (idx !== -1) {
      notifs[idx].is_read = true;
      saveItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  }

  // --- Audit Logs ---
  getAuditLogs() {
    const logs = loadItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    return sortByLatest(logs);
  }

  addAuditLog(log) {
    const logs = loadItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    const newLog = {
      id: `log_${Date.now()}`,
      time_ago: 'Just now',
      created_at: new Date().toISOString(),
      ...log,
    };
    logs.unshift(newLog);
    saveItem(STORAGE_KEYS.AUDIT_LOGS, logs);
    return newLog;
  }

  // --- Webhook & External Integrations ---
  syncExternalWebhook(clubId, event) {
    const { event_type, email, full_name, membership_role } = event;
    const users = this.getUsers();
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Auto-register external user if synchronized from verified portal
      user = {
        id: `usr_ext_${Date.now()}`,
        email: email.toLowerCase(),
        full_name: full_name || email.split('@')[0],
        platform_role: 'student',
        email_verified: true,
        phone_verified: false,
        created_at: new Date().toISOString(),
      };
      users.push(user);
      saveItem(STORAGE_KEYS.USERS, users);
    }

    if (event_type === 'member_added' || event_type === 'member_approved') {
      const memberships = this.getMemberships();
      const existingIdx = memberships.findIndex(
        (m) => m.club_id === clubId && m.user_id === user.id
      );

      if (existingIdx !== -1) {
        memberships[existingIdx].status = 'approved';
        memberships[existingIdx].membership_role = membership_role || 'member';
        memberships[existingIdx].updated_at = new Date().toISOString();
      } else {
        memberships.push({
          id: `mem_sync_${Date.now()}`,
          club_id: clubId,
          user_id: user.id,
          membership_role: membership_role || 'member',
          status: 'approved',
          join_source: 'external_sync',
          approved_at: new Date().toISOString(),
        });
      }
      saveItem(STORAGE_KEYS.MEMBERSHIPS, memberships);

      // Increment member count
      const club = this.getClubById(clubId);
      if (club) {
        this.updateClub(clubId, { member_count: (club.member_count || 0) + 1 });
      }

      this.addAuditLog({
        actor_id: user.id,
        actor_name: user.full_name,
        action: 'external_sync_approved',
        description: `External sync: Added member ${user.full_name} (${email}) to ${club?.name || 'club'}`,
        type: 'sync',
      });

      return { success: true, message: `Member ${user.full_name} synchronized successfully!` };
    }

    if (event_type === 'member_removed') {
      this.removeMember(clubId, user.id);
      return { success: true, message: `Member ${user.full_name} removed via sync.` };
    }

    return { success: false, message: 'Unsupported event type' };
  }

  importCsvRoster(clubId, rows) {
    let imported = 0;
    for (const row of rows) {
      if (!row.email) continue;
      this.syncExternalWebhook(clubId, {
        event_type: 'member_added',
        email: row.email,
        full_name: row.full_name || row.name,
        membership_role: row.role || 'member',
      });
      imported++;
    }
    return { success: true, count: imported };
  }

  // --- Club Invitations & 24hr Auto-Purge ---
  cleanupExpiredInvitations() {
    const invitations = loadItem(STORAGE_KEYS.INVITATIONS, []);
    const now = Date.now();
    let changed = false;

    const filtered = [];
    for (const inv of invitations) {
      const expiresAt = new Date(inv.expires_at).getTime();

      // Check if expired
      if (inv.status === 'active' && expiresAt <= now) {
        inv.status = 'expired';
        inv.deleted_at = new Date().toISOString();
        changed = true;
      }

      // Check if all restricted emails joined
      if (
        inv.status === 'active' &&
        inv.type === 'restricted' &&
        inv.allowed_emails &&
        inv.allowed_emails.length > 0 &&
        inv.allowed_emails.every((e) => e.joined)
      ) {
        inv.status = 'completed';
        inv.deleted_at = new Date().toISOString();
        changed = true;
      }

      // Check 24-hour purge rule after code is marked deleted/completed/expired
      if (inv.deleted_at) {
        const deletedTime = new Date(inv.deleted_at).getTime();
        if (now - deletedTime >= 24 * 60 * 60 * 1000) {
          // Purged completely from database/storage!
          changed = true;
          continue;
        }
      }

      filtered.push(inv);
    }

    if (changed) {
      saveItem(STORAGE_KEYS.INVITATIONS, filtered);
    }
    return filtered;
  }

  getInvitations(clubId) {
    const list = this.cleanupExpiredInvitations();
    const activeInvites = list.filter(
      (inv) =>
        inv.club_id === clubId &&
        (inv.status === 'active' || inv.status === 'completed') &&
        new Date(inv.expires_at).getTime() > Date.now()
    );

    // Sync remote in background
    try {
      fetch(`${API_URL}/invitations?club_id=${clubId}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((remoteList) => {
          if (Array.isArray(remoteList) && remoteList.length > 0) {
            const current = loadItem(STORAGE_KEYS.INVITATIONS, []);
            let modified = false;
            for (const r of remoteList) {
              const idx = current.findIndex((c) => c.id === r.id || c.code === r.code);
              if (idx !== -1) {
                const currentJoined = JSON.stringify(current[idx].allowed_emails || []);
                const remoteJoined = JSON.stringify(r.allowed_emails || []);
                if (currentJoined !== remoteJoined || current[idx].status !== r.status) {
                  current[idx] = { ...current[idx], ...r };
                  modified = true;
                }
              } else {
                current.push(r);
                modified = true;
              }
            }
            if (modified) {
              saveItem(STORAGE_KEYS.INVITATIONS, current);
              window.dispatchEvent(new Event('cc_storage_changed'));
            }
          }
        })
        .catch(() => {});
    } catch (e) {}

    return sortByLatest(activeInvites);
  }

  getInvitationByCode(code) {
    if (!code) return null;
    const list = this.cleanupExpiredInvitations();
    const cleanCode = code.trim().toUpperCase();
    return (
      list.find(
        (inv) =>
          inv.code?.toUpperCase() === cleanCode &&
          (inv.status === 'active' || inv.status === 'completed') &&
          new Date(inv.expires_at).getTime() > Date.now()
      ) || null
    );
  }

  async createInvitation(clubId, data, user) {
    this.cleanupExpiredInvitations();
    const invitations = loadItem(STORAGE_KEYS.INVITATIONS, []);

    const cleanCode = (data.code || `INV-${Math.random().toString(36).substr(2, 6)}`).trim().toUpperCase();
    const existing = invitations.find(
      (i) => i.code === cleanCode && i.status === 'active' && new Date(i.expires_at).getTime() > Date.now()
    );
    if (existing) {
      throw new Error('An active invitation with this code already exists. Please choose another code.');
    }

    const hours = Number(data.expiration_hours) || 24;
    const expiresAt = new Date(Date.now() + hours * 3600000).toISOString();

    const formattedEmails = (data.allowed_emails || [])
      .map((e) => {
        const emailStr = typeof e === 'string' ? e : e.email;
        return {
          email: emailStr?.toLowerCase().trim() || '',
          joined: false,
          joined_at: null,
          user_id: '',
          user_name: '',
        };
      })
      .filter((e) => e.email.length > 0);

    const token = data.token || encryptInvitationCode(cleanCode);
    const link = data.link || `${window.location.origin}/join/${token}`;

    const newInv = {
      id: generateUuid(),
      club_id: clubId,
      code: cleanCode,
      token,
      link,
      expiration_hours: hours,
      expires_at: expiresAt,
      type: data.type === 'restricted' ? 'restricted' : 'public',
      allowed_emails: formattedEmails,
      created_by: user?.id || 'owner',
      created_by_name: user?.full_name || 'Club Owner',
      created_by_role: data.created_by_role || 'owner',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    invitations.unshift(newInv);
    saveItem(STORAGE_KEYS.INVITATIONS, invitations);

    // Sync to MongoDB backend
    try {
      await apiPost('/invitations', newInv);
    } catch (e) {
      console.warn('MongoDB createInvitation notice:', e.message);
    }

    window.dispatchEvent(new Event('cc_storage_changed'));
    return newInv;
  }

  async updateInvitation(invitationId, updates) {
    const invitations = loadItem(STORAGE_KEYS.INVITATIONS, []);
    const idx = invitations.findIndex((i) => i.id === invitationId || i.code === invitationId);
    if (idx === -1) throw new Error('Invitation not found');

    const updatedInv = {
      ...invitations[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    invitations[idx] = updatedInv;
    saveItem(STORAGE_KEYS.INVITATIONS, invitations);

    try {
      await apiPut(`/invitations/${invitationId}`, updates);
    } catch (e) {
      console.warn('MongoDB updateInvitation notice:', e.message);
    }

    window.dispatchEvent(new Event('cc_storage_changed'));
    return updatedInv;
  }

  async deleteInvitation(invitationId) {
    const invitations = loadItem(STORAGE_KEYS.INVITATIONS, []);
    const idx = invitations.findIndex((i) => i.id === invitationId || i.code === invitationId);
    if (idx !== -1) {
      invitations[idx].status = 'deleted';
      invitations[idx].deleted_at = new Date().toISOString();
      saveItem(STORAGE_KEYS.INVITATIONS, invitations);
    }

    try {
      await apiDelete(`/invitations/${invitationId}`);
    } catch (e) {
      console.warn('MongoDB deleteInvitation notice:', e.message);
    }

    window.dispatchEvent(new Event('cc_storage_changed'));
    return true;
  }

  async redeemInvitation(code, user) {
    if (!code || !user) throw new Error('Invitation code and user are required.');
    this.cleanupExpiredInvitations();

    const cleanCode = code.trim().toUpperCase();
    const invitations = loadItem(STORAGE_KEYS.INVITATIONS, []);
    const invIdx = invitations.findIndex(
      (i) => i.code === cleanCode && (i.status === 'active' || i.status === 'completed') && new Date(i.expires_at).getTime() > Date.now()
    );

    if (invIdx === -1) {
      // Fetch and redeem from remote MongoDB
      try {
        const res = await fetch(`${API_URL}/invitations/redeem`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: cleanCode,
            user_id: user.id,
            user_email: user.email,
            user_name: user.full_name,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to redeem invitation code.');
        
        if (json.invitation) {
          const currentInvs = loadItem(STORAGE_KEYS.INVITATIONS, []);
          const idx = currentInvs.findIndex((i) => i.id === json.invitation.id || i.code === json.invitation.code);
          if (idx !== -1) {
            currentInvs[idx] = json.invitation;
          } else {
            currentInvs.unshift(json.invitation);
          }
          saveItem(STORAGE_KEYS.INVITATIONS, currentInvs);
        }

        // Add membership locally
        const memberships = this.getMemberships();
        if (!memberships.some((m) => m.club_id === json.club_id && m.user_id === user.id && m.status === 'approved')) {
          memberships.push({
            id: generateUuid(),
            club_id: json.club_id,
            user_id: user.id,
            membership_role: 'member',
            role: 'member',
            status: 'approved',
            join_source: 'invitation_code',
            approved_at: new Date().toISOString(),
          });
          saveItem(STORAGE_KEYS.MEMBERSHIPS, memberships);
          const club = this.getClubById(json.club_id);
          if (club) await this.updateClub(json.club_id, { member_count: (club.member_count || 0) + 1 });
        }
        window.dispatchEvent(new Event('cc_storage_changed'));
        return json;
      } catch (err) {
        throw new Error(err.message || 'Invalid invitation code or this invitation has expired.');
      }
    }

    const inv = invitations[invIdx];
    const userEmail = (user.email || '').toLowerCase().trim();

    // Restricted verification
    if (inv.type === 'restricted') {
      const matchSlot = inv.allowed_emails.find(
        (slot) => slot.email.toLowerCase() === userEmail
      );

      if (!matchSlot) {
        throw new Error(
          `Invalid code. Your email (${user.email}) is not on the exclusive invited roster for this club.`
        );
      }

      if (matchSlot.joined) {
        throw new Error('This invitation has already been redeemed for your email.');
      }

      matchSlot.joined = true;
      matchSlot.joined_at = new Date().toISOString();
      matchSlot.user_id = user.id;
      matchSlot.user_name = user.full_name;

      // Check if all members have joined!
      if (inv.allowed_emails.every((e) => e.joined)) {
        inv.status = 'completed';
        inv.deleted_at = new Date().toISOString();
      }

      invitations[invIdx] = inv;
      saveItem(STORAGE_KEYS.INVITATIONS, invitations);
    }

    // Add membership for user
    const memberships = this.getMemberships();
    const existing = memberships.find((m) => m.club_id === inv.club_id && m.user_id === user.id);
    if (!existing) {
      memberships.push({
        id: generateUuid(),
        club_id: inv.club_id,
        user_id: user.id,
        membership_role: 'member',
        role: 'member',
        status: 'approved',
        join_source: 'invitation_code',
        approved_at: new Date().toISOString(),
      });
      saveItem(STORAGE_KEYS.MEMBERSHIPS, memberships);
      const club = this.getClubById(inv.club_id);
      if (club) await this.updateClub(inv.club_id, { member_count: (club.member_count || 0) + 1 });
    } else if (existing.status !== 'approved') {
      existing.status = 'approved';
      existing.membership_role = 'member';
      existing.role = 'member';
      existing.approved_at = new Date().toISOString();
      saveItem(STORAGE_KEYS.MEMBERSHIPS, memberships);
    }

    // Sync remote
    try {
      const remoteRes = await apiPost('/invitations/redeem', {
        code: cleanCode,
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name,
      });
      if (remoteRes?.invitation) {
        const freshInvs = loadItem(STORAGE_KEYS.INVITATIONS, []);
        const targetIdx = freshInvs.findIndex((i) => i.id === remoteRes.invitation.id || i.code === remoteRes.invitation.code);
        if (targetIdx !== -1) {
          freshInvs[targetIdx] = remoteRes.invitation;
        } else {
          freshInvs.unshift(remoteRes.invitation);
        }
        saveItem(STORAGE_KEYS.INVITATIONS, freshInvs);
      }
    } catch (e) {
      console.warn('MongoDB redeem invitation notice:', e.message);
    }

    window.dispatchEvent(new Event('cc_storage_changed'));

    const club = this.getClubById(inv.club_id);
    return {
      success: true,
      club_id: inv.club_id,
      club_name: club?.name,
      message: `You have successfully joined ${club?.name || 'the club'}!`,
    };
  }

  // --- Administrative Deletion Methods (Syncs with MongoDB Atlas) ---
  async deleteClub(clubId) {
    let clubs = this.getClubs(false);
    const target = clubs.find((c) => c.id === clubId || c.slug === clubId);
    clubs = clubs.filter((c) => c.id !== clubId && c.slug !== clubId);
    saveItem(STORAGE_KEYS.CLUBS, clubs);

    // Cascade delete local memberships, apps, resources, events, announcements
    let mems = loadItem(STORAGE_KEYS.MEMBERSHIPS, []);
    saveItem(STORAGE_KEYS.MEMBERSHIPS, mems.filter((m) => m.club_id !== clubId));

    let memApps = loadItem(STORAGE_KEYS.MEM_APPS, []);
    saveItem(STORAGE_KEYS.MEM_APPS, memApps.filter((a) => a.club_id !== clubId));

    let res = loadItem(STORAGE_KEYS.RESOURCES, []);
    saveItem(STORAGE_KEYS.RESOURCES, res.filter((r) => r.club_id !== clubId));

    let ann = loadItem(STORAGE_KEYS.ANNOUNCEMENTS, []);
    saveItem(STORAGE_KEYS.ANNOUNCEMENTS, ann.filter((a) => a.club_id !== clubId));

    let ev = loadItem(STORAGE_KEYS.EVENTS, []);
    saveItem(STORAGE_KEYS.EVENTS, ev.filter((e) => e.club_id !== clubId));

    // Audit log
    this.addAuditLog({
      action: 'admin_delete_club',
      description: `Admin deleted club "${target?.name || clubId}"`,
      type: 'club',
      target_id: clubId,
    });

    try {
      await apiDelete(`/clubs/${encodeURIComponent(clubId)}`);
    } catch (e) {
      console.warn('MongoDB deleteClub notice:', e.message);
    }

    window.dispatchEvent(new CustomEvent('cc_storage_changed'));
    return true;
  }

  async deleteUser(userId) {
    let users = this.getUsers();
    const target = users.find((u) => u.id === userId || u.email === userId);
    users = users.filter((u) => u.id !== userId && u.email !== userId);
    saveItem(STORAGE_KEYS.USERS, users);

    let mems = loadItem(STORAGE_KEYS.MEMBERSHIPS, []);
    saveItem(STORAGE_KEYS.MEMBERSHIPS, mems.filter((m) => m.user_id !== userId));

    let memApps = loadItem(STORAGE_KEYS.MEM_APPS, []);
    saveItem(STORAGE_KEYS.MEM_APPS, memApps.filter((a) => a.user_id !== userId));

    this.addAuditLog({
      action: 'admin_delete_user',
      description: `Admin deleted user "${target?.full_name || userId}" (${target?.email || ''})`,
      type: 'user',
      target_id: userId,
    });

    try {
      await apiDelete(`/users/${encodeURIComponent(userId)}`);
    } catch (e) {
      console.warn('MongoDB deleteUser notice:', e.message);
    }

    window.dispatchEvent(new CustomEvent('cc_storage_changed'));
    return true;
  }

  async deleteClubApplication(appId) {
    let apps = loadItem(STORAGE_KEYS.CLUB_APPS, []);
    const target = apps.find((a) => a.id === appId);
    apps = apps.filter((a) => a.id !== appId);
    saveItem(STORAGE_KEYS.CLUB_APPS, apps);

    this.addAuditLog({
      action: 'admin_delete_club_app',
      description: `Admin deleted club registration application for "${target?.club_name || appId}"`,
      type: 'application',
      target_id: appId,
    });

    try {
      await apiDelete(`/club-applications/${encodeURIComponent(appId)}`);
    } catch (e) {
      console.warn('MongoDB deleteClubApplication notice:', e.message);
    }

    window.dispatchEvent(new CustomEvent('cc_storage_changed'));
    return true;
  }

  async deleteMembershipApplication(appId) {
    let apps = loadItem(STORAGE_KEYS.MEM_APPS, []);
    apps = apps.filter((a) => a.id !== appId);
    saveItem(STORAGE_KEYS.MEM_APPS, apps);

    try {
      await apiDelete(`/membership-applications/${encodeURIComponent(appId)}`);
    } catch (e) {
      console.warn('MongoDB deleteMembershipApplication notice:', e.message);
    }

    window.dispatchEvent(new CustomEvent('cc_storage_changed'));
    return true;
  }

  async deleteResource(resourceId) {
    let res = loadItem(STORAGE_KEYS.RESOURCES, []);
    res = res.filter((r) => r.id !== resourceId);
    saveItem(STORAGE_KEYS.RESOURCES, res);

    try {
      await apiDelete(`/resources/${encodeURIComponent(resourceId)}`);
    } catch (e) {
      console.warn('MongoDB deleteResource notice:', e.message);
    }

    window.dispatchEvent(new CustomEvent('cc_storage_changed'));
    return true;
  }

  async deleteAnnouncement(annId) {
    let ann = loadItem(STORAGE_KEYS.ANNOUNCEMENTS, []);
    ann = ann.filter((a) => a.id !== annId);
    saveItem(STORAGE_KEYS.ANNOUNCEMENTS, ann);

    try {
      await apiDelete(`/announcements/${encodeURIComponent(annId)}`);
    } catch (e) {
      console.warn('MongoDB deleteAnnouncement notice:', e.message);
    }

    window.dispatchEvent(new CustomEvent('cc_storage_changed'));
    return true;
  }

  async deleteEvent(eventId) {
    let ev = loadItem(STORAGE_KEYS.EVENTS, []);
    ev = ev.filter((e) => e.id !== eventId);
    saveItem(STORAGE_KEYS.EVENTS, ev);

    try {
      await apiDelete(`/events/${encodeURIComponent(eventId)}`);
    } catch (e) {
      console.warn('MongoDB deleteEvent notice:', e.message);
    }

    window.dispatchEvent(new CustomEvent('cc_storage_changed'));
    return true;
  }
}

export const storageEngine = new StorageEngine();
