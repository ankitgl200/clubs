import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Users, BookOpen, Sparkles, GraduationCap } from 'lucide-react';
import HologramCanvas from './HologramCanvas';
import VideoModal from './VideoModal';

export default function HeroSection({ stats }) {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  const videoUrl = '/assets/hero/animate.mp4';

  useEffect(() => {
    // Attempt autoplay
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => setVideoLoaded(true))
        .catch((err) => {
          console.warn('Hero video autoplay thwarted or delayed:', err);
          setVideoLoaded(true);
        });
    }
  }, []);

  // Dynamic statistics bar based on real platform data
  const displayStats = [
    { label: 'Active Clubs', value: stats?.activeClubs ?? 0, icon: Sparkles },
    { label: 'Members', value: stats?.totalMembers ?? 0, icon: Users },
    { label: 'Resources', value: stats?.totalResources ?? 0, icon: BookOpen },
    { label: 'Student Driven', value: '100%', icon: GraduationCap },
  ];

  return (
    <section className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#F7FAFF] dark:bg-[#07111F] pt-6 pb-12 transition-colors">
      
      {/* Full-Bleed Hero Cinematic Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {!videoError ? (
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setVideoError(true)}
            onLoadedData={() => setVideoLoaded(true)}
            className="w-full h-full object-cover object-center lg:object-right filter contrast-[1.04] brightness-[1.02]"
          />
        ) : (
          /* Fallback high-tech background if video fails */
          <div
            className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-brand-950"
          />
        )}

        {/* Seamless Soft Gradient Overlays for perfect readability without hard seams */}
        {/* Left-to-right fade so text on left is super crisp and legible while animation on right shines */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F7FAFF]/95 via-[#F7FAFF]/70 to-[#F7FAFF]/10 dark:from-[#07111F]/95 dark:via-[#07111F]/70 dark:to-[#07111F]/20 pointer-events-none" />
        
        {/* Top and Bottom soft transition into page background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7FAFF] via-transparent to-[#F7FAFF]/30 dark:from-[#07111F] dark:via-transparent dark:to-[#07111F]/40 pointer-events-none" />
        
        {/* Ambient atmospheric cyan/blue glow */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3D Holographic Particle Layer */}
      <HologramCanvas />

      {/* Main Content Area */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-12 lg:py-20">
        <div className="max-w-2xl lg:max-w-xl space-y-7">
          
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <span className="font-mono text-xs md:text-sm font-bold tracking-[0.25em] uppercase text-brand-600 dark:text-brand-400">
              STUDENTS × CLUBS × IDEAS × COMMUNITY
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-1"
          >
            <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.08] text-slate-900 dark:text-white drop-shadow-sm">
              More Than
              <br />
              Clubs.
              <br />
              <span className="bg-gradient-to-r from-brand-500 via-blue-500 to-accent-violet bg-clip-text text-transparent drop-shadow-md">
                A Bigger You.
              </span>
            </h1>
          </motion.div>

          {/* Supporting text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-normal max-w-lg drop-shadow-sm"
          >
            The Clubs brings students, ideas and interests together. Explore clubs, join communities, access resources, attend events and turn your passion into real opportunities.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Link
              to="/clubs"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base text-white bg-brand-500 hover:bg-brand-600 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all group"
            >
              <span>Explore Clubs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-100 bg-white/80 dark:bg-navy-800/80 hover:bg-white dark:hover:bg-navy-800 border border-slate-200/90 dark:border-slate-700/80 backdrop-blur-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className="w-6 h-6 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
              <span>Watch Video</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Configurable Statistics Bar (matching bottom left in UI reference) */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-auto"
      >
        <div className="glass-panel rounded-2xl sm:rounded-full p-4 sm:p-5 shadow-lg border border-slate-200/80 dark:border-slate-800/80 max-w-4xl backdrop-blur-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-700/60">
            {displayStats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3.5 ${idx !== 0 ? 'pt-3 sm:pt-0 sm:pl-6' : ''}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
                      {item.value}
                    </div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoSrc={videoUrl}
      />
    </section>
  );
}
