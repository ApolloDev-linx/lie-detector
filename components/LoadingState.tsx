'use client';

import { motion } from 'framer-motion';

const EKG_PATH =
  'M0,50 L30,50 L40,50 L50,10 L60,80 L70,20 L80,50 L90,50 ' +
  'L120,50 L130,50 L140,10 L150,80 L160,20 L170,50 L180,50 ' +
  'L210,50 L220,50 L230,10 L240,80 L250,20 L260,50 L280,50';

const STAGES = [
  { label: 'PARSING SYNTAX STRUCTURE', duration: 0 },
  { label: 'DETECTING HEDGING PATTERNS', duration: 1.2 },
  { label: 'ANALYZING TEMPORAL FLOW', duration: 2.4 },
  { label: 'SCORING DECEPTION MARKERS', duration: 3.6 },
  { label: 'GENERATING BREAKDOWN', duration: 4.8 },
];

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-8">
      {/* EKG Animation */}
      <div className="relative w-full max-w-sm h-24 overflow-hidden">
        <svg
          viewBox="0 0 280 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[20, 40, 60, 80].map((y) => (
            <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="#1A2840" strokeWidth="0.5" />
          ))}
          {[70, 140, 210].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="#1A2840" strokeWidth="0.5" />
          ))}

          {/* Glow path */}
          <motion.path
            d={EKG_PATH}
            fill="none"
            stroke="rgba(0,207,255,0.2)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop', repeatDelay: 0.5 }}
          />

          {/* Main path */}
          <motion.path
            d={EKG_PATH}
            fill="none"
            stroke="#00CFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop', repeatDelay: 0.5 }}
          />

          {/* Scanning cursor */}
          <motion.rect
            x="0"
            y="0"
            width="3"
            height="100"
            fill="rgba(0,207,255,0.6)"
            rx="1"
            animate={{ x: [0, 280] }}
            transition={{ duration: 2.3, ease: 'linear', repeat: Infinity, repeatDelay: 0 }}
          />
        </svg>
      </div>

      {/* Stage indicators */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {STAGES.map((stage, i) => (
          <motion.div
            key={stage.label}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: stage.duration * 0.3, duration: 0.3 }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              initial={{ background: '#1A2840' }}
              animate={{ background: ['#1A2840', '#00CFFF', '#00E87A'] }}
              transition={{ delay: stage.duration * 0.3, duration: 0.4, times: [0, 0.5, 1] }}
            />
            <motion.span
              className="font-mono text-[10px] tracking-wider"
              initial={{ color: '#3D5166' }}
              animate={{ color: ['#3D5166', '#00CFFF', '#00E87A'] }}
              transition={{ delay: stage.duration * 0.3, duration: 0.4, times: [0, 0.5, 1] }}
            >
              {stage.label}
            </motion.span>
          </motion.div>
        ))}
      </div>

      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="font-mono text-[11px] text-[#3D5166] tracking-[0.3em]"
      >
        PROCESSING...
      </motion.p>
    </div>
  );
}
