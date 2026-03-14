'use client';

import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const milestones = [
  { id: 1, position: '10%' },
  { id: 2, position: '30%' },
  { id: 3, position: '55%' },
  { id: 4, position: '85%' },
];

const ScrollTimeline = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="fixed bottom-12 left-0 right-0 z-50 pointer-events-none px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-center relative h-12">
        {/* Track */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-[1px] bg-navy/10 relative">
            <motion.div 
              style={{ scaleX }}
              className="absolute top-0 left-0 bottom-0 right-0 bg-blue origin-left"
            />
          </div>
        </div>

        {/* Milestones */}
        <div className="absolute inset-0 flex items-center justify-between pointer-events-auto">
          {milestones.map((milestone) => (
            <div 
              key={milestone.id}
              className="w-3 h-3 rounded-full bg-white border border-navy/20 flex items-center justify-center relative translate-y-[0.5px]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-navy/10" />
              {/* Active Indicator */}
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                className="absolute inset-0 rounded-full bg-blue"
                style={{ 
                  opacity: scrollYProgress.get() > parseFloat(milestone.position) / 100 ? 1 : 0,
                  scale: scrollYProgress.get() > parseFloat(milestone.position) / 100 ? 1 : 0
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollTimeline;
