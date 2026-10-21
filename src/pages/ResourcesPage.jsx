import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { resourceService } from '../services/resourceService';
import { clubService } from '../services/clubService';
import { membershipService } from '../services/membershipService';
import { storageEngine } from '../services/storageEngine';
import ResourceCard from '../components/resources/ResourceCard';
import {
  Search,
  Filter,
  BookOpen,
  Lock,
  ShieldCheck,
  Sparkles,
  FileText,
  FolderGit2,
  Compass,
  Scroll,
  Video,
  Building2,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'All', icon: Sparkles },
  { name: 'Notes', icon: FileText },
  { name: 'Projects', icon: FolderGit2 },
  { name: 'Guides', icon: Compass },
  { name: 'Papers', icon: Scroll },
  { name: 'Media', icon: Video },
];

export default function ResourcesPage() {
  const { user, isAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [userClubIds, setUserClubIds] = useState([]);
  const [category, setCategory] = useState('All');
  const [selectedClubId, setSelectedClubId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setResources(resourceService.getResources());
    setClubs(clubService.getClubs(true));
    if (user) {
      const mems = membershipService.getUserMemberships(user.id);
      setUserClubIds(mems.map((m) => m.club_id));
    } else {
      setUserClubIds([]);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    storageEngine.syncWithMongoDB().then(() => {
      loadData();
      setIsLoading(false);
    }).catch(() => {
      loadData();
      setIsLoading(false);
    });
    loadData();
    window.addEventListener('cc_storage_changed', loadData);
    return () => window.removeEventListener('cc_storage_changed', loadData);
  }, [user]);

  // Filter resources
  const filteredResources = resources.filter((r) => {
    const matchCat = category === 'All' || r.category.toLowerCase() === category.toLowerCase();
    const matchClub = selectedClubId === 'all' || r.club_id === selectedClubId;
    const matchSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.club?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchClub && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Subtitle */}
      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
          Resources
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
          Access notes, guides, projects, and exclusive materials shared by clubs.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-4xl">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search resources by title, topic, or club..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-panel shadow-sm text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
        />
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((catObj) => {
            const Icon = catObj.icon;
            const isActive = category.toLowerCase() === catObj.name.toLowerCase();
            return (
              <button
                key={catObj.name}
                onClick={() => setCategory(catObj.name)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'glass-panel text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{catObj.name}</span>
              </button>
            );
          })}
        </div>

        {/* Club Filter Selector */}
        <div className="flex items-center gap-2 flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium whitespace-nowrap">Filter by Club:</span>
          <select
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="px-3 py-1.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-xs"
          >
            <option value="all">All Clubs</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {userClubIds.includes(c.id) ? '★ (Joined)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Protection Info Banner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-brand-200/60 dark:border-brand-500/20 bg-gradient-to-r from-brand-50/50 via-transparent to-blue-50/30 dark:from-brand-950/20 dark:to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-brand-700 dark:text-brand-300">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-brand-500" />
          <span>
            <strong>Zero Paywalls:</strong> All club resources are 100% free for approved club members.
            Non-members can view catalog listings, and join clubs anytime to unlock downloads.
          </span>
        </div>
        {user && (
          <div className="text-slate-500 dark:text-slate-400 font-medium">
            Active Memberships: <span className="font-bold text-brand-600 dark:text-brand-400">{userClubIds.length} Clubs</span>
          </div>
        )}
      </div>

      {/* Resource List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="space-y-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 animate-pulse"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="h-8 w-24 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
              </div>
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 text-sm border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">No resources match your filters.</p>
            <p className="text-xs text-slate-400">Try selecting a different category or club.</p>
          </div>
        ) : (
          filteredResources.map((res) => {
            const isMember = userClubIds.includes(res.club_id);
            return (
              <ResourceCard
                key={res.id}
                resource={res}
                isMember={isMember}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
