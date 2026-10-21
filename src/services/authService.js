// ==============================================================================
// AUTH SERVICE (100% MONGODB ATLAS POWERED)
// ==============================================================================

import { storageEngine } from './storageEngine';
import { API_URL } from '../config/api';

const AUTH_STORAGE_KEY = 'cc_current_user_v1';

export const authService = {
  // Get currently logged-in user from cache
  getCurrentUser() {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
      const u = JSON.parse(raw);
      const latest = storageEngine.getUserById(u.id);
      return latest || u;
    } catch {
      return null;
    }
  },

  // Initialize session from MongoDB backend or local cache
  async initSession() {
    const cached = this.getCurrentUser();
    if (cached) {
      window.dispatchEvent(new CustomEvent('cc_auth_changed', { detail: { user: cached } }));

      // Fetch fresh user profile from MongoDB Atlas so any role or admin flag changed in DB is immediately active
      try {
        const identifier = cached.id || cached.email;
        if (identifier) {
          const res = await fetch(`${API_URL}/users/${encodeURIComponent(identifier)}`);
          if (res.ok) {
            const dbUser = await res.json();
            if (dbUser && dbUser.email) {
              const isAdmin = Boolean(dbUser.is_admin || dbUser.role === 'admin');
              const refreshedUser = {
                ...cached,
                ...dbUser,
                is_admin: isAdmin,
                role: isAdmin ? 'admin' : (dbUser.role || 'student'),
                platform_role: isAdmin ? 'admin' : (dbUser.role || 'student'),
              };
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(refreshedUser));
              storageEngine.updateProfile(refreshedUser.id, refreshedUser);
              window.dispatchEvent(new CustomEvent('cc_auth_changed', { detail: { user: refreshedUser } }));
              return refreshedUser;
            }
          }
        }
      } catch (err) {
        // Fallback to cached profile if backend unreachable
      }
    }
    return cached;
  },

  // Login via MongoDB Atlas Backend
  async login(identifierOrObj, pass) {
    const identifier = typeof identifierOrObj === 'object' && identifierOrObj !== null
      ? identifierOrObj.identifier || identifierOrObj.email
      : identifierOrObj;
    const password = typeof identifierOrObj === 'object' && identifierOrObj !== null
      ? identifierOrObj.password
      : pass;

    const cleanId = (identifier || '').trim();

    try {
      // 1. Try login directly through MongoDB API
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanId, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        const isAdmin = Boolean(data.user.is_admin || data.user.role === 'admin');
        const user = {
          ...data.user,
          is_admin: isAdmin,
          role: isAdmin ? 'admin' : (data.user.role || 'student'),
          platform_role: isAdmin ? 'admin' : (data.user.role || 'student'),
        };

        if (data.token) {
          localStorage.setItem('cc_jwt_token', data.token);
        }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        storageEngine.updateProfile(user.id, user);
        window.dispatchEvent(new CustomEvent('cc_auth_changed', { detail: { user } }));
        return user;
      }

      // If backend returns 404, check local cache fallback for email or phone
      if (res.status === 404) {
        const localMatch = cleanId.includes('@')
          ? storageEngine.getUserByEmail(cleanId)
          : storageEngine.findUserByPhone(cleanId);
        if (localMatch && (!localMatch.password || localMatch.password === password)) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(localMatch));
          window.dispatchEvent(new CustomEvent('cc_auth_changed', { detail: { user: localMatch } }));
          return localMatch;
        }
        throw new Error(data.error || 'Invalid email/phone or password. Please try again.');
      }

      if (res.status === 401) {
        throw new Error(data.error || 'Invalid email/phone or password. Please try again.');
      }
    } catch (apiErr) {
      if (apiErr.message && !apiErr.message.includes('fetch')) {
        throw apiErr;
      }
    }

    // 2. Local resilient fallback check
    const users = storageEngine.getUsers();
    const user = users.find(
      (u) =>
        (u.email.toLowerCase() === cleanId.toLowerCase() || (u.phone && u.phone.includes(cleanId))) &&
        (!u.password || u.password === password)
    );

    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('cc_auth_changed', { detail: { user } }));
      return user;
    }

    throw new Error('Invalid email/phone or password. Please verify your credentials and try again.');
  },

  // Register a new user in MongoDB Atlas
  async register({ full_name, email, phone, password, registered_with_club, club_id, avatar_url, avatar_public_id }) {
    const cleanEmail = email.trim().toLowerCase();
    const defaultAvatar =
      avatar_url ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(full_name)}&backgroundColor=2463ff,7258ff`;

    const existingLocal = storageEngine.getUserByEmail(cleanEmail);
    if (existingLocal) {
      throw new Error('An account with this email already exists.');
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const newUserPayload = {
      id: userId,
      full_name,
      email: cleanEmail,
      phone: phone || '',
      password,
      role: 'student',
      avatar_url: defaultAvatar,
      avatar_public_id: avatar_public_id || '',
    };

    try {
      // Register into MongoDB Atlas API
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed in MongoDB.');
      }

      const registeredUser = {
        ...data.user,
        platform_role: 'student',
        email_verified: true,
      };

      if (data.token) {
        localStorage.setItem('cc_jwt_token', data.token);
      }

      // Save to local storage cache
      storageEngine.updateProfile(registeredUser.id, registeredUser);

      // Handle club application if specified
      if (registered_with_club && club_id) {
        try {
          storageEngine.applyForMembership(club_id, registeredUser, {
            phone: phone || '',
            statement_of_interest: 'Claimed existing club affiliation during platform registration.',
          });
        } catch (e) {}
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(registeredUser));
      window.dispatchEvent(new CustomEvent('cc_auth_changed', { detail: { user: registeredUser } }));
      return registeredUser;
    } catch (err) {
      console.error('Registration failed:', err);
      if (err.message && err.message.toLowerCase().includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please verify your network connection.');
      }
      throw err;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('cc_jwt_token');
    window.dispatchEvent(new CustomEvent('cc_auth_changed', { detail: { user: null } }));
  },

  // Update profile in MongoDB & local cache
  async updateProfile(userId, updates) {
    const cachedUser = this.getCurrentUser() || {};
    const mergedUser = { ...cachedUser, ...updates };

    try {
      await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('MongoDB profile update notice:', e);
    }

    const updated = storageEngine.updateProfile(userId, mergedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('cc_auth_changed', { detail: { user: updated } }));
    return updated;
  },
};
