import { storageEngine } from './storageEngine';
import { API_URL } from '../config/api';

export const clubService = {
  getClubs(filterActiveOnly = true) {
    return storageEngine.getClubs(filterActiveOnly);
  },

  getClubById(id) {
    return storageEngine.getClubById(id);
  },

  updateClub(id, updates) {
    return storageEngine.updateClub(id, updates);
  },

  async submitClubApplication(data, applicant) {
    return await storageEngine.submitClubApplication(data, applicant);
  },

  getEvents(clubId = null) {
    return storageEngine.getEvents(clubId);
  },

  async createEvent(data, user) {
    return await storageEngine.createEvent(data, user);
  },

  async updateEvent(id, updates) {
    return await storageEngine.updateEvent(id, updates);
  },

  async deleteEvent(id) {
    return await storageEngine.deleteEvent(id);
  },

  async findUser(identifier) {
    if (!identifier) return null;
    const cleanStr = identifier.toString().trim();
    if (!cleanStr) return null;

    // 1. StorageEngine local search first (instant)
    const localMatch = storageEngine.findUser(cleanStr);
    if (localMatch) return localMatch;

    // 2. MongoDB backend API search
    try {
      const res = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(cleanStr)}`);
      if (res.ok) {
        const users = await res.json();
        if (Array.isArray(users) && users.length > 0) {
          const matched = users[0];
          storageEngine.updateProfile(matched.id, matched);
          return matched;
        }
      }
    } catch (e) {}

    return null;
  },

  async findUserByPhone(phone) {
    return this.findUser(phone);
  },

  async transferOwnership(clubId, targetUserId, currentUserId, targetUserObj = null) {
    return storageEngine.transferClubOwnership(clubId, targetUserId, currentUserId, targetUserObj);
  },
};
