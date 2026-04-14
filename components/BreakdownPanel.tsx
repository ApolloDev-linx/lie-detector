'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { PATTERN_META } from '@/lib/constants';
import type { PatternFlag, AnalysisResult, Severity } from '@/lib/types';

interface BreakdownPanelProps {
  result: AnalysisResult;
  activePattern: PatternFlag | null;
  onPatternSelect: (pattern: PatternFlag | null) => void;
}

const SEVERITY_ICONS: Record<Severity, React.ReactNode> = {
  high:   <AlertTriangle size={12} />,
  medium: <AlertCircle  size={12} />,
  low:    <Info          size={12} />,
};

const PROFILE_LABELS: Record<keyof AnalysisResult['linguisticProfile'], string> = {
  hedgingDensity:       'Hedging Density',
  qualifierUsage:       'Qualifier Usage',
  negationPatterns:     'Negation Patterns',
  temporalConsistency:  'Temporal Consistency',
  emotionalAuthenticity:'Emotional Authenticity',
};

// For "consistency" and "authenticity" metrics, higher = more truthful
const INVERTED_METRICS = new Set(['temporalConsistency', 'emotionalAuthenticity']);

function profileColor(key: string, value: number): string {
  const truthGood = INVERTED_METRICS.has(key);
  if (truthGood) {
    if (value >= 70) return '#00E87A';
    if (value >= 40) return '#FFB020';
    return '#FF2855';
  } else {
    if (value <= 30) return '#00E87A';
    if (value <= 60) return '#FFB020';
    return '#FF2855';
  }
}

export default function BreakdownPanel({ result, activePattern, onPatternSelect }: BreakdownPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const highSeverity = result.patterns.filter((p) => p.severity === 'high');
  const mediumSeverity = result.patterns.filter((p) => p.severity === 'medium');
  const lowSeverity = result.patterns.filter((p) => p.severity === 'low');
  const sorted = [...highSeverity, ...mediumSeverity, ...lowSeverity];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Key Insights */}
      <div>
        <div className="font-mono text-[10px] text-[#3D5166] tracking-widest mb-2 flex items-center gap-2">
          <div className="h-px flex-1 bg-[#1A2840]" />
          KEY INSIGHTS
          <div className="h-px flex-1 bg-[#1A2840]" />
        </div>
        <div className="flex flex-col gap-1.5">
          {result.keyInsights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              className="flex items-start gap-2 text-xs text-[#94A3B8] leading-relaxed px-3 py-2 rounded border border-[#1A2840] bg-[#0C1220]/50"
            >
              <span className="text-[#00CFFF] mt-0.5 shrink-0 font-mono">›</span>
              {insight}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="px-3 py-2.5 rounded border border-[#1A2840] bg-[#0C1220]/50">
        <div className="font-mono text-[10px] text-[#3D5166] tracking-widest mb-1.5">ASSESSMENT</div>
        <p className="text-xs text-[#C8D6E5] leading-relaxed">{result.summary}</p>
      </div>

      {/* Detected Patterns */}
      <div>
        <div className="font-mono text-[10px] text-[#3D5166] tracking-widest mb-2 flex items-center gap-2">
          <div className="h-px flex-1 bg-[#1A2840]" />
          FLAGS ({sorted.length})
          <div className="h-px flex-1 bg-[#1A2840]" />
        </div>

        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
          <AnimatePresence>
            {sorted.map((pattern, i) => {
              const meta = PATTERN_META[pattern.type];
              const isExpanded = expandedId === pattern.id;
              const isActive = activePattern?.id === pattern.id;

              return (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`rounded border transition-all duration-150 overflow-hidden cursor-pointer ${
                    isActive ? 'border-opacity-60' : 'border-[#1A2840] hover:border-[#243652]'
                  }`}
                  style={isActive ? { borderColor: `${meta.color}50`, background: `${meta.color}06` } : {}}
                  onClick={() => {
                    setExpandedId(isExpanded ? null : pattern.id);
                    onPatternSelect(isActive ? null : pattern);
                  }}
                >
                  <div className="flex items-center gap-2 px-3 py-2">
                    {/* Severity icon */}
                    <span style={{ color: meta.color }}>{SEVERITY_ICONS[pattern.severity]}</span>

                    {/* Type badge */}
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: meta.bgColor, color: meta.color }}
                    >
                      {meta.label}
                    </span>

                    {/* Phrase */}
                    <span className="text-xs text-[#94A3B8] truncate flex-1 font-mono">
                      &ldquo;{pattern.phrase}&rdquo;
                    </span>

                    {/* Confidence */}
                    <span className="font-mono text-[9px] text-[#3D5166] shrink-0">
                      {pattern.confidence}%
                    </span>

                    <ChevronDown
                      size={12}
                      className={`text-[#3D5166] shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="border-t px-3 py-2"
                        style={{ borderColor: `${meta.color}20` }}
                      >
                        <p className="text-[11px] text-[#7A8FA6] leading-relaxed">
                          {pattern.explanation}
                        </p>
                        <div className="mt-2 flex gap-1 items-center">
                          <span className="font-mono text-[9px] text-[#3D5166]">SEVERITY</span>
                          {(['low', 'medium', 'high'] as const).map((s) => (
                            <div
                              key={s}
                              className="h-1.5 flex-1 rounded-full transition-colors"
                              style={{
                                background:
                                  (s === 'low') ||
                                  (s === 'medium' && (pattern.severity === 'medium' || pattern.severity === 'high')) ||
                                  (s === 'high' && pattern.severity === 'high')
                                    ? meta.color
                                    : '#1A2840',
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {sorted.length === 0 && (
            <div className="text-center py-4 text-xs text-[#3D5166] font-mono">
              NO DECEPTION MARKERS DETECTED
            </div>
          )}
        </div>
      </div>

      {/* Linguistic Profile */}
      <div>
        <button
          className="w-full flex items-center gap-2 font-mono text-[10px] text-[#3D5166] tracking-widest mb-2 hover:text-[#7A8FA6] transition-colors"
          onClick={() => setShowProfile((v) => !v)}
        >
          <div className="h-px flex-1 bg-[#1A2840]" />
          LINGUISTIC PROFILE
          <ChevronDown size={10} className={`transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          <div className="h-px flex-1 bg-[#1A2840]" />
        </button>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2 overflow-hidden"
            >
              {(Object.entries(result.linguisticProfile) as [keyof typeof result.linguisticProfile, number][]).map(
                ([key, value]) => {
                  const color = profileColor(key, value);
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="font-mono text-[9px] text-[#3D5166] w-36 shrink-0">
                        {PROFILE_LABELS[key]}
                      </span>
                      <div className="flex-1 h-1.5 bg-[#1A2840] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                      <span className="font-mono text-[9px] w-8 text-right" style={{ color }}>
                        {value}
                      </span>
                    </div>
                  );
                }
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
