import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, MapPin, Lock } from 'lucide-react';

export default function ClubCard({ club }) {
  const categoryColors = {
    Technical: 'bg-blue-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 border-blue-200/60 dark:border-brand-500/20',
    Cultural: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200/60 dark:border-purple-500/20',
    Sports: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20',
    Academic: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20',
    Creative: 'bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400 border-pink-200/60 dark:border-pink-500/20',
    Social: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 border-teal-200/60 dark:border-teal-500/20',
  };

  const badgeClass = categoryColors[club.category] || categoryColors.Technical;

  return (
    <div className="group glass-panel rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between border border-slate-200/80 dark:border-slate-800">
      <div>
        {/* Cover Artwork / Banner */}
        <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={club.banner_url || club.logo_url}
            alt={club.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Logo Badge Overlay if present */}
          {club.logo_url && club.banner_url && (
            <div className="absolute bottom-2.5 left-3 w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-slate-900 shadow-md bg-white">
              <img src={club.logo_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Application status badge */}
          {club.applications_open === false && (
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-rose-300 backdrop-blur-sm flex items-center gap-1 border border-rose-500/30">
              <Lock className="w-2.5 h-2.5" />
              <span>Closed</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
              {club.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className={`px-2.5 py-0.5 rounded-full font-medium border ${badgeClass}`}>
              {club.category}
            </span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
              <Users className="w-3.5 h-3.5" />
              <span>{club.member_count ?? 0} Members</span>
            </span>
            {club.location && (
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px]" title={club.location}>
                <MapPin className="w-3 h-3 text-brand-500 flex-shrink-0" />
                <span className="truncate">{club.location}</span>
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {club.tagline || club.description}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 sm:p-6 pt-0">
        <Link
          to={`/clubs/${club.id}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-500/10 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 dark:hover:text-white transition-all group/btn"
        >
          <span>View Club</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
