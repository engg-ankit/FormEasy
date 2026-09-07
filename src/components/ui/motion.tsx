'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import React from 'react';

/**
 * Premium motion primitives built on framer-motion.
 *
 * IMPORTANT: These must never render different DOM on the server vs the
 * first client render (that causes React hydration errors). That is why
 * reduced-motion support only zeroes the `transition` — the element type,
 * `initial` and `whileInView` props stay identical on both sides.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

interface MotionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}

/** Fades + slides content up when it scrolls into view. */
export function FadeIn({ children, className, delay = 0, y = 20, once = true }: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-40px' }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.55, delay, ease: EASE }
      }
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

interface StaggerProps extends MotionProps {}

/** Parent container that staggers its <StaggerItem> children. */
export function Stagger({ children, className, once = true }: StaggerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '-40px' }}
      transition={reduceMotion ? { duration: 0, staggerChildren: 0 } : undefined}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={staggerItem}
      transition={reduceMotion ? { duration: 0 } : undefined}
    >
      {children}
    </motion.div>
  );
}

/** Simple scale-in for modals, popovers and dialogs. */
export function ScaleIn({ children, className, delay = 0 }: MotionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.3, delay, ease: EASE }
      }
    >
      {children}
    </motion.div>
  );
}