import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateInvitationCode,
  encryptInvitationCode,
  decryptInvitationCode,
  calculateTimeRemaining,
} from '../utils/invitationCrypto';
import { storageEngine } from '../services/storageEngine';
import { invitationService } from '../services/invitationService';

describe('Invitation Code Generation & Crypto Engine', () => {
  it('generates strictly 8-character codes: 4 uppercase letters followed by 4 digits', () => {
    const code = generateInvitationCode();
    expect(code).toHaveLength(8);
    expect(/^[A-Z]{4}[0-9]{4}$/.test(code)).toBe(true);
  });

  it('generates non-fixed random starting letters', () => {
    const codes = Array.from({ length: 15 }, () => generateInvitationCode());
    const starts = new Set(codes.map((c) => c.slice(0, 2)));
    // With 15 random codes, we should have multiple distinct starts (no fixed prefix)
    expect(starts.size).toBeGreaterThan(1);
    codes.forEach((c) => {
      expect(/^[A-Z]{4}[0-9]{4}$/.test(c)).toBe(true);
    });
  });

  it('encrypts code in link token with enc_ prefix and decrypts back to exact code', () => {
    const plainCode = 'LGIE8725';
    const encryptedToken = encryptInvitationCode(plainCode);

    expect(encryptedToken.startsWith('enc_')).toBe(true);
    expect(encryptedToken).not.toBe(plainCode);

    const decrypted = decryptInvitationCode(encryptedToken);
    expect(decrypted).toBe(plainCode);
  });

  it('correctly extracts and decrypts code from full invitation URLs', () => {
    const plainCode = 'ABCD1234';
    const encryptedToken = encryptInvitationCode(plainCode);
    const fullUrl = `https://studymyte.com/join/${encryptedToken}`;

    const decrypted = decryptInvitationCode(fullUrl);
    expect(decrypted).toBe(plainCode);
  });

  it('passes unencrypted plain codes through safely', () => {
    const plainCode = 'LGIE8725';
    const decrypted = decryptInvitationCode(plainCode);
    expect(decrypted).toBe(plainCode);
  });

  it('calculates ticking time remaining until expiration', () => {
    const oneHourFromNow = new Date(Date.now() + 65 * 60 * 1000).toISOString();
    const remaining = calculateTimeRemaining(oneHourFromNow);

    expect(remaining.isExpired).toBe(false);
    expect(remaining.hours).toBe(1);
    expect(remaining.formatted).toMatch(/^\d{2}h \d{2}m \d{2}s$/);

    const pastTime = new Date(Date.now() - 10000).toISOString();
    const expired = calculateTimeRemaining(pastTime);
    expect(expired.isExpired).toBe(true);
  });
});

describe('Restricted Invitation Roster Management', () => {
  const testClubId = 'club_test_roster';
  const testUser = { id: 'usr_owner_test', full_name: 'Test Owner', email: 'owner@test.com' };

  it('creates a restricted invitation and allows owner to edit/add/remove allowed emails', async () => {
    const initialCode = generateInvitationCode();
    const inv = await invitationService.createInvitation(
      testClubId,
      {
        code: initialCode,
        type: 'restricted',
        allowed_emails: ['student1@test.com', 'student2@test.com'],
        expiration_hours: 24,
      },
      testUser
    );

    expect(inv.code).toBe(initialCode);
    expect(inv.type).toBe('restricted');
    expect(inv.allowed_emails).toHaveLength(2);

    // Edit roster: add student3 and remove student1
    const updatedEmails = [
      { email: 'student2@test.com', joined: false },
      { email: 'student3@test.com', joined: false },
    ];
    const updated = await invitationService.updateInvitation(inv.id, {
      allowed_emails: updatedEmails,
    });

    expect(updated.allowed_emails).toHaveLength(2);
    expect(updated.allowed_emails.map((e) => e.email)).toEqual(['student2@test.com', 'student3@test.com']);
  });
});
