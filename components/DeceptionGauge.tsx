'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { scoreToColor } from '@/lib/utils';
import { VERDICT_CONFIG } from '@/lib/constants';
import type { Verdict } from '@/lib/types';

interface DeceptionGaugeProps {
  score: number;
  verdict: Verdict;
  confidence: number;
  animated?: boolean;
}

const RADIUS = 64;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// We use a 270-degree arc (from 135° to 405°) — a 3/4 circle gauge
const ARC_FRACTION = 0.75;
const ARC_LENGTH = CIRCUMFERENCE * ARC_FRACTION;

function scoreToOffset(score: number): number {
  const filled = (score / 100) * ARC_LENGTH;
  return ARC_LENGTH - filled;
}

export default function DeceptionGauge({ score, verdict, confidence, animated = true }: DeceptionGaugeProps) {
  const motionScore = useMotionValue(0);
  const displayScore = useRef<SVGTextElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const color = scoreToColor(score);
  const verdictConfig = VERDICT_CONFIG[verdict];

  useEffect(() => {
    if (!animated) {
      motionScore.set(score);
      return;
    }
    const controls = animate(motionScore, score, {
      duration: 1.4,
      ease: [0.34, 1.56, 0.64, 1],
      onUpdate: (v) => {
        if (displayScore.current) {
          displayScore.current.textContent = Math.round(v).toString();
        }
        if (arcRef.current) {
          arcRef.current.style.strokeDashoffset = scoreToOffset(v).toString();
          arcRef.current.style.stroke = scoreToColor(v);
        }
      },
    });
    return () => controls.stop();
  }, [score, animated]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* SVG Gauge */}
      <div className="relative">
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          className="overflow-visible"
          style={{ filter: `drop-shadow(0 0 16px ${color}40)` }}
        >
          {/* Track arc */}
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke="#1A2840"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
            strokeDashoffset="0"
            transform="rotate(135 90 90)"
          />

          {/* Fill arc */}
          <circle
            ref={arcRef}
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
            strokeDashoffset={animated ? ARC_LENGTH : scoreToOffset(score)}
            transform="rotate(135 90 90)"
            style={{ transition: animated ? 'none' : undefined }}
          />

          {/* Glow arc (thicker, lower opacity) */}
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
            strokeDashoffset={animated ? ARC_LENGTH : scoreToOffset(score)}
            transform="rotate(135 90 90)"
            opacity="0.12"
            ref={animated ? undefined : undefined}
          />

          {/* Score number */}
          <text
            ref={displayScore}
            x="90"
            y="85"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize="36"
            fontFamily="Oxanium"
            fontWeight="700"
            letterSpacing="1"
          >
            {animated ? '0' : score}
          </text>

          {/* "/100" label */}
          <text
            x="90"
            y="108"
            textAnchor="middle"
            fill="#3D5166"
            fontSize="11"
            fontFamily="JetBrains Mono"
            letterSpacing="1"
          >
            / 100
          </text>

          {/* Min/Max labels */}
          <text x="22" y="158" fill="#3D5166" fontSize="10" fontFamily="JetBrains Mono">0</text>
          <text x="148" y="158" fill="#3D5166" fontSize="10" fontFamily="JetBrains Mono">100</text>
        </svg>
      </div>

      {/* Verdict badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="flex flex-col items-center gap-1"
      >
        <div
          className="verdict-stamp text-lg tracking-[0.3em] px-4 py-1 rounded"
          style={{
            color: verdictConfig.color,
            border: `1px solid ${verdictConfig.color}40`,
            background: `${verdictConfig.color}10`,
            textShadow: `0 0 12px ${verdictConfig.color}80`,
          }}
        >
          {verdictConfig.label}
        </div>
        <div className="font-mono text-[10px] text-[#3D5166] tracking-wider">
          CONFIDENCE: {confidence}%
        </div>
      </motion.div>
    </div>
  );
}
