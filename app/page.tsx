'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Brain, Youtube, Briefcase, Calendar, LayoutGrid, Clock, ArrowRight, Sparkles, Globe } from 'lucide-react';
import { useUser, useAuth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import ScrollTimeline from '@/components/ScrollTimeline';
import { JoinBar } from '@/components/JoinBar';

const features = [
  {
    title: 'Notebook',
    highlight: 'Summarizer',
    description: 'Transform chaotic notes into clean, actionable intelligence instantly.',
    icon: Brain,
    color: 'bg-zinc-100 text-zinc-900',
    borderColor: 'group-hover:border-zinc-300',
    href: '/notes',
  },
  {
    title: 'YouTube',
    highlight: 'Insights',
    description: 'Extract key moments and summaries from any long-form video URL.',
    icon: Youtube,
    color: 'bg-zinc-100 text-zinc-900',
    borderColor: 'group-hover:border-zinc-300',
    href: '/youtube',
  },
  {
    title: 'AI Job',
    highlight: 'Search',
    description: 'Scour the web for your perfect role and auto-generate cover letters.',
    icon: Briefcase,
    color: 'bg-zinc-100 text-zinc-900',
    borderColor: 'group-hover:border-zinc-300',
    href: '/jobs',
  },
  {
    title: 'Schedule',
    highlight: 'Manager',
    description: 'Prioritize tasks and intelligently plan your day for maximum output.',
    icon: Calendar,
    color: 'bg-zinc-100 text-zinc-900',
    borderColor: 'group-hover:border-zinc-300',
    href: '/schedule',
  },
];


const SketchDraft = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.2]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const digitalOpacity = useTransform(scrollYProgress, [0.15, 0.3], [0, 1]);
  const blurAmount = useTransform(scrollYProgress, [0, 0.2], [0.2, 0]);

  const annotations = [
    { text: 'Sync Engine', x: -140, y: -100, rotation: -5 },
    { text: 'Vector Search', x: 140, y: -90, rotation: 3 },
    { text: 'AI Agents', x: -130, y: 110, rotation: 2 },
    { text: 'User Flow', x: 150, y: 100, rotation: -4 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-20 select-none overflow-hidden bg-[#D8D9F4]/20 overflow-visible rounded-[3rem]">
      <motion.div 
        style={{ opacity, scale, filter: `blur(${blurAmount}px)` }}
        className="relative w-[500px] h-[400px]"
      >
        <svg viewBox="0 0 500 400" className="w-full h-full drop-shadow-sm">
          {[...Array(3)].map((_, i) => (
            <motion.path
              key={`box-${i}`}
              d={`M ${50+i},${50-i} Q ${250+i*2},${40+i} ${450-i},${60+i} Q ${460-i},${200} ${440+i},${340-i} Q ${250-i*2},${360+i} ${60-i},${350+i} Q ${40+i},${200} ${50+i},${50-i}`}
              fill="none"
              stroke="#0B0B2A"
              strokeWidth={1.5 - i * 0.3}
              strokeOpacity={0.6 - i * 0.15}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, delay: i * 0.2, ease: "easeInOut" }}
            />
          ))}
          {[...Array(4)].map((_, i) => (
            <motion.circle
              key={`core-${i}`}
              cx="250"
              cy="200"
              r={70 + i * 2}
              fill="none"
              stroke={i % 2 === 0 ? "#405DFF" : "#FF6B6B"}
              strokeWidth="1.2"
              strokeOpacity="0.4"
              initial={{ pathLength: 0, rotate: i * 90 }}
              animate={{ 
                pathLength: 1, 
                rotate: 360 + i * 90,
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </svg>
        {annotations.map((note, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: note.x, y: note.y }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 + i * 0.3 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div 
              className="px-4 py-1.5 border border-navy/20 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm w-max"
              style={{ transform: `rotate(${note.rotation}deg)` }}
            >
              <span className="text-[10px] font-black italic tracking-tighter text-navy uppercase font-outfit">
                {note.text}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const SplitscreenHero = () => {
  const { scrollYProgress } = useScroll();
  
  // Vertical offsets for the rows (Opening UP and DOWN)
  const topYTranslate = useTransform(scrollYProgress, [0, 0.4], ['0%', '-100%']);
  const bottomYTranslate = useTransform(scrollYProgress, [0, 0.4], ['0%', '100%']);
  
  // Opacity for the entire intro layer - Clear by 30% scroll
  const sectionOpacity = useTransform(scrollYProgress, [0.25, 0.35], [1, 0]);
  
  const bentoRef = useRef(null);
  const { scrollYProgress: bentoScrollProgress } = useScroll({
    target: bentoRef,
    offset: ["start end", "end start"]
  });
  
  // Content reveal parameters - Start appearing as intro fades
  const contentRevealY = useTransform(scrollYProgress, [0.3, 0.45], [60, 0]);
  const contentRevealOpacity = useTransform(scrollYProgress, [0.3, 0.45], [0, 1]);

  return (
    <div className="relative bg-[#FDFBFF]">
      <JoinBar />
      {/* Vertical Opening Intro Layer (Light Mode) */}
      <motion.div 
        style={{ opacity: sectionOpacity }}
        className="fixed inset-0 z-[200] flex flex-col overflow-hidden pointer-events-none bg-[#FDFBFF]"
      >
        {/* Ultra-subtle Background Grid (Blue Tint) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6B8AFF0A_1px,transparent_1px),linear-gradient(to_bottom,#6B8AFF0A_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Top Half (Slides UP) */}
        <motion.div 
          style={{ y: topYTranslate }}
          className="h-1/2 w-full flex flex-col items-center justify-end overflow-hidden origin-bottom"
        >
           <div className="flex flex-col items-center select-none translate-y-[50%]">
              <h2 className="text-[9rem] md:text-[15rem] font-black font-outfit text-[#020205] tracking-tighter leading-[0.9] uppercase">
                IMAGINE
              </h2>
              <h2 className="text-[9rem] md:text-[15rem] font-black font-outfit tracking-tighter leading-[0.9] uppercase bg-gradient-to-r from-[#FF9ECA] via-[#C292FF] to-[#6B8AFF] bg-clip-text text-transparent">
                EVERYTHING
              </h2>
              <h2 className="text-[9rem] md:text-[15rem] font-black font-outfit text-[#E8EAF6] tracking-tighter leading-[0.9] uppercase">
                IN SYNC
              </h2>
           </div>
        </motion.div>

        {/* Horizontal Seam (Visual Polish) */}
        <div className="h-px w-full bg-[#6B8AFF1A] z-30 shadow-[0_0_15px_rgba(107,138,255,0.05)]" />

        {/* Bottom Half (Slides DOWN) */}
        <motion.div 
          style={{ y: bottomYTranslate }}
          className="h-1/2 w-full flex flex-col items-center justify-start overflow-hidden origin-top"
        >
           <div className="flex flex-col items-center select-none -translate-y-[50%]">
              <h2 className="text-[9rem] md:text-[15rem] font-black font-outfit text-[#020205] tracking-tighter leading-[0.9] uppercase">
                IMAGINE
              </h2>
              <h2 className="text-[9rem] md:text-[15rem] font-black font-outfit tracking-tighter leading-[0.9] uppercase bg-gradient-to-r from-[#FF9ECA] via-[#C292FF] to-[#6B8AFF] bg-clip-text text-transparent">
                EVERYTHING
              </h2>
              <h2 className="text-[9rem] md:text-[15rem] font-black font-outfit text-[#E8EAF6] tracking-tighter leading-[0.9] uppercase">
                IN SYNC
              </h2>
           </div>
        </motion.div>
      </motion.div>

      {/* Main Landing Content Container - Dark Lavender Reset */}
      <motion.div 
        style={{ opacity: contentRevealOpacity, y: contentRevealY }}
        className="relative z-[300] bg-[#020205]"
      >
        {/* Sticky Bento Section - Dark Lavender Atmosphere */}
        <div ref={bentoRef} className="h-[250vh] relative w-full bg-gradient-to-b from-[#020205] via-[#0B0B2A] to-[#020205]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#6B8AFF0A_1px,transparent_1px),linear-gradient(to_bottom,#6B8AFF0A_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
          <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
            <motion.div 
                style={{ 
                  scale: useTransform(bentoScrollProgress, [0.1, 0.2, 0.8, 0.9], [0.95, 1, 1, 0.95]),
                  opacity: useTransform(bentoScrollProgress, [0.05, 0.15, 0.85, 0.95], [0, 1, 1, 0]),
                  x: useTransform(bentoScrollProgress, [0.2, 0.8], ['2%', '-2%']),
                }}
               className="w-full px-6 max-w-7xl mx-auto pt-20"
            >
              {/* High-Fidelity Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[300px] gap-8">
                {/* Notebook Hub */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="md:col-span-12 lg:col-span-8 bento-card bg-white/10 backdrop-blur-md p-12 flex flex-col justify-between text-white group border border-white/10 hover:border-[#6B8AFF] transition-all duration-500 shadow-[0_40px_100px_rgba(0,0,0,0.3)] relative overflow-hidden rounded-[3rem]"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-[#6B8AFF15] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="flex justify-between items-start relative z-10">
                      <div className="p-5 bg-[#FDFBFF] border border-[#6B8AFF1A] rounded-3xl group-hover:translate-x-2 transition-all shadow-sm">
                        <Brain className="w-10 h-10 text-[#3B59FF]" />
                      </div>
                      <ArrowRight className="w-8 h-8 text-[#020205] group-hover:text-[#020205] transition-all" />
                   </div>
                   <div className="relative z-10">
                      <h3 className="text-5xl md:text-6xl font-black font-outfit text-white leading-none mb-4 uppercase tracking-tighter italic">
                        Notebook <span className="text-[#6B8AFF]">Hub</span>
                      </h3>
                      <p className="text-xl text-white/40 font-bold max-w-sm leading-tight italic">
                        Instant actionable intelligence from your chaotic notes.
                      </p>
                   </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="md:col-span-6 lg:col-span-4 bento-card bg-white/10 backdrop-blur-md p-10 flex flex-col justify-between text-white group border border-white/10 hover:border-[#C292FF] transition-all shadow-[0_40px_100px_rgba(0,0,0,0.2)] rounded-[2.5rem]"
                >
                   <div className="p-5 bg-white/5 rounded-3xl self-start group-hover:scale-110 transition-transform">
                      <Youtube className="w-8 h-8 text-[#C292FF]" />
                   </div>
                   <div>
                      <h3 className="text-4xl font-black font-outfit text-white leading-none mb-2 uppercase tracking-tighter">
                        Video <span className="text-[#C292FF]">Insights</span>
                      </h3>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C292FF] opacity-60">
                        Summarize Anything
                      </p>
                   </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="md:col-span-6 lg:col-span-4 bento-card bg-white/10 backdrop-blur-md p-10 flex flex-col justify-between text-white border border-white/10 group hover:border-[#FF9ECA] transition-all shadow-[0_40px_100px_rgba(0,0,0,0.2)] rounded-[2.5rem]"
                >
                    <div className="p-5 bg-white/5 rounded-3xl self-start group-hover:-rotate-12 transition-transform shadow-sm">
                      <Briefcase className="w-8 h-8 text-[#FF9ECA]" />
                   </div>
                   <div>
                      <h3 className="text-4xl font-black font-outfit text-white leading-none mb-2 uppercase tracking-tighter">
                        AI <span className="text-[#FF9ECA]">Job Hunt</span>
                      </h3>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FF9ECA] opacity-60">
                        Automated Matching
                      </p>
                   </div>
                </motion.div>

                {/* Planner Suggest */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="md:col-span-12 lg:col-span-8 bento-card bg-white/10 backdrop-blur-md p-12 flex flex-col border border-white/10 group relative overflow-hidden text-white shadow-[0_40px_100px_rgba(0,0,0,0.3)] rounded-[3rem]"
                >
                   <div className="absolute inset-0 bg-[#6B8AFF10] blur-3xl rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />
                   <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="p-5 bg-white/5 border border-white/10 rounded-3xl group-hover:-translate-y-2 transition-transform text-[#6B8AFF] shadow-sm">
                          <Calendar className="w-10 h-10" />
                        </div>
                      </div>
                      <div className="mt-8">
                        <h2 className="text-5xl font-black font-outfit uppercase tracking-tighter leading-none mb-4 text-white">Planner <span className="text-[#6B8AFF]">Suggest</span></h2>
                        <p className="text-xl text-white/40 font-bold max-sm italic">The list that thinks for you.</p>
                      </div>
                   </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col items-center px-4 sm:px-6">

          {/* Final Finale Reveal Section - Back to Light/White */}
          <div className="w-full max-w-7xl mx-auto text-center py-64 border-t border-white/10 flex flex-col items-center">
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-[8rem] md:text-[12rem] lg:text-[15rem] font-black font-outfit tracking-tighter leading-[0.8] text-white uppercase mb-16"
            >
              One Step <br/> <span className="bg-gradient-to-r from-[#FF9ECA] to-[#6B8AFF] bg-clip-text text-transparent italic">Ahead.</span>
            </motion.h1>
            
            <p className="text-3xl md:text-4xl text-white/40 font-bold max-w-3xl mx-auto mb-20 leading-tight font-roboto">
              Bridging the gap between chaotic creativity and hyper-precise execution. One scroll at a time.
            </p>

            <Link
              href="/signup"
              className="group relative px-24 py-12 bg-[#020205] text-white rounded-full font-black text-3xl transition-all hover:scale-110 shadow-[0_20px_50px_rgba(2,2,5,0.15)] uppercase tracking-[0.25em] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF9ECA] to-[#6B8AFF] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 group-hover:text-white transition-colors">Enter the Future</span>
            </Link>

            <footer className="mt-64 w-full opacity-30">
               <div className="flex flex-col md:flex-row justify-between items-center gap-8 w-full">
                  <span className="text-xs font-black uppercase tracking-[0.5em] text-[#020205]">Service Hub © 2026</span>
                  <div className="flex gap-12 text-xs font-black uppercase tracking-[0.2em] text-[#020205]">
                     <Link href="#" className="hover:text-[#6B8AFF] transition-colors">Privacy</Link>
                     <Link href="#" className="hover:text-[#6B8AFF] transition-colors">Twitter</Link>
                     <Link href="#" className="hover:text-[#6B8AFF] transition-colors">Join Us</Link>
                  </div>
               </div>
            </footer>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Home = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // SERVICE HUB VIEW (Logged In)
  if (user) {
    return (
      <div className="bg-lavender-glow min-h-screen font-inter selection:bg-blue selection:text-white pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pt-12">
          {/* Header */}
          <div className="mb-12 pb-8 border-b border-navy/10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-navy text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-xl shadow-navy/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Central Nexus</span>
                </motion.div>
                <h1 className="text-6xl md:text-8xl font-black text-navy font-outfit tracking-tighter leading-[0.8] uppercase italic mb-6">
                  System <br/>
                  <span className="text-navy/40 non-italic">Operational</span>
                </h1>
                <p className="text-2xl text-navy/60 font-bold max-w-2xl leading-tight tracking-tight italic flex items-center gap-4">
                  <LayoutGrid className="w-6 h-6 text-blue" />
                  Welcome back, {user.fullName || user.username || user.primaryEmailAddress?.emailAddress.split('@')[0]}
                </p>
              </div>
              
              <div className="flex items-center gap-6 px-8 py-6 bg-white border border-navy/5 rounded-[2rem] shadow-xl group hover:shadow-2xl transition-all">
                <div className="p-4 bg-navy/5 rounded-2xl group-hover:scale-110 transition-transform">
                   <Clock className="w-6 h-6 text-navy" />
                </div>
                <div className="text-sm">
                   <div className="text-navy/40 font-black uppercase tracking-[0.2em] text-[10px] mb-1 italic">Temporal Local</div>
                   <div className="text-navy font-black text-2xl leading-none italic">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group h-full"
              >
                <Link href={feature.href} className="block h-full">
                  <div className="h-full p-10 bg-white rounded-[3rem] border border-navy/5 transition-all duration-500 hover:shadow-2xl hover:shadow-navy/10 hover:-translate-y-2 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start mb-16 relative z-10">
                      <div className="p-5 bg-zinc-100 rounded-2xl group-hover:scale-110 transition-transform">
                        <feature.icon className="w-8 h-8 text-navy" />
                      </div>
                      <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center bg-white group-hover:bg-navy group-hover:border-navy transition-all duration-500">
                        <ArrowRight className="w-5 h-5 text-navy/40 group-hover:text-white group-hover:-rotate-45 transition-all" />
                      </div>
                    </div>
                    
                    <div className="mt-auto relative z-10">
                      <h3 className="text-4xl font-black font-outfit text-navy tracking-tighter leading-none mb-4 uppercase italic">
                        {feature.title} <br />
                        <span className="text-navy/20 non-italic">{feature.highlight}</span>
                      </h3>
                      <p className="text-navy/40 font-bold text-sm leading-tight italic max-w-[200px]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // PUBLIC LANDING VIEW (Not Logged In)
    return <SplitscreenHero />;
}

export default Home;
