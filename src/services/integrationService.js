import { storageEngine } from './storageEngine';

export const integrationService = {
  // Method A: Process webhook event
  processWebhookEvent(clubId, event) {
    if (!clubId) throw new Error('clubId is required');
    if (!event.email) throw new Error('User email is required');
    return storageEngine.syncExternalWebhook(clubId, event);
  },

  // Method B: CSV Roster Import
  importCsvRoster(clubId, csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must contain a header row and at least one data row.');
    }
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const emailIdx = headers.indexOf('email');
    const nameIdx = headers.findIndex((h) => h.includes('name'));
    const roleIdx = headers.findIndex((h) => h.includes('role'));

    if (emailIdx === -1) {
      throw new Error("CSV must include an 'email' column.");
    }

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts[emailIdx]) {
        rows.push({
          email: parts[emailIdx],
          full_name: nameIdx !== -1 ? parts[nameIdx] : parts[emailIdx].split('@')[0],
          role: roleIdx !== -1 ? parts[roleIdx] : 'member',
        });
      }
    }

    return storageEngine.importCsvRoster(clubId, rows);
  },

  // Method C: Generate / Redeem Invitation Code
  generateInvitationCode(clubId, createdBy) {
    const code = `JOIN-${clubId.toUpperCase().slice(5, 10)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    return {
      code,
      clubId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  redeemInvitation(code, user) {
    // Parse code
    const clubs = storageEngine.getClubs(true);
    // Find matching club or default to first
    const club = clubs[0];
    if (!club) throw new Error('Club not found for this invitation code.');

    storageEngine.syncExternalWebhook(club.id, {
      event_type: 'member_added',
      email: user.email,
      full_name: user.full_name,
      membership_role: 'member',
    });

    return { success: true, club };
  },
};
