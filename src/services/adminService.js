import { storageEngine } from './storageEngine';

export const adminService = {
  getStats() {
    const clubs = storageEngine.getClubs(false);
    const users = storageEngine.getUsers();
    const resources = storageEngine.getResources();
    const memberships = storageEngine.getMemberships();
    const clubApps = storageEngine.getClubApplications().filter((a) => a.status === 'pending');
    const memApps = storageEngine.getMembershipApplications().filter((a) => a.status === 'pending');

    const totalMembers = Math.max(users.length, memberships.length);

    return {
      totalClubs: clubs.length,
      activeClubs: clubs.filter((c) => c.status === 'active').length,
      totalStudents: users.length,
      totalMembers: totalMembers,
      totalResources: resources.length,
      pendingRequests: clubApps.length + memApps.length,
      rawStats: {
        clubs: clubs.length,
        users: users.length,
        resources: resources.length,
        pendingClubApps: clubApps.length,
        pendingMemApps: memApps.length,
      },
    };
  },

  getAllClubs() {
    return storageEngine.getClubs(false);
  },

  getAllUsers() {
    return storageEngine.getUsers();
  },

  getAllResources() {
    return storageEngine.getResources();
  },

  getClubApplications() {
    return storageEngine.getClubApplications();
  },

  async reviewClubApplication(appId, action, admin, notes) {
    return await storageEngine.reviewClubApplication(appId, action, admin, notes);
  },

  toggleClubStatus(clubId, newStatus) {
    return storageEngine.updateClub(clubId, { status: newStatus });
  },

  getAuditLogs() {
    return storageEngine.getAuditLogs();
  },

  async deleteClub(clubId) {
    return storageEngine.deleteClub(clubId);
  },

  async deleteUser(userId) {
    return storageEngine.deleteUser(userId);
  },

  async deleteClubApplication(appId) {
    return storageEngine.deleteClubApplication(appId);
  },

  async deleteMembershipApplication(appId) {
    return storageEngine.deleteMembershipApplication(appId);
  },

  async deleteResource(resourceId) {
    return storageEngine.deleteResource(resourceId);
  },

  async deleteAnnouncement(annId) {
    return storageEngine.deleteAnnouncement(annId);
  },

  async deleteEvent(eventId) {
    return storageEngine.deleteEvent(eventId);
  },
};
