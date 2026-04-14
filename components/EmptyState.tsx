'use client';

import { motion } from 'framer-motion';
import { ScanSearch, Shield, Crosshair, BarChart3 } from 'lucide-react';

const FEATURES = [
  {
    icon: <ScanSearch size={16} />,
    title: 'Pattern Detection',
    desc: 'Identifies hedging, distancing, qualifiers, tense shifts, and 7 other evidence-based deception markers.',
  },
  {
    icon: <Crosshair size={16} />,
    title: 'Phrase-Level Flags',
    desc: 'Pinpoints the exact words and phrases that triggered each flag with explanations.',
  },
  {
    icon: <BarChart3 size={16} />,
    title: 'Linguistic Profile',
    desc: 'Breaks down hedging density, emotional authenticity, temporal consistency, and more.',
  },
  {
    icon: <Shield size={16} />,
    title: 'Explainable Analysis',
    desc: 'Every flag comes with a reason — this is behavioral pattern analysis, not "AI magic".',
  },
];

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-8 px-4 py-8">
      {/* Central icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-full border border-[#1A2840] flex items-center justify-center relative"
          style={{ background: 'radial-gradient(circle, rgba(0,207,255,0.06) 0%, transparent 70%)' }}>
          <ScanSearch size={32} className="text-[#243652]" />
          {/* Orbital ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-dashed border-[#1A2840]"
          />
          {/* Ping dot */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00CFFF]"
          />
        </div>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-center"
      >
        <h2 className="font-display text-lg text-[#7A8FA6] tracking-[0.2em] uppercase mb-1">
          Awaiting Input
        </h2>
        <p className="text-sm text-[#3D5166] max-w-xs">
          Enter a statement on the left to begin behavioral pattern analysis.
        </p>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full max-w-sm">
        <div className="h-px flex-1 bg-[#1A2840]" />
        <span className="font-mono text-[9px] text-[#3D5166] tracking-widest">CAPABILITIES</span>
        <div className="h-px flex-1 bg-[#1A2840]" />
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="panel p-3 flex gap-3"
          >
            <span className="text-[#00CFFF]/40 mt-0.5 shrink-0">{f.icon}</span>
            <div>
              <p className="font-mono text-[10px] text-[#7A8FA6] tracking-wider mb-0.5">{f.title}</p>
              <p className="text-xs text-[#3D5166] leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="font-mono text-[9px] text-[#2E4470] tracking-wider text-center max-w-sm"
      >
        VERITY IS A LINGUISTIC PATTERN TOOL — NOT A VERIFIED LIE DETECTION SYSTEM
      </motion.p>
    </div>
  );
}
