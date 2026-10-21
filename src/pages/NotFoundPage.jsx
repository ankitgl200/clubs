import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <h1 className="font-display font-black text-6xl text-brand-500">404</h1>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm">
        The club space or resource you requested may have moved or is not yet registered.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-full bg-brand-500 text-white font-semibold text-xs shadow hover:bg-brand-600 transition-all"
      >
        Return to Home
      </Link>
    </div>
  );
}
