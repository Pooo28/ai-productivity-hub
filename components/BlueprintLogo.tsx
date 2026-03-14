'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const BlueprintLogo = ({ scrolled }: { scrolled?: boolean }) => {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Schematic Grid Base */}
        <div className="absolute inset-0 border border-blue/10 bg-[linear-gradient(to_right,#405DFF0A_1px,transparent_1px),linear-gradient(to_bottom,#405DFF0A_1px,transparent_1px)] bg-[size:4px_4px]" />
        
        {/* Sketchy Drawing Frame */}
        <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 400 400">
          {[...Array(scrolled ? 1 : 3)].map((_, i) => (
            <motion.path
              key={i}
              animate={{ 
                d: scrolled 
                  ? "M 50,50 L 350,50 L 350,350 L 50,350 Z" 
                  : `M ${50+i},${50-i} Q ${250+i},${40+i} ${350-i},${50+i} Q ${355-i},${200} ${345+i},${350-i} Q ${250-i},${360+i} ${55-i},${350+i} Q ${45+i},${200} ${50+i},${50-i}`
              }}
              fill="none"
              stroke="#405DFF"
              strokeWidth={scrolled ? 1 : 2 - i * 0.5}
              strokeOpacity={scrolled ? 1 : 0.5 - i * 0.1}
              initial={false}
              transition={{ duration: 0.8, ease: "anticipate" }}
            />
          ))}
          {/* Scribble Crosshatch */}
          <motion.path
             d="M 150,150 L 250,250 M 250,150 L 150,250"
             stroke="#405DFF"
             strokeWidth="1"
             strokeOpacity="0.2"
             animate={{ pathLength: [0, 1, 0] }}
             transition={{ duration: 4, repeat: Infinity }}
          />
        </svg>

        {/* Technical Core */}
        <motion.div 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 1.5 }}
          className="w-1.5 h-1.5 bg-blue" 
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <motion.span 
            animate={{ 
              fontStyle: scrolled ? 'normal' : 'italic',
              letterSpacing: scrolled ? '-0.02em' : '-0.05em'
            }}
            className="text-lg font-black uppercase leading-none text-navy font-outfit"
          >
            InSync
          </motion.span>
          <span className="text-[10px] font-black text-blue leading-none">V_1.0</span>
        </div>
        <AnimatePresence mode="wait">
          {!scrolled && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 0.4, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-1.5 mt-1 overflow-hidden"
            >
               <div className="w-1 h-3 bg-navy/20" />
               <span className="text-[7px] font-bold text-navy uppercase tracking-[0.3em] leading-none">
                 Engineering Mode
               </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
