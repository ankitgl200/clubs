import { storageEngine } from './storageEngine';

export const notificationService = {
  getNotifications(userId) {
    return storageEngine.getNotifications(userId);
  },

  markAsRead(id) {
    return storageEngine.markNotificationAsRead(id);
  },

  sendNotification(notif) {
    return storageEngine.addNotification(notif);
  },
};
