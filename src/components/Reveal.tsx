import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';

type Props = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export default function Reveal({ children, delay = 0.05, className = '' }: Props) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={prefersReduced ? undefined : { opacity: 0, y: 16 }}
      whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}
