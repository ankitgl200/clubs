import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationService } from '../../services/notificationService';
import {
  Search,
  Moon,
  Sun,
  Bell,
  Menu,
  X,
  Shield,
  Briefcase,
  Users,
  LogOut,
  ChevronDown,
  Sparkles,
  UserCheck,
  Check,
  Home,
  BookOpen,
  Calendar,
  Info,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isOwner, isManager, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      setNotifications(notificationService.getNotifications(user.id));
    }
    const handleStorageChange = () => {
      if (user) setNotifications(notificationService.getNotifications(user.id));
    };
    window.addEventListener('cc_storage_changed', handleStorageChange);
    return () => window.removeEventListener('cc_storage_changed', handleStorageChange);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/clubs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = () => {
    notifications.forEach((n) => notificationService.markAsRead(n.id));
    if (user) setNotifications(notificationService.getNotifications(user.id));
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 via-blue-500 to-accent-cyan p-0.5 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-[#07111F] rounded-[10px] flex items-center justify-center">
              <span className="font-display font-black text-xl bg-gradient-to-r from-brand-500 to-accent-cyan bg-clip-text text-transparent">
                C
              </span>
            </div>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            The Clubs
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {[
            { name: 'Home', path: '/', icon: Home },
            { name: 'Clubs', path: '/clubs', icon: Users },
            { name: 'Resources', path: '/resources', icon: BookOpen },
            { name: 'Events', path: '/events', icon: Calendar },
            { name: 'About', path: '/about', icon: Info },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'text-brand-500 font-semibold bg-brand-50/70 dark:bg-brand-500/10'
                      : 'text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                  }`
                }
              >
                <Icon className="w-4 h-4 opacity-75" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Global Pill Search Input */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden xl:flex items-center relative max-w-xs w-full"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clubs, events, resources..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/70 dark:bg-navy-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all shadow-sm"
          />
        </form>

        {/* Right Tools & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light and dark theme"
            className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Notifications Bell */}
          {isAuthenticated && (
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                aria-label="Notifications"
                className="relative p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-navy-900 animate-pulse" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/60 px-1">
                    <span className="font-semibold text-sm text-slate-800 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-brand-500 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto mt-2 space-y-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">No notifications yet.</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl text-xs transition-colors ${
                            n.is_read
                              ? 'bg-transparent text-slate-500 dark:text-slate-400'
                              : 'bg-brand-50/70 dark:bg-brand-500/10 text-slate-800 dark:text-slate-100 font-medium'
                          }`}
                        >
                          <div className="font-semibold">{n.title}</div>
                          <div className="text-[11px] mt-0.5 text-slate-600 dark:text-slate-300">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Account / Login Button */}
          {isAuthenticated ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-navy-800/60 hover:ring-2 hover:ring-brand-500/30 transition-all"
              >
                <img
                  src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || 'Member')}&backgroundColor=2463ff,7258ff`}
                  alt={user?.full_name}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-brand-500/50"
                />
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-[100px] truncate">
                  {user?.full_name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-2xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700/60 mb-1">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{user?.full_name}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-[10px] font-semibold uppercase">
                      {user?.platform_role}
                    </span>
                  </div>

                  <Link
                    to="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-500" />
                    <span>Student Dashboard</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors font-medium"
                    >
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  {isOwner && (
                    <Link
                      to="/owner/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors font-medium"
                    >
                      <Briefcase className="w-4 h-4 text-indigo-500" />
                      <span>Club Owner Dashboard</span>
                    </Link>
                  )}

                  {isManager && (
                    <Link
                      to="/manager/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors font-medium"
                    >
                      <Sparkles className="w-4 h-4 text-teal-500" />
                      <span>Club Manager Dashboard</span>
                    </Link>
                  )}

                  <Link
                    to="/apply-club"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span>Register New Club</span>
                  </Link>

                  <div className="border-t border-slate-200 dark:border-slate-700/60 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-500 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-md shadow-brand-500/25 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Join Now</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-200 dark:border-slate-700 px-4 pt-3 pb-6 space-y-1">
          {[
            { name: 'Home', path: '/', icon: Home },
            { name: 'Clubs', path: '/clubs', icon: Users },
            { name: 'Resources', path: '/resources', icon: BookOpen },
            { name: 'Events', path: '/events', icon: Calendar },
            { name: 'About', path: '/about', icon: Info },
            { name: 'Student Dashboard', path: '/account', icon: LayoutDashboard },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Icon className="w-4 h-4 text-brand-500" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-amber-500"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          )}
          {isOwner && (
            <Link
              to="/owner/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-indigo-400"
            >
              <Briefcase className="w-4 h-4" />
              <span>Owner Dashboard</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
