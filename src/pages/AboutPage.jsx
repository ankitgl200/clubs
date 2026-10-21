import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, HeartHandshake, BookOpen, Users, Compass, ArrowRight, PlusCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 border border-brand-200/50">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The StudyMyte Club Ecosystem</span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
          Empowering College Communities to Build & Belong
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          The Clubs is the central home for all student clubs, societies, hackathons, and research collectives across campus.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Discover Your Calling
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            From robotics and competitive coding to music production and dance, discover like-minded students sharing your exact passions.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            100% Free Resources
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Zero paywalls. All club documents, project schematics, lecture notes, and workshop recordings are free for approved members.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Verified Leadership
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Every club is officially vetted by faculty mentors and campus administrators with cryptographic webhook synchronizations.
          </p>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          Ready to get involved?
        </h2>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/clubs"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-500 text-white font-semibold text-xs shadow hover:bg-brand-600 transition-colors"
          >
            <span>Explore Clubs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/apply-club"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full glass-panel text-slate-700 dark:text-slate-300 font-semibold text-xs border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-brand-500" />
            <span>Register Your Club</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
