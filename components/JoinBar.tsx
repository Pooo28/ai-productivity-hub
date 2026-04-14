'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const JoinBar = () => {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      className="fixed top-12 left-1/2 -translate-x-1/2 z-[500] w-full max-w-xl px-4"
    >
      <div className="glass rounded-full px-4 py-2 flex items-center justify-between border border-white/40 shadow-[0_15px_40px_rgba(0,0,0,0.05)] backdrop-blur-3xl bg-white/40 overflow-hidden relative group cursor-pointer hover:border-blue/30 transition-all duration-500">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6B8AFF0A_1px,transparent_1px),linear-gradient(to_bottom,#6B8AFF0A_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none opacity-50" />
        
        <div className="flex items-center gap-4 relative z-10">
          {/* Grid Logo Icon */}
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-navy/5 shadow-sm relative overflow-hidden group-hover:rotate-6 transition-transform">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#6B8AFF10_1px,transparent_1px),linear-gradient(to_bottom,#6B8AFF10_1px,transparent_1px)] bg-[size:6px_6px]" />
             <div className="w-2.5 h-2.5 bg-blue rounded-sm shadow-[0_0_10px_rgba(107,138,255,0.4)]" />
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-navy font-black text-xl tracking-tighter uppercase font-outfit">INSYNC</span>
            <span className="text-blue font-bold text-[10px] tracking-widest uppercase opacity-60">v_1.0</span>
          </div>
        </div>

        <Link 
          href="/sign-up"
          className="relative z-10 px-10 py-3.5 bg-blue text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue/20 hover:scale-105 active:scale-95 transition-all"
        >
          Join
        </Link>
      </div>
    </motion.div>
  );
};
