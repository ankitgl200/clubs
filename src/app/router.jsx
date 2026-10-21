import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import HomePage from '../pages/HomePage';
import ClubsPage from '../pages/ClubsPage';
import ClubDetailPage from '../pages/ClubDetailPage';
import ResourcesPage from '../pages/ResourcesPage';
import EventsPage from '../pages/EventsPage';
import AboutPage from '../pages/AboutPage';
import AccountPage from '../pages/AccountPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ClubApplicationPage from '../pages/ClubApplicationPage';
import AdminDashboard from '../pages/AdminDashboard';
import ClubOwnerDashboard from '../pages/ClubOwnerDashboard';
import ClubManagerDashboard from '../pages/ClubManagerDashboard';
import JoinClubPage from '../pages/JoinClubPage';
import NotFoundPage from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'clubs', element: <ClubsPage /> },
      { path: 'clubs/:clubId', element: <ClubDetailPage /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: 'dashboard', element: <Navigate to="/account" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'apply-club', element: <ClubApplicationPage /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'owner/dashboard', element: <ClubOwnerDashboard /> },
      { path: 'manager/dashboard', element: <ClubManagerDashboard /> },
      { path: 'join', element: <JoinClubPage /> },
      { path: 'join/:code', element: <JoinClubPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
