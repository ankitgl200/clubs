import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/hero/HeroSection';
import ClubCard from '../components/clubs/ClubCard';
import { clubService } from '../services/clubService';
import { announcementService } from '../services/announcementService';
import { adminService } from '../services/adminService';
import { storageEngine } from '../services/storageEngine';
import {
  Compass,
  Cpu,
  Music,
  Trophy,
  GraduationCap,
  Palette,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  Bell,
  Sparkles,
  ShieldCheck,
  Download,
} from 'lucide-react';

export default function HomePage() {
  const [clubs, setClubs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const refreshData = () => {
      setClubs(clubService.getClubs(true).slice(0, 4));
      setAnnouncements(announcementService.getAnnouncements().slice(0, 3));
      setStats(adminService.getStats());
    };
    refreshData();
    storageEngine.syncWithMongoDB().then(refreshData).catch(() => {});

    const interval = setInterval(() => {
      storageEngine.syncWithMongoDB().then(refreshData).catch(() => {});
    }, 4000);

    const onFocus = () => {
      storageEngine.syncWithMongoDB().then(refreshData).catch(() => {});
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('cc_storage_changed', refreshData);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('cc_storage_changed', refreshData);
    };
  }, []);

  const allClubs = clubService.getClubs(true);

  const categories = [
    { name: 'Technical', icon: Cpu, color: 'from-blue-500/20 to-cyan-500/20 text-brand-500' },
    { name: 'Cultural', icon: Music, color: 'from-purple-500/20 to-pink-500/20 text-purple-500' },
    { name: 'Sports', icon: Trophy, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-500' },
    { name: 'Academic', icon: GraduationCap, color: 'from-amber-500/20 to-orange-500/20 text-amber-500' },
    { name: 'Creative', icon: Palette, color: 'from-pink-500/20 to-rose-500/20 text-pink-500' },
    { name: 'Social', icon: HeartHandshake, color: 'from-indigo-500/20 to-blue-500/20 text-indigo-500' },
  ];

  const getCategoryCount = (catName) => {
    const count = allClubs.filter((c) => c.category?.toLowerCase() === catName.toLowerCase()).length;
    return count === 1 ? '1 Club' : `${count} Clubs`;
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. Cinematic Hero Section */}
      <HeroSection stats={stats} />

      {/* 2. Featured Clubs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 mb-3 border border-brand-200/50 dark:border-brand-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Spotlight</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
              Featured Clubs
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
              Discover top-rated college clubs building real projects and hosting active weekly workshops.
            </p>
          </div>
          <Link
            to="/clubs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 group"
          >
            <span>View All Clubs</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {clubs.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-800 dark:text-white">
              No Clubs Registered Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Be the first to bring your community together! Start an official campus club and begin welcoming student members.
            </p>
            <Link
              to="/apply-club"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-md"
            >
              <span>Register a Club</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Explore Interests Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            Explore Interests
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
            No matter your major or background, there's a club where you can collaborate, lead, and thrive.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/clubs?category=${cat.name}`}
                className="group glass-panel rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center gap-3"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-white">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {getCategoryCount(cat.name)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
          <div className="max-w-xl mb-12">
            <h2 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white tracking-tight">
              How The Clubs Works
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Four simple steps to connect with college communities and unlock exclusive learning materials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {[
              {
                step: '01',
                title: 'Discover a Club',
                desc: 'Browse verified campus clubs across technical, cultural, sports, and academic disciplines.',
                icon: Compass,
              },
              {
                step: '02',
                title: 'Apply for Membership',
                desc: 'Submit a fast one-click application with your student profile and areas of interest.',
                icon: Sparkles,
              },
              {
                step: '03',
                title: 'Get Approved',
                desc: 'Club leaders review applications or synchronize automatically with existing club websites.',
                icon: ShieldCheck,
              },
              {
                step: '04',
                title: 'Access Free Resources',
                desc: 'Download member-exclusive notes, project blueprints, code templates, and workshop slides.',
                icon: Download,
              },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div key={st.step} className="space-y-3 relative">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-display font-black text-lg">
                    {st.step}
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Latest Announcements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
              Latest Announcements
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Direct updates broadcasted by verified campus club leaders.
            </p>
          </div>
        </div>

        {announcements.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              No active announcements posted yet. Verified club leaders broadcast news, schedules, and workshops here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="glass-panel rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400 font-semibold">
                  <Bell className="w-3.5 h-3.5" />
                  <span>{ann.club?.name || 'Club Update'}</span>
                </div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  {ann.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ann.content}
                </p>
                <div className="pt-2 text-[11px] text-slate-400">
                  {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Community Call-to-Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 via-blue-600 to-accent-violet p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight">
              Ready to find your college crew?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Join thousands of students collaborating on projects, learning cutting-edge skills, and participating in campus life.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/clubs"
                className="px-8 py-3.5 rounded-full font-semibold text-sm bg-white text-brand-600 hover:bg-blue-50 shadow-lg transition-all"
              >
                Browse All Clubs
              </Link>
              <Link
                to="/apply-club"
                className="px-7 py-3.5 rounded-full font-semibold text-sm bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur-md transition-all"
              >
                Register Your Club
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
