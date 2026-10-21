import { describe, it, expect, beforeEach } from 'vitest';
import { membershipService } from '../services/membershipService';
import { integrationService } from '../services/integrationService';
import { storageEngine } from '../services/storageEngine';

import { seedTestEnvironment } from './testFixtures';

describe('Membership Management & External Synchronization', () => {
  beforeEach(() => {
    localStorage.clear();
    storageEngine.init();
    seedTestEnvironment();
  });

  it('submits a membership application in pending status and prevents duplicate pending application', () => {
    const student = { id: 'usr_new_student', full_name: 'Mira Kapoor', email: 'mira@studymyte.edu' };
    const app = membershipService.applyForMembership('club_dance', student, {
      statement_of_interest: 'Passionate about contemporary choreography.',
    });

    expect(app.id).toBeDefined();
    expect(app.status).toBe('pending');
    expect(app.club_id).toBe('club_dance');

    // Duplicate pending application attempt should throw
    expect(() => {
      membershipService.applyForMembership('club_dance', student, { statement_of_interest: 'Again' });
    }).toThrow('already have a pending application');
  });

  it('approves membership application and grants active club membership', () => {
    const reviewer = { id: 'usr_rohan_verma', full_name: 'Rohan Verma' };
    // Get Aryan's pending research club application
    const app = membershipService.reviewMembershipApplication('app_mem_aryan_research', 'approve', reviewer);

    expect(app.status).toBe('approved');
    expect(membershipService.isUserClubMember('usr_aryan_sharma', 'club_research')).toBe(true);
  });

  it('rejects membership application and does not grant membership', () => {
    const reviewer = { id: 'usr_rohan_verma', full_name: 'Rohan Verma' };
    const app = membershipService.reviewMembershipApplication('app_mem_rohan_join_req', 'reject', reviewer);

    expect(app.status).toBe('rejected');
    expect(membershipService.isUserClubMember('usr_rohan_req', 'club_robotics')).toBe(false);
  });

  it('supports multiple club memberships simultaneously', () => {
    // Aryan belongs to Robotics, Coding, Music
    const mems = membershipService.getUserMemberships('usr_aryan_sharma');
    const clubIds = mems.map((m) => m.club_id);

    expect(clubIds).toContain('club_robotics');
    expect(clubIds).toContain('club_coding');
    expect(clubIds).toContain('club_music');
    expect(mems.length).toBeGreaterThanOrEqual(3);
  });

  it('synchronizes external club website webhook events idempotent', () => {
    const webhookPayload = {
      event_type: 'member_added',
      email: 'external.lead@studymyte.edu',
      full_name: 'External Lead',
      membership_role: 'member',
    };

    const res1 = integrationService.processWebhookEvent('club_robotics', webhookPayload);
    expect(res1.success).toBe(true);

    const user = storageEngine.getUserByEmail('external.lead@studymyte.edu');
    expect(user).toBeDefined();
    expect(membershipService.isUserClubMember(user.id, 'club_robotics')).toBe(true);

    // Replay / idempotent event handling
    const res2 = integrationService.processWebhookEvent('club_robotics', webhookPayload);
    expect(res2.success).toBe(true);
  });
});
