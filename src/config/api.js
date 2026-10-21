// Centralized API Base URL Resolver
// When deployed on Vercel/Production, it automatically resolves to relative '/api'
// When running locally, it defaults to 'http://localhost:5000/api'
export const getApiUrl = () => {
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();
