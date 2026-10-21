import { storageEngine } from './storageEngine';

export const resourceService = {
  getResources(filters = {}) {
    return storageEngine.getResources(filters);
  },

  async createResource(resourceData, user) {
    const isAdmin = Boolean(user?.platform_role === 'admin' || user?.is_admin || user?.role === 'admin');
    const userRole = storageEngine.getUserRoleInClub(user?.id, resourceData.club_id);
    if (!isAdmin && userRole !== 'owner' && userRole !== 'manager') {
      throw new Error('Only club owners, managers, and administrators can upload resources.');
    }
    return await storageEngine.createResource(resourceData, user);
  },

  async deleteResource(resourceId, clubId, user) {
    const isAdmin = Boolean(user?.platform_role === 'admin' || user?.is_admin || user?.role === 'admin');
    const userRole = clubId ? storageEngine.getUserRoleInClub(user?.id, clubId) : null;
    if (!isAdmin && userRole !== 'owner' && userRole !== 'manager') {
      throw new Error('Only club owners, managers, and administrators can delete resources.');
    }
    return await storageEngine.deleteResource(resourceId);
  },

  downloadResource(resourceId, user) {
    return storageEngine.downloadResource(resourceId, user);
  },
};
