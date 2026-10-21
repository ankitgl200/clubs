import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../services/authService';
import { storageEngine } from '../services/storageEngine';

import { seedTestEnvironment } from './testFixtures';

describe('Authentication Service', () => {
  beforeEach(() => {
    localStorage.clear();
    storageEngine.init();
    seedTestEnvironment();
  });

  it('authenticates user with valid email and password', async () => {
    const user = await authService.login('aryan.sharma@studymyte.edu', 'password123');
    expect(user).toBeDefined();
    expect(user.full_name).toBe('Aryan Sharma');
    expect(user.email).toBe('aryan.sharma@studymyte.edu');
  });

  it('authenticates user with phone number', async () => {
    const user = await authService.login('+91 98765 43210', 'password123');
    expect(user).toBeDefined();
    expect(user.full_name).toBe('Aryan Sharma');
  });

  it('rejects authentication with invalid credentials', async () => {
    await expect(
      authService.login('nonexistent@studymyte.edu', 'wrongpass')
    ).rejects.toThrow('Invalid email/phone or password');
  });

  it('registers a new student profile and prevents duplicate email registration', async () => {
    const newStudent = await authService.register({
      full_name: 'Devansh Kulkarni',
      email: 'devansh@studymyte.edu',
      phone: '+91 99999 11111',
      password: 'mypassword',
      registered_with_club: false,
    });

    expect(newStudent.id).toBeDefined();
    expect(newStudent.full_name).toBe('Devansh Kulkarni');
    expect(newStudent.platform_role).toBe('student');

    // Attempting same email again should fail
    await expect(
      authService.register({
        full_name: 'Devansh Duplicate',
        email: 'devansh@studymyte.edu',
        phone: '+91 99999 22222',
        password: 'mypassword',
      })
    ).rejects.toThrow('already exists');
  });

  it('logs out and clears session', async () => {
    await authService.login('aryan.sharma@studymyte.edu', 'password123');
    authService.logout();
    expect(localStorage.getItem('cc_current_user_v1')).toBeNull();
  });
});
