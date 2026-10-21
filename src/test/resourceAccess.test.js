import { describe, it, expect, beforeEach } from 'vitest';
import { resourceService } from '../services/resourceService';
import { storageEngine } from '../services/storageEngine';

import { seedTestEnvironment } from './testFixtures';

describe('Resource Access & Protection Rules', () => {
  beforeEach(() => {
    localStorage.clear();
    storageEngine.init();
    seedTestEnvironment();
  });

  const aryanStudent = { id: 'usr_aryan_sharma', platform_role: 'student' };
  const outsiderStudent = { id: 'usr_outsider', platform_role: 'student' };
  const platformAdmin = { id: 'usr_admin_vikram', platform_role: 'admin' };

  it('allows active club member to access protected resources of their club', () => {
    // Aryan is an approved active member of Robotics Club
    // Resource 'res_arduino_guide' belongs to Robotics Club
    const result = resourceService.downloadResource('res_arduino_guide', aryanStudent);
    expect(result.success).toBe(true);
    expect(result.title).toBe('Arduino Basics Guide');
    expect(result.download_url).toBeDefined();
  });

  it('blocks non-members from downloading protected club resources', () => {
    // Outsider is not a member of Robotics Club
    expect(() => {
      resourceService.downloadResource('res_arduino_guide', outsiderStudent);
    }).toThrow('Access denied. This resource is free and exclusive to approved members');
  });

  it('blocks student who has membership in Club A from accessing Club B resources without membership', () => {
    // Aryan is member of Robotics, Coding, Music, but NOT Dance Club ('res_dance_basics')
    expect(() => {
      resourceService.downloadResource('res_dance_basics', aryanStudent);
    }).toThrow('Access denied');
  });

  it('blocks pending applicants from downloading protected files', () => {
    // Aryan has pending application for Research Club ('res_ml_roadmap')
    expect(() => {
      resourceService.downloadResource('res_ml_roadmap', aryanStudent);
    }).toThrow('Access denied');
  });

  it('allows platform administrators to oversee and access resources for moderation', () => {
    const adminResult = resourceService.downloadResource('res_dance_basics', platformAdmin);
    expect(adminResult.success).toBe(true);
  });
});
