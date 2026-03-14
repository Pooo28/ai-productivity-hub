'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const NeuralLogo = ({ scrolled }: { scrolled?: boolean }) => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* Pulsing Nucleus */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-4 h-4 bg-blue rounded-full blur-[2px] shadow-[0_0_15px_rgba(64,93,255,0.5)]"
        />
        
        {/* Orbiting Shards */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0"
          >
            <div 
              className="absolute top-0 left-1/2 -ml-0.5 w-1 h-1 bg-accent-coral rounded-full"
              style={{ transform: `translateY(${2 + i * 2}px)` }}
            />
          </motion.div>
        ))}
        
        {/* Core Icon */}
        <div className="relative z-10 w-2 h-2 bg-white rounded-full shadow-inner" />
      </div>

      <div className="flex flex-col">
        <span className={`text-sm font-black tracking-tighter uppercase leading-none ${scrolled ? 'text-navy' : 'text-navy'}`}>
          Neural <span className="text-blue italic">Sync</span>
        </span>
        <span className="text-[6px] font-black text-navy/40 uppercase tracking-[0.3em] leading-none mt-0.5">
          Intelligence Hub
        </span>
      </div>
    </div>
  );
};
