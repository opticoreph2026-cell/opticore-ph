'use client';

import { motion } from 'framer-motion';

/**
 * MeshGradient - A decorative background component with subtle animated glows.
 */
export default function MeshGradient() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />
      
      {/* Primary Glows */}
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-cyan-500/[0.05] blur-[160px]" 
      />
      
      <motion.div 
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-purple-600/[0.05] blur-[160px]" 
      />

      {/* Center Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-surface-1000/20 backdrop-blur-[100px]" />
    </div>
  );
}
