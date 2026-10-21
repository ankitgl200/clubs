import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  Layers,
  Code2,
  Music,
  Palette,
  GraduationCap,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-[#040913]/90 backdrop-blur-md pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-200 dark:border-slate-800">
          
          {/* Brand info */}
          <div className="md:col-span-6 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-cyan p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-white dark:bg-[#07111F] rounded-[10px] flex items-center justify-center">
                  <span className="font-display font-black text-lg bg-gradient-to-r from-brand-500 to-accent-cyan bg-clip-text text-transparent">
                    C
                  </span>
                </div>
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                The Clubs
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              The premier college club management and resource portal connected to the StudyMyte ecosystem. Discover communities, access free member resources, and unleash your creative potential.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <a
                href="https://studymyte.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 dark:hover:bg-brand-900/60 font-semibold border border-brand-200/60 dark:border-brand-800/60 transition shadow-sm group"
              >
                <span>Maintained by</span>
                <span className="font-bold underline underline-offset-2">StudyMyte</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>StudyMyte Student Network</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-500" />
              <span>Explore</span>
            </h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/clubs" className="hover:text-brand-500 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                  <span>All Clubs</span>
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-brand-500 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                  <span>Resource Library</span>
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-brand-500 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                  <span>Campus Events</span>
                </Link>
              </li>
              <li>
                <Link to="/apply-club" className="hover:text-brand-500 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                  <span>Register a Club</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-display font-semibold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-500" />
              <span>Categories</span>
            </h4>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <Link to="/clubs?category=Technical" className="hover:text-brand-500 transition-colors flex items-center gap-1.5 group">
                  <Code2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                  <span>Technical & Robotics</span>
                </Link>
              </li>
              <li>
                <Link to="/clubs?category=Cultural" className="hover:text-brand-500 transition-colors flex items-center gap-1.5 group">
                  <Music className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                  <span>Dance & Music</span>
                </Link>
              </li>
              <li>
                <Link to="/clubs?category=Creative" className="hover:text-brand-500 transition-colors flex items-center gap-1.5 group">
                  <Palette className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                  <span>Creative Arts & Photo</span>
                </Link>
              </li>
              <li>
                <Link to="/clubs?category=Academic" className="hover:text-brand-500 transition-colors flex items-center gap-1.5 group">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                  <span>Academic & Research</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} The Clubs • Maintained by{' '}
            <a
              href="https://studymyte.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              StudyMyte
            </a>
          </div>
          <div className="flex items-center gap-6">
            <span>Free & Open for College Communities</span>
            <span>Zero Paywalls</span>
            <span>Secured with MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
