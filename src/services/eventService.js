import { storageEngine } from './storageEngine';

export const eventService = {
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
};
