import { describe, it, expect, beforeEach } from 'vitest';
import { clubService } from '../services/clubService';
import { membershipService } from '../services/membershipService';
import { storageEngine } from '../services/storageEngine';
import { seedTestEnvironment } from './testFixtures';

describe('Club Ownership Transfer System', () => {
  beforeEach(() => {
    localStorage.clear();
    storageEngine.init();
    seedTestEnvironment();
  });

  const rohanOwnerId = 'usr_rohan_verma';
  const priyaManagerId = 'usr_priya_patel';
  const aryanStudentId = 'usr_aryan_sharma';
  const clubId = 'club_robotics';

  it('finds recipient user by phone or email', async () => {
    // Lookup by phone
    const byPhone = await clubService.findUser('+91 98765 22222');
    expect(byPhone).toBeDefined();
    expect(byPhone.id).toBe(priyaManagerId);

    // Lookup by email
    const byEmail = await clubService.findUser('priya.patel@studymyte.edu');
    expect(byEmail).toBeDefined();
    expect(byEmail.id).toBe(priyaManagerId);

    // Lookup by 10 digit number
    const byDigits = await clubService.findUser('9876522222');
    expect(byDigits).toBeDefined();
    expect(byDigits.id).toBe(priyaManagerId);
  });

  it('successfully transfers ownership to an existing coordinator/manager', async () => {
    const updatedClub = await clubService.transferOwnership(clubId, priyaManagerId, rohanOwnerId);

    expect(updatedClub.club_head_id).toBe(priyaManagerId);
    expect(updatedClub.club_head_name).toBe('Priya Patel');
    expect(updatedClub.club_head_email).toBe('priya.patel@studymyte.edu');

    // Check roles
    const priyaRole = membershipService.getUserRoleInClub(priyaManagerId, clubId);
    expect(priyaRole).toBe('owner');

    const rohanRole = membershipService.getUserRoleInClub(rohanOwnerId, clubId);
    expect(rohanRole).toBe('coordinator');

    // Check notifications
    const priyaNotes = storageEngine.getNotifications(priyaManagerId);
    expect(priyaNotes.some((n) => n.type === 'ownership_transfer')).toBe(true);

    const rohanNotes = storageEngine.getNotifications(rohanOwnerId);
    expect(rohanNotes.some((n) => n.type === 'ownership_transfer')).toBe(true);
  });

  it('successfully transfers ownership directly to a regular member', async () => {
    const updatedClub = await clubService.transferOwnership(clubId, aryanStudentId, rohanOwnerId);

    expect(updatedClub.club_head_id).toBe(aryanStudentId);
    expect(updatedClub.club_head_name).toBe('Aryan Sharma');

    const aryanRole = membershipService.getUserRoleInClub(aryanStudentId, clubId);
    expect(aryanRole).toBe('owner');

    const rohanRole = membershipService.getUserRoleInClub(rohanOwnerId, clubId);
    expect(rohanRole).toBe('coordinator');
  });

  it('successfully transfers ownership using targetUserObj fallback if user not in local table', async () => {
    const externalUser = {
      id: 'usr_external_99',
      full_name: 'Dr. Anita Roy',
      email: 'anita.roy@studymyte.edu',
      phone: '+91 99999 88888',
      role: 'student',
    };

    const updatedClub = await clubService.transferOwnership(clubId, externalUser.id, rohanOwnerId, externalUser);
    expect(updatedClub.club_head_id).toBe(externalUser.id);
    expect(updatedClub.club_head_name).toBe('Dr. Anita Roy');

    const role = membershipService.getUserRoleInClub(externalUser.id, clubId);
    expect(role).toBe('owner');
  });

  it('blocks ownership transfer on a suspended club', async () => {
    storageEngine.updateClub(clubId, { status: 'suspended' });

    await expect(
      clubService.transferOwnership(clubId, priyaManagerId, rohanOwnerId)
    ).rejects.toThrow('Ownership cannot be transferred while suspended');
  });
});
