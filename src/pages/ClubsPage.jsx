import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ClubCard from '../components/clubs/ClubCard';
import { clubService } from '../services/clubService';
import { storageEngine } from '../services/storageEngine';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Code2,
  Music,
  Trophy,
  GraduationCap,
  Palette,
  Users,
  ArrowUpDown,
  PlusCircle,
  Building2,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'All', icon: Sparkles },
  { name: 'Technical', icon: Code2 },
  { name: 'Cultural', icon: Music },
  { name: 'Sports', icon: Trophy },
  { name: 'Academic', icon: GraduationCap },
  { name: 'Creative', icon: Palette },
  { name: 'Social', icon: Users },
];

export default function ClubsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [clubs, setClubs] = useState([]);
  const [category, setCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('popular');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        setIsLoading(true);
        await storageEngine.syncWithMongoDB();
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
      const list = clubService.getClubs(true);
      setClubs(list);
    };
    loadClubs();
    const handleStorageChange = () => {
      setClubs(clubService.getClubs(true));
    };
    window.addEventListener('cc_storage_changed', handleStorageChange);
    return () => window.removeEventListener('cc_storage_changed', handleStorageChange);
  }, []);

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    if (initialSearch) setSearchQuery(initialSearch);
  }, [searchParams]);

  // Filter and sort
  const filteredClubs = clubs
    .filter((c) => {
      const matchCat = category === 'All' || c.category.toLowerCase() === category.toLowerCase();
      const matchQuery =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.member_count || 0) - (a.member_count || 0);
      if (sortBy === 'alpha') return a.name.localeCompare(b.name);
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title & Cursive Decoration */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
            Explore Clubs
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
            Discover amazing clubs, meet like-minded people, and be part of something bigger.
          </p>
        </div>

        {/* Handwritten Style Annotation Badge */}
        <div className="hidden md:flex flex-col items-center rotate-[-4deg] text-brand-600 dark:text-brand-400 font-handwriting text-xl sm:text-2xl select-none">
          <div className="flex items-center gap-1.5 leading-none">
            <span>Different Interests</span>
          </div>
          <div className="flex items-center gap-1.5 leading-none mt-1">
            <span>One Community</span>
            <Sparkles className="w-4 h-4 fill-current text-amber-400" />
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-4xl">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clubs by name, description, or domain..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-panel shadow-sm text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
        />
      </div>

      {/* Category Pills & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        
        {/* Category Pills with Lucide Icons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar scroll-smooth">
          {CATEGORIES.map((catObj) => {
            const Icon = catObj.icon;
            const isActive = category.toLowerCase() === catObj.name.toLowerCase();
            return (
              <button
                key={catObj.name}
                onClick={() => handleCategoryChange(catObj.name)}
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

        {/* Sort Select */}
        <div className="flex items-center gap-2 flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-xs"
          >
            <option value="popular">Popular</option>
            <option value="alpha">Alphabetical</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Clubs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="glass-panel rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 animate-pulse"
            >
              <div className="h-40 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-8 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 mx-auto flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <p className="text-slate-700 dark:text-slate-200 font-semibold text-base">
            No clubs registered yet.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto">
            Campus clubs created by students and approved by administrators will appear here.
          </p>
          <Link
            to="/apply-club"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply to Start a Club</span>
          </Link>
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium text-sm">No clubs found matching your search.</p>
          <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      )}
    </div>
  );
}
