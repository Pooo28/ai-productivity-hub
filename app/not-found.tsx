'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, AlertCircle, ChevronLeft } from 'lucide-react';

export const dynamic = 'force-static';

export default function NotFound() {
  return (
    <div className="bg-lavender-glow min-h-screen flex items-center justify-center font-inter selection:bg-blue selection:text-white p-6">
      <div className="max-w-xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 inline-flex items-center justify-center p-8 bg-white rounded-[3rem] shadow-2xl border border-navy/5 relative group"
        >
          <div className="absolute inset-0 bg-blue/5 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <AlertCircle className="w-24 h-24 text-blue relative z-10" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-8xl md:text-9xl font-black font-outfit text-navy mb-4 leading-none uppercase tracking-tighter italic"
        >
          404
        </motion.h1>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-black font-outfit text-navy/40 uppercase tracking-widest italic mb-8"
        >
          Signal Lost in the Nexus
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-navy/60 font-bold max-w-md mx-auto leading-tight tracking-tight italic mb-12"
        >
          The page you are looking for has been moved or exists outside our current synchronization cycle.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/"
            className="group relative flex items-center gap-3 px-10 py-5 bg-navy text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-navy/20 italic"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Home className="w-5 h-5 text-blue" />
            Return to Nexus
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-10 py-5 bg-white border border-navy/10 text-navy font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-50 transition-all italic text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}
