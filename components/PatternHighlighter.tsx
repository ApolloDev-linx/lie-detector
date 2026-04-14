'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildTextSegments } from '@/lib/utils';
import { PATTERN_META } from '@/lib/constants';
import type { PatternFlag } from '@/lib/types';

interface PatternHighlighterProps {
  text: string;
  patterns: PatternFlag[];
  onPatternClick?: (pattern: PatternFlag) => void;
}

interface TooltipState {
  pattern: PatternFlag;
  x: number;
  y: number;
}

export default function PatternHighlighter({ text, patterns, onPatternClick }: PatternHighlighterProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const segments = buildTextSegments(text, patterns);

  const handleMouseEnter = (e: React.MouseEvent, pattern: PatternFlag) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      pattern,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <div className="relative">
      {/* Legend */}
      {patterns.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {Array.from(new Set(patterns.map((p) => p.type))).map((type) => {
            const meta = PATTERN_META[type];
            return (
              <div
                key={type}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border"
                style={{ borderColor: `${meta.color}30`, background: meta.bgColor, color: meta.color }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                {meta.label}
              </div>
            );
          })}
        </div>
      )}

      {/* Text with highlights */}
      <div
        className="font-body text-base leading-relaxed text-[#C8D6E5] p-4 rounded-lg border border-[#1A2840] bg-[#0C1220]/60 select-text"
        style={{ lineHeight: '1.9' }}
      >
        {segments.map((segment, i) => {
          if (!segment.pattern) {
            return <span key={i}>{segment.text}</span>;
          }

          const meta = PATTERN_META[segment.pattern.type];
          return (
            <span
              key={i}
              className="pattern-highlight cursor-pointer relative"
              style={{
                background: meta.bgColor,
                color: meta.color,
                borderBottom: `1.5px solid ${meta.color}60`,
              }}
              onMouseEnter={(e) => handleMouseEnter(e, segment.pattern!)}
              onMouseLeave={handleMouseLeave}
              onClick={() => onPatternClick?.(segment.pattern!)}
            >
              {segment.text}
            </span>
          );
        })}
      </div>

      {/* Floating Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="fixed z-50 pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
          >
            <div
              className="max-w-xs rounded-lg p-3 shadow-xl border text-sm"
              style={{
                background: '#0C1220',
                borderColor: `${PATTERN_META[tooltip.pattern.type].color}40`,
                boxShadow: `0 0 20px ${PATTERN_META[tooltip.pattern.type].color}20`,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full"
                  style={{
                    color: PATTERN_META[tooltip.pattern.type].color,
                    background: PATTERN_META[tooltip.pattern.type].bgColor,
                  }}
                >
                  {PATTERN_META[tooltip.pattern.type].label}
                </span>
                <span className="font-mono text-[10px] text-[#3D5166]">
                  {tooltip.pattern.confidence}% confidence
                </span>
              </div>
              <p className="text-[#C8D6E5] text-xs leading-relaxed">
                {tooltip.pattern.explanation}
              </p>
              <div className="mt-1.5 flex gap-1">
                {(['low', 'medium', 'high'] as const).map((s) => (
                  <div
                    key={s}
                    className="h-1 flex-1 rounded-full"
                    style={{
                      background:
                        s === tooltip.pattern.severity ||
                        (s === 'medium' && tooltip.pattern.severity === 'high') ||
                        (s === 'low' && (tooltip.pattern.severity === 'medium' || tooltip.pattern.severity === 'high'))
                          ? PATTERN_META[tooltip.pattern.type].color
                          : '#1A2840',
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
