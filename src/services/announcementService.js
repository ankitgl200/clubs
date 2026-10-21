import { storageEngine } from './storageEngine';

export const announcementService = {
  getAnnouncements(clubId = null) {
    return storageEngine.getAnnouncements(clubId);
  },

  async createAnnouncement(data, user) {
    const isAdmin = Boolean(user?.platform_role === 'admin' || user?.is_admin || user?.role === 'admin');
    const userRole = storageEngine.getUserRoleInClub(user?.id, data.club_id);
    if (!isAdmin && userRole !== 'owner' && userRole !== 'manager') {
      throw new Error('Only club owners, managers, and administrators can publish announcements.');
    }
    return await storageEngine.createAnnouncement(data, user);
  },

  async deleteAnnouncement(id, clubId, user) {
    const isAdmin = Boolean(user?.platform_role === 'admin' || user?.is_admin || user?.role === 'admin');
    const userRole = clubId ? storageEngine.getUserRoleInClub(user?.id, clubId) : null;
    if (!isAdmin && userRole !== 'owner' && userRole !== 'manager') {
      throw new Error('Only club leaders and administrators can delete announcements.');
    }
    return await storageEngine.deleteAnnouncement(id);
  },
};
