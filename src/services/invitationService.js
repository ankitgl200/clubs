import { storageEngine } from './storageEngine';
import {
  generateInvitationCode,
  encryptInvitationCode,
  decryptInvitationCode,
} from '../utils/invitationCrypto';

export {
  generateInvitationCode,
  encryptInvitationCode,
  decryptInvitationCode,
};

export const invitationService = {
  getInvitations(clubId) {
    return storageEngine.getInvitations(clubId);
  },

  getInvitationByCode(code) {
    return storageEngine.getInvitationByCode(code);
  },

  createInvitation(clubId, data, user) {
    return storageEngine.createInvitation(clubId, data, user);
  },

  updateInvitation(invitationId, updates) {
    return storageEngine.updateInvitation(invitationId, updates);
  },

  deleteInvitation(invitationId) {
    return storageEngine.deleteInvitation(invitationId);
  },

  redeemInvitation(code, user) {
    return storageEngine.redeemInvitation(code, user);
  },
};
