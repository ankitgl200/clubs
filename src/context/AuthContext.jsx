import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { storageEngine } from '../services/storageEngine';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [storageVersion, setStorageVersion] = useState(0);

  useEffect(() => {
    // 1. Restore and sync session from MongoDB on application load
    authService.initSession().then((restored) => {
      if (restored) setUser(restored);
    });

    // 2. Listen to local storage & cross-component auth events
    const handleAuthChange = (e) => {
      setUser(e.detail?.user || null);
    };
    window.addEventListener('cc_auth_changed', handleAuthChange);

    const handleStorageChange = () => {
      // Re-trigger reactive memberships calculation
      setStorageVersion((v) => v + 1);
    };
    window.addEventListener('cc_storage_changed', handleStorageChange);

    return () => {
      window.removeEventListener('cc_auth_changed', handleAuthChange);
      window.removeEventListener('cc_storage_changed', handleStorageChange);
    };
  }, []);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const loggedIn = await authService.login(identifier, password);
      setUser(loggedIn);
      return loggedIn;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const registered = await authService.register(formData);
      if (registered && !registered.email_confirmation_required) {
        setUser(registered);
      }
      return registered;
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmationEmail = async (email) => {
    return authService.resendConfirmationEmail(email);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    if (!user) return null;
    const updated = await authService.updateProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  // Roles & Permissions helper
  const isAdmin = user?.platform_role === 'admin';

  // Check if user has owner or manager role in any club (reacts to storageVersion)
  const memberships = user ? storageEngine.getUserMemberships(user.id) : [];
  const allClubs = storageEngine.getClubs ? storageEngine.getClubs(false) : [];
  const headClubs = user
    ? allClubs.filter(
        (c) =>
          c.club_head_id === user.id ||
          (user.email && c.club_head_email?.toLowerCase() === user.email.toLowerCase())
      )
    : [];

  const ownedClubIds = new Set([
    ...memberships.filter((m) => m.membership_role === 'owner' || m.role === 'owner').map((m) => m.club_id),
    ...headClubs.map((c) => c.id),
  ]);

  const ownedClubs = allClubs.filter((c) => ownedClubIds.has(c.id));
  const managedClubs = memberships.filter(
    (m) =>
      m.membership_role === 'manager' ||
      m.membership_role === 'coordinator' ||
      m.role === 'coordinator'
  );
  const isOwner = ownedClubs.length > 0;
  const isManager = managedClubs.length > 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin,
        isOwner,
        isManager,
        ownedClubs,
        managedClubs,
        memberships,
        login,
        register,
        resendConfirmationEmail,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
