import { describe, it, expect, beforeEach } from 'vitest';
import { resourceService } from '../services/resourceService';
import { adminService } from '../services/adminService';
import { membershipService } from '../services/membershipService';
import { storageEngine } from '../services/storageEngine';

import { seedTestEnvironment } from './testFixtures';

describe('Role-Based Authorization & Governance', () => {
  beforeEach(() => {
    localStorage.clear();
    storageEngine.init();
    seedTestEnvironment();
  });

  const rohanOwner = { id: 'usr_rohan_verma', platform_role: 'student' };
  const priyaManager = { id: 'usr_priya_patel', platform_role: 'student' };
  const aryanStudent = { id: 'usr_aryan_sharma', platform_role: 'student' };
  const vikramAdmin = { id: 'usr_admin_vikram', platform_role: 'admin' };

  it('allows club owner to upload resources to their own club', () => {
    // Rohan is owner of Robotics Club
    const res = resourceService.createResource(
      {
        club_id: 'club_robotics',
        title: 'New Autonomous Drone Manual',
        category: 'Guides',
        file_name: 'Drone_Manual.pdf',
        file_size_bytes: 2048000,
      },
      rohanOwner
    );

    expect(res.id).toBeDefined();
    expect(res.title).toBe('New Autonomous Drone Manual');
  });

  it('allows club manager to upload resources to their assigned club', () => {
    // Priya is manager of Coding Club
    const res = resourceService.createResource(
      {
        club_id: 'club_coding',
        title: 'Graph Algorithms Primer',
        category: 'Notes',
        file_name: 'Graph_Algorithms.pdf',
        file_size_bytes: 1500000,
      },
      priyaManager
    );

    expect(res.id).toBeDefined();
    expect(res.title).toBe('Graph Algorithms Primer');
  });

  it('prevents regular student from uploading resources to a club', () => {
    // Aryan is only a member of Robotics, not owner or manager
    expect(() => {
      resourceService.createResource(
        {
          club_id: 'club_robotics',
          title: 'Unauthorized Student Notes',
          category: 'Notes',
          file_name: 'unauthorized.pdf',
          file_size_bytes: 1000,
        },
        aryanStudent
      );
    }).toThrow('Only club owners and managers can upload resources');
  });

  it('prevents club owner of Club A from uploading resources to Club B', () => {
    // Rohan is owner of Robotics Club, but not Coding Club
    expect(() => {
      resourceService.createResource(
        {
          club_id: 'club_coding',
          title: 'Cross-Club Upload Attempt',
          category: 'Notes',
          file_name: 'attempt.pdf',
          file_size_bytes: 1000,
        },
        rohanOwner
      );
    }).toThrow('Only club owners and managers can upload resources');
  });

  it('allows only platform administrator to approve new club registrations', () => {
    const app = adminService.reviewClubApplication(
      'app_club_priya_singh',
      'approve',
      vikramAdmin,
      'Approved after affiliation review.'
    );

    expect(app.status).toBe('approved');

    // The newly created club should now be active in the clubs directory
    const clubs = storageEngine.getClubs(true);
    const createdClub = clubs.find((c) => c.name === 'AI & Neurotech Society');
    expect(createdClub).toBeDefined();
    expect(createdClub.status).toBe('active');
  });
});
