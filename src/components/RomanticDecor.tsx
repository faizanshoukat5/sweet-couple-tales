import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import React from 'react';

type Props = {
  intensity?: 'subtle' | 'medium' | 'festive';
  className?: string;
};

const HEART_COUNT = { subtle: 6, medium: 10, festive: 16 } as const;

export function RomanticDecor({ intensity = 'medium', className = '' }: Props) {
  const count = HEART_COUNT[intensity];
  const hearts = Array.from({ length: count });
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* Soft gradient blobs */}
      <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-pink-200/25 blur-3xl" />

      {/* Floating hearts */}
      {hearts.map((_, i) => {
        const delay = (i % 8) * 0.6;
        const size = 12 + (i % 4) * 4;
        const left = `${(i * 13) % 100}%`;
        const duration = 8 + (i % 5) * 2;
        return (
          <motion.div
            key={i}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: -40, opacity: 0.9 }}
            transition={{ duration, repeat: Infinity, repeatType: 'mirror', delay, ease: 'easeInOut' }}
            className="absolute"
            style={{ bottom: `${(i * 7) % 60}%`, left }}
          >
            <Heart style={{ width: size, height: size }} className="text-rose-400/60" />
          </motion.div>
        );
      })}
    </div>
  );
}

export default RomanticDecor;
