import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Mail, Sparkles } from 'lucide-react';
import React from 'react';
import './SideGutterRain.css';

type Props = {
  intensity?: 'subtle' | 'medium' | 'festive';
  className?: string;
  showHearts?: boolean;
  density?: number; // multiplier for count
  heartEvery?: number; // show a heart every N items
  enablePetals?: boolean;
  speed?: 'calm' | 'normal' | 'lively';
  position?: 'absolute' | 'fixed';
  topOffset?: number; // px to start animations below (useful to avoid fixed navbars)
};

const COUNT = { subtle: 12, medium: 18, festive: 28 } as const;
type NewProps = Props & { preferCss?: boolean };

function Gutter({ side, count, showHearts, heartEvery, enablePetals, speed, reduced }: { side: 'left' | 'right'; count: number; showHearts: boolean; heartEvery: number; enablePetals: boolean; speed: 'calm' | 'normal' | 'lively'; reduced: boolean }) {
  const drops = Array.from({ length: count });
  return (
    <div
      className={
        'absolute inset-y-0 ' + (side === 'left' ? 'left-0' : 'right-0') +
        ' pointer-events-none flex items-stretch'
      }
      style={{ width: 'clamp(64px, 12vw, 240px)' }}
      aria-hidden
    >
      <div className="relative w-full overflow-hidden">
        {drops.map((_, i) => {
      // increase the base durations so everything moves slower (thinner, floaty feel)
      const speedBase = speed === 'calm' ? 22 : speed === 'lively' ? 14 : 18;
          const delay = (i % 12) * 0.5 + (side === 'left' ? 0 : 0.25);
      const duration = (speedBase + (i % 6) * 1.2) * (reduced ? 0.85 : 1.25);
      const left = `${(i * 37) % 100}%`;
      // smaller, thinner drops for a delicate rain
      const height = 18 + (i % 5) * 8;
      const width = 1 + (i % 2) * 0.6;
          const isHeart = showHearts && i % heartEvery === 0;
          const yStart = -40 - (i % 20);
          const yEnd = 120 + (i % 10);
          const drift = ((i % 3) - 1) * 6; // minor horizontal sway
          return isHeart ? (
            <motion.div
              key={`h-${side}-${i}`}
              initial={{ y: `${yStart}%`, opacity: 0 }}
        animate={{ y: `${yEnd}%`, opacity: 0.85, x: [0, drift, 0] }}
              transition={{ duration, repeat: Infinity, repeatType: 'loop', delay, ease: 'linear' }}
              className="absolute"
              style={{ left }}
            >
        <Heart className="text-rose-400/45" style={{ width: 8, height: 8, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.04))' }} />
            </motion.div>
          ) : (
            <motion.span
              key={`d-${side}-${i}`}
              initial={{ y: `${yStart}%`, opacity: 0 }}
              animate={{ y: `${yEnd}%`, opacity: 0.6, x: [0, drift, 0] }}
              transition={{ duration, repeat: Infinity, repeatType: 'loop', delay, ease: 'linear' }}
              className="absolute rounded-full"
              style={{
                left,
                width,
                height,
                background: 'linear-gradient(to bottom, rgba(244, 114, 182, 0.0), rgba(244, 114, 182, 0.35))',
              }}
            />
          );
        })}
        {/* occasional twinkles */}
    {Array.from({ length: Math.ceil(count / 3) }).map((_, i) => (
          <motion.span
            key={`tw-${side}-${i}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1, 0], opacity: [0, 0.5, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, delay: i * 1.1 + (side === 'right' ? 0.4 : 0) }}
            className="absolute rounded-full"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              width: 6,
              height: 6,
              background: 'radial-gradient(circle, rgba(244,114,182,0.6), rgba(244,114,182,0))',
              filter: 'blur(0.3px)'
            }}
          />
        ))}

        {/* drifting petals */}
        {enablePetals && Array.from({ length: Math.ceil(count / 2) }).map((_, i) => {
          const size = 6 + (i % 4) * 2;
          const rotate = (i % 2 === 0 ? 1 : -1) * (8 + (i % 5) * 4);
          const duration = 18 + (i % 6) * 2;
          const delay = (i % 10) * 0.6 + (side === 'left' ? 0.25 : 0.35);
          const xSpread = (i % 2 ? -1 : 1) * (6 + (i % 5) * 2);
          return (
            <motion.span
              key={`pt-${side}-${i}`}
              initial={{ y: '-10%', x: 0, rotate: 0, opacity: 0 }}
              animate={{ y: '110%', x: [0, xSpread, 0], rotate: [0, rotate, -rotate, 0], opacity: [0, 0.7, 0] }}
              transition={{ duration: reduced ? duration * 0.75 : duration * 1.1, repeat: Infinity, delay, ease: 'easeInOut' }}
              className="absolute rounded-full bg-pink-300/50"
              style={{ left: `${(i * 29) % 100}%`, width: size, height: size * 0.6, filter: 'blur(0.2px)' }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function SideGutterRain({ intensity = 'medium', className = '', showHearts = true, density = 1, heartEvery = 5, enablePetals = true, speed = 'normal', position = 'absolute', topOffset = 0, preferCss = false }: NewProps) {
  const reduced = useReducedMotion();
  const useCss = preferCss || reduced;
  const base = COUNT[intensity];
  const count = Math.max(6, Math.round(base * density * (reduced ? 0.6 : 1)));
  const posClass = position === 'fixed' ? 'fixed left-0 right-0' : 'absolute inset-0';
  // when fixed, span from topOffset down to the bottom so gutters run vertically beside content
  const topStyle: any = position === 'fixed' ? { top: topOffset, bottom: 0 } : undefined;
  return (
    <div className={`pointer-events-none ${posClass} z-0 ${className}`} style={topStyle} aria-hidden>
      {useCss ? (
        // CSS-only gutters: simple DOM elements with inline durations so browser handles animation
        <>
          <div className="sg-gutter left-0" style={{ left: 0, width: 'clamp(64px,12vw,240px)', top: topOffset, bottom: 0 }}>
            <div className="sg-inner">
              {Array.from({ length: count }).map((_, i) => {
                const left = `${(i * 37) % 100}%`;
                const size = 6 + (i % 5) * 2;
                const dur = 18 + (i % 6) * 2;
                return <div key={`css-d-l-${i}`} className="sg-drop" style={{ left, width: size * 0.6, height: size * 1.6, background: 'linear-gradient(to bottom, rgba(244,114,182,0), rgba(244,114,182,0.35))', animationDuration: `${dur}s`, opacity: 0.6 }} />;
              })}
            </div>
          </div>
          <div className="sg-gutter right-0" style={{ right: 0, width: 'clamp(64px,12vw,240px)', top: topOffset, bottom: 0 }}>
            <div className="sg-inner">
              {Array.from({ length: count }).map((_, i) => {
                const left = `${(i * 41) % 100}%`;
                const size = 6 + (i % 5) * 2;
                const dur = 20 + (i % 6) * 2;
                return <div key={`css-d-r-${i}`} className="sg-drop" style={{ left, width: size * 0.6, height: size * 1.6, background: 'linear-gradient(to bottom, rgba(244,114,182,0), rgba(244,114,182,0.3))', animationDuration: `${dur}s`, opacity: 0.55 }} />;
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          <Gutter side="left" count={count} showHearts={showHearts} heartEvery={heartEvery} enablePetals={enablePetals} speed={speed} reduced={!!reduced} />
          <Gutter side="right" count={count} showHearts={showHearts} heartEvery={heartEvery} enablePetals={enablePetals} speed={speed} reduced={!!reduced} />
        </>
      )}

  {!useCss && (
    <>
      {/* Second layer: larger, slower hearts drifting down */}
      {/* Love letters drifting down */}
      {Array.from({ length: Math.ceil(count / 2) }).map((_, i) => (
        <motion.div
          key={`letter-l-${i}`}
          initial={{ y: '-10%', opacity: 0, rotate: 0 }}
          animate={{ y: '110%', opacity: [0, 0.75, 0], rotate: [0, (i % 2 ? 8 : -8), 0] }}
          transition={{ duration: 26 + (i % 6) * 3, repeat: Infinity, delay: i * 1.9 + 0.7, ease: 'linear' }}
          className="absolute left-0"
          style={{ left: `${(i * 53) % 100}%`, zIndex: 1 }}
        >
          <Mail className="text-pink-300/70" style={{ width: 16, height: 16, filter: 'drop-shadow(0 1px 2px rgba(244,114,182,0.08))' }} />
        </motion.div>
      ))}
      {Array.from({ length: Math.ceil(count / 2) }).map((_, i) => (
        <motion.div
          key={`letter-r-${i}`}
          initial={{ y: '-10%', opacity: 0, rotate: 0 }}
          animate={{ y: '110%', opacity: [0, 0.75, 0], rotate: [0, (i % 2 ? -8 : 8), 0] }}
          transition={{ duration: 26 + (i % 6) * 3, repeat: Infinity, delay: i * 1.9 + 1.2, ease: 'linear' }}
          className="absolute right-0"
          style={{ right: `${(i * 47) % 100}%`, zIndex: 1 }}
        >
          <Mail className="text-pink-300/70" style={{ width: 16, height: 16, filter: 'drop-shadow(0 1px 2px rgba(244,114,182,0.08))' }} />
        </motion.div>
      ))}

      {/* Rose petals drifting and rotating */}
      {Array.from({ length: Math.ceil(count / 1.5) }).map((_, i) => {
        const size = 12 + (i % 3) * 4;
        const rotate = (i % 2 === 0 ? 1 : -1) * (18 + (i % 5) * 7);
        const duration = 15 + (i % 6) * 2;
        const delay = (i % 10) * 0.7 + (i % 2 ? 0.5 : 0);
        const xSpread = (i % 2 ? -1 : 1) * (10 + (i % 5) * 4);
        return (
          <motion.span
            key={`petal-lb-${i}`}
            initial={{ y: '-10%', x: 0, rotate: 0, opacity: 0 }}
            animate={{ y: '110%', x: [0, xSpread, 0], rotate: [0, rotate, -rotate, 0], opacity: [0, 0.7, 0] }}
            transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
            className="absolute rounded-full bg-rose-300/60"
            style={{ left: `${(i * 23) % 100}%`, width: size, height: size * 0.7, filter: 'blur(0.3px)', zIndex: 1 }}
          />
        );
      })}

      {/* Sparkly star twinkles */}
      {Array.from({ length: Math.ceil(count / 2) }).map((_, i) => (
        <motion.span
          key={`star-lb-${i}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 0.8, 0], opacity: [0, 0.7, 0.5, 0] }}
          transition={{ duration: 2.7, repeat: Infinity, delay: i * 0.8 + 0.3, ease: 'easeInOut' }}
          className="absolute"
          style={{
            left: `${(i * 61) % 100}%`,
            top: `${(i * 41) % 100}%`,
            width: 14,
            height: 14,
            zIndex: 2
          }}
        >
          <Sparkles className="text-yellow-200/80" style={{ width: 14, height: 14, filter: 'drop-shadow(0 0 4px #fbbf24)' }} />
        </motion.span>
      ))}
      {Array.from({ length: Math.ceil(count / 2) }).map((_, i) => (
        <motion.div
          key={`bigheart-l-${i}`}
          initial={{ y: '-12%', opacity: 0 }}
          animate={{ y: '112%', opacity: [0, 0.6, 0] }}
          transition={{ duration: 26 + (i % 7) * 3, repeat: Infinity, delay: i * 1.6, ease: 'linear' }}
          className="absolute left-0"
          style={{
            left: `${(i * 41) % 100}%`,
            width: 0,
            zIndex: 1
          }}
        >
          <Heart className="text-pink-400/40" style={{ width: 20 + (i % 3) * 6, height: 20 + (i % 3) * 6, filter: 'blur(0.45px)' }} />
        </motion.div>
      ))}
      {Array.from({ length: Math.ceil(count / 2) }).map((_, i) => (
        <motion.div
          key={`bigheart-r-${i}`}
          initial={{ y: '-12%', opacity: 0 }}
          animate={{ y: '112%', opacity: [0, 0.6, 0] }}
          transition={{ duration: 26 + (i % 7) * 3, repeat: Infinity, delay: i * 1.6 + 0.9, ease: 'linear' }}
          className="absolute right-0"
          style={{
            right: `${(i * 37) % 100}%`,
            width: 0,
            zIndex: 1
          }}
        >
          <Heart className="text-pink-400/40" style={{ width: 20 + (i % 3) * 6, height: 20 + (i % 3) * 6, filter: 'blur(0.45px)' }} />
        </motion.div>
      ))}

      {/* Random heart bursts (occasional) */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`burst-l-${i}`}
          initial={{ y: '100%', opacity: 0, scale: 0.7 }}
          animate={{
            y: ['100%', '70%', '35%', '-10%'],
            opacity: [0, 0.7, 0.6, 0],
            scale: [0.7, 1.0, 0.95, 0.75]
          }}
          transition={{ duration: 10 + i * 3, repeat: Infinity, delay: 3 * i, ease: 'easeInOut' }}
          className="absolute left-0"
          style={{ left: `${12 + i * 18}%`, zIndex: 2 }}
        >
          <Heart className="text-rose-400/80" style={{ width: 28, height: 28, filter: 'drop-shadow(0 1px 4px rgba(244,114,182,0.12))' }} />
        </motion.div>
      ))}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`burst-r-${i}`}
          initial={{ y: '100%', opacity: 0, scale: 0.7 }}
          animate={{
            y: ['100%', '60%', '20%', '-10%'],
            opacity: [0, 0.8, 0.7, 0],
            scale: [0.7, 1.1, 1, 0.8]
          }}
          transition={{ duration: 7 + i * 2, repeat: Infinity, delay: 2.5 * i + 1.2, ease: 'easeInOut' }}
          className="absolute right-0"
          style={{ right: `${12 + i * 18}%`, zIndex: 2 }}
        >
          <Heart className="text-rose-400/80" style={{ width: 36, height: 36, filter: 'drop-shadow(0 2px 6px rgba(244,114,182,0.15))' }} />
        </motion.div>
      ))}

      {/* slow vertical streamers for added ambiance */}
      {Array.from({ length: Math.ceil(count / 8) }).map((_, i) => (
        <motion.span
          key={`st-l-${i}`}
          initial={{ y: '-10%', opacity: 0 }}
          animate={{ y: '110%', opacity: [0, 0.12, 0] }}
          transition={{ duration: 26 + (i % 5) * 3, repeat: Infinity, delay: i * 1.5, ease: 'linear' }}
          className="absolute left-0 rounded"
          style={{
            width: 1.2,
            height: '18%',
            left: `${(i * 17) % 12}%`,
            background: 'linear-gradient(to bottom, rgba(244,114,182,0), rgba(244,114,182,0.18), rgba(244,114,182,0))'
          }}
        />
      ))}
      {Array.from({ length: Math.ceil(count / 8) }).map((_, i) => (
        <motion.span
          key={`st-r-${i}`}
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: '-10%', opacity: [0, 0.12, 0] }}
          transition={{ duration: 26 + (i % 5) * 3, repeat: Infinity, delay: i * 1.5 + 0.6, ease: 'linear' }}
          className="absolute right-0 rounded"
          style={{
            width: 1.2,
            height: '20%',
            right: `${(i * 19) % 12}%`,
            background: 'linear-gradient(to top, rgba(244,114,182,0), rgba(244,114,182,0.18), rgba(244,114,182,0))'
          }}
        />
      ))}
    </>
  )}
    </div>
  );
}
