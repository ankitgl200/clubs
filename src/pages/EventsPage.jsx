import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clubService } from '../services/clubService';
import { storageEngine } from '../services/storageEngine';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Filter,
  Wrench,
  Trophy,
  Mic,
  Code2,
  Music,
  ExternalLink,
} from 'lucide-react';

const EVENT_TYPES = [
  { name: 'All', icon: Sparkles },
  { name: 'Workshop', icon: Wrench },
  { name: 'Competition', icon: Trophy },
  { name: 'Talk', icon: Mic },
  { name: 'Hackathon', icon: Code2 },
  { name: 'Concert', icon: Music },
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const refreshEvents = () => setEvents(clubService.getEvents());
    refreshEvents();
    storageEngine.syncWithMongoDB().then(refreshEvents).catch(() => {});
    window.addEventListener('cc_storage_changed', refreshEvents);
    return () => window.removeEventListener('cc_storage_changed', refreshEvents);
  }, []);

  const filtered = events.filter((e) => {
    if (filterType === 'All') return true;
    return e.type.toLowerCase() === filterType.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 mb-2 border border-brand-200/50">
          <Calendar className="w-3.5 h-3.5" />
          <span>Campus Calendar</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          Upcoming Club Events
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hackathons, workshops, guest lectures, and acoustic jam sessions happening across campus.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {EVENT_TYPES.map((typeObj) => {
          const Icon = typeObj.icon;
          const isActive = filterType.toLowerCase() === typeObj.name.toLowerCase();
          return (
            <button
              key={typeObj.name}
              onClick={() => setFilterType(typeObj.name)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-500 text-white shadow'
                  : 'glass-panel text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{typeObj.name}</span>
            </button>
          );
        })}
      </div>

      {/* Event cards grid */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">No events scheduled at this moment.</p>
          <p className="text-xs text-slate-400">Club leaders publish upcoming workshops, hackathons, and auditions here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((evt) => (
            <div
              key={evt.id}
              className="glass-panel rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 space-y-4 hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              {evt.banner_url && (
                <div className="h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={evt.banner_url}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      {evt.type || 'Event'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{evt.date}</span>
                  </div>

                  {evt.club_name && (
                    <Link
                      to={`/clubs/${evt.club_id}`}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline block"
                    >
                      Hosted by {evt.club_name}
                    </Link>
                  )}

                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                    {evt.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span>{evt.time || 'TBA'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span>{evt.location || 'Campus Venue'}</span>
                  </div>

                  {evt.registration_url && (
                    <a
                      href={evt.registration_url.startsWith('http') ? evt.registration_url : `https://${evt.registration_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow transition-all"
                    >
                      <span>Register for Event</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
