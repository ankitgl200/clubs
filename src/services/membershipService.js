import { storageEngine } from './storageEngine';

export const membershipService = {
  getUserMemberships(userId) {
    return storageEngine.getUserMemberships(userId);
  },

  getClubMembers(clubId) {
    return storageEngine.getClubMembers(clubId);
  },

  isUserClubMember(userId, clubId) {
    return storageEngine.isUserClubMember(userId, clubId);
  },

  getUserRoleInClub(userId, clubId) {
    return storageEngine.getUserRoleInClub(userId, clubId);
  },

  getMembershipApplications(clubId = null) {
    return storageEngine.getMembershipApplications(clubId);
  },

  getUserMembershipApplications(userId) {
    return storageEngine.getUserMembershipApplications(userId);
  },

  async applyForMembership(clubId, user, details) {
    return await storageEngine.applyForMembership(clubId, user, details);
  },

  async reviewMembershipApplication(applicationId, action, reviewer) {
    return await storageEngine.reviewMembershipApplication(applicationId, action, reviewer);
  },

  async updateMemberRole(clubId, userId, newRole, actorId) {
    return await storageEngine.updateMemberRole(clubId, userId, newRole, actorId);
  },

  async removeMember(clubId, userId) {
    return await storageEngine.removeMember(clubId, userId);
  },
};
