'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * SpotlightCard - A container that tracks the mouse position to create
 * a "spotlight" glow effect on hover. Perfect for Bento-style grids.
 */
export default function SpotlightCard({ children, className, innerClassName }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={clsx(
        "group relative bento-card",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition duration-300 opacity-0 group-hover:opacity-100 z-10"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(34, 211, 238, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className={clsx("relative z-20 h-full", innerClassName)}>
        {children}
      </div>
    </div>
  );
}
