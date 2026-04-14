'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react';
import { TRAINING_SCENARIOS } from '@/lib/constants';
import type { TrainingScenario, Difficulty } from '@/lib/types';

const DIFFICULTY_COLORS: Record<Difficulty, { color: string; bg: string }> = {
  easy:   { color: '#00E87A', bg: 'rgba(0,232,122,0.1)' },
  medium: { color: '#FFB020', bg: 'rgba(255,176,32,0.1)' },
  hard:   { color: '#FF2855', bg: 'rgba(255,40,85,0.1)' },
};

type ScenarioState = 'reading' | 'guessing' | 'revealed';

interface ScenarioProgress {
  state: ScenarioState;
  guess?: boolean;
  correct?: boolean;
}

export default function TrainingMode() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState<Record<string, ScenarioProgress>>({});
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const scenario = TRAINING_SCENARIOS[current];
  const sp = progress[scenario.id] ?? { state: 'reading' };

  const handleGuess = (isDeceptive: boolean) => {
    const correct = isDeceptive === scenario.isDeceptive;
    setProgress((p) => ({
      ...p,
      [scenario.id]: { state: 'revealed', guess: isDeceptive, correct },
    }));
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  };

  const goNext = () => {
    if (current < TRAINING_SCENARIOS.length - 1) {
      setCurrent((c) => c + 1);
    }
  };

  const goPrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const reset = () => {
    setCurrent(0);
    setProgress({});
    setScore({ correct: 0, total: 0 });
  };

  const allDone = score.total === TRAINING_SCENARIOS.length;

  if (allDone) {
    const pct = Math.round((score.correct / score.total) * 100);
    return <TrainingComplete score={score.correct} total={score.total} pct={pct} onReset={reset} />;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 flex flex-col gap-6">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-[#E2EAF4] tracking-[0.2em] text-base">TRAINING MODULE</h2>
          <p className="font-mono text-[10px] text-[#3D5166] mt-0.5">
            Scenario {current + 1} of {TRAINING_SCENARIOS.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs text-[#7A8FA6]">
            <span className="text-[#00E87A]">{score.correct}</span>
            <span className="text-[#3D5166]">/{score.total}</span>
          </div>
          <button onClick={reset} className="p-2 text-[#3D5166] hover:text-[#7A8FA6] rounded hover:bg-[#1A2840] transition-all">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#1A2840] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#00CFFF] rounded-full"
          animate={{ width: `${((current) / TRAINING_SCENARIOS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Scenario dots */}
      <div className="flex gap-2 justify-center">
        {TRAINING_SCENARIOS.map((s, i) => {
          const p = progress[s.id];
          return (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                background: p?.correct === true
                  ? '#00E87A'
                  : p?.correct === false
                  ? '#FF2855'
                  : i === current
                  ? '#00CFFF'
                  : '#1A2840',
              }}
            />
          );
        })}
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="panel p-6 flex flex-col gap-5"
        >
          {/* Card header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-[#E2EAF4] tracking-wider text-base">{scenario.title}</h3>
              <p className="text-xs text-[#7A8FA6] mt-1 leading-relaxed">{scenario.context}</p>
            </div>
            <span
              className="font-mono text-[9px] tracking-widest px-2 py-1 rounded shrink-0 uppercase"
              style={{
                color: DIFFICULTY_COLORS[scenario.difficulty].color,
                background: DIFFICULTY_COLORS[scenario.difficulty].bg,
              }}
            >
              {scenario.difficulty}
            </span>
          </div>

          {/* Statement */}
          <div className="relative p-4 rounded-lg border border-[#243652] bg-[#0C1220]/60">
            <div className="absolute top-3 left-3 font-mono text-[9px] text-[#3D5166] tracking-widest">STATEMENT</div>
            <p className="text-[#C8D6E5] text-sm leading-relaxed mt-4 font-body italic">
              &ldquo;{scenario.text}&rdquo;
            </p>
          </div>

          {/* Guessing area */}
          {sp.state === 'reading' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
              <p className="font-mono text-[10px] text-[#3D5166] tracking-wider text-center">
                IS THIS STATEMENT TRUTHFUL OR DECEPTIVE?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleGuess(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded border border-[#00E87A]/20 bg-[#00E87A]/6 text-[#00E87A] font-display tracking-widest text-sm hover:bg-[#00E87A]/12 hover:border-[#00E87A]/40 transition-all"
                >
                  <CheckCircle2 size={16} />
                  TRUTHFUL
                </button>
                <button
                  onClick={() => handleGuess(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded border border-[#FF2855]/20 bg-[#FF2855]/6 text-[#FF2855] font-display tracking-widest text-sm hover:bg-[#FF2855]/12 hover:border-[#FF2855]/40 transition-all"
                >
                  <XCircle size={16} />
                  DECEPTIVE
                </button>
              </div>
            </motion.div>
          )}

          {/* Reveal area */}
          {sp.state === 'revealed' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              {/* Result banner */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded border"
                style={{
                  borderColor: sp.correct ? 'rgba(0,232,122,0.3)' : 'rgba(255,40,85,0.3)',
                  background: sp.correct ? 'rgba(0,232,122,0.06)' : 'rgba(255,40,85,0.06)',
                }}
              >
                {sp.correct ? (
                  <CheckCircle2 size={18} className="text-[#00E87A] shrink-0" />
                ) : (
                  <XCircle size={18} className="text-[#FF2855] shrink-0" />
                )}
                <div>
                  <div
                    className="font-display tracking-widest text-sm"
                    style={{ color: sp.correct ? '#00E87A' : '#FF2855' }}
                  >
                    {sp.correct ? 'CORRECT' : 'INCORRECT'}
                  </div>
                  <div className="font-mono text-[10px] text-[#7A8FA6] mt-0.5">
                    This statement is{' '}
                    <span className={scenario.isDeceptive ? 'text-[#FF2855]' : 'text-[#00E87A]'}>
                      {scenario.isDeceptive ? 'DECEPTIVE' : 'TRUTHFUL'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-3 rounded border border-[#1A2840] bg-[#0C1220]/50">
                <div className="font-mono text-[9px] text-[#3D5166] tracking-widest mb-2">ANALYSIS</div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{scenario.explanation}</p>
              </div>

              {/* Giveaways */}
              <div>
                <div className="font-mono text-[9px] text-[#3D5166] tracking-widest mb-2">KEY TELLS</div>
                <div className="flex flex-col gap-1.5">
                  {scenario.giveaways.map((g, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#7A8FA6]">
                      <span className="text-[#00CFFF] font-mono mt-0.5 shrink-0">›</span>
                      {g}
                    </div>
                  ))}
                </div>
              </div>

              {/* Next button */}
              <div className="flex justify-between">
                <button
                  onClick={goPrev}
                  disabled={current === 0}
                  className="px-3 py-2 text-xs font-mono text-[#3D5166] disabled:opacity-30 hover:text-[#7A8FA6] border border-transparent hover:border-[#1A2840] rounded transition-all"
                >
                  ← PREV
                </button>
                <button
                  onClick={goNext}
                  disabled={current === TRAINING_SCENARIOS.length - 1}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-display tracking-widest text-[#00CFFF] border border-[#00CFFF]/20 rounded hover:bg-[#00CFFF]/8 transition-all disabled:opacity-30"
                >
                  NEXT <ChevronRight size={13} />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TrainingComplete({ score, total, pct, onReset }: { score: number; total: number; pct: number; onReset: () => void }) {
  const grade = pct >= 90 ? 'EXPERT ANALYST' : pct >= 70 ? 'SKILLED INVESTIGATOR' : pct >= 50 ? 'JUNIOR ANALYST' : 'TRAINING REQUIRED';
  const gradeColor = pct >= 90 ? '#00E87A' : pct >= 70 ? '#00CFFF' : pct >= 50 ? '#FFB020' : '#FF2855';

  return (
    <div className="max-w-md mx-auto py-16 px-4 flex flex-col items-center gap-6">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
        <Trophy size={48} className="text-[#FFB020]" style={{ filter: 'drop-shadow(0 0 16px rgba(255,176,32,0.4))' }} />
      </motion.div>
      <div className="text-center">
        <div className="font-display text-4xl font-800 mb-1" style={{ color: gradeColor }}>
          {pct}%
        </div>
        <div className="font-mono tracking-[0.3em] text-sm" style={{ color: gradeColor }}>{grade}</div>
        <p className="text-[#7A8FA6] text-sm mt-2">
          {score} correct out of {total} scenarios
        </p>
      </div>
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-6 py-3 rounded border border-[#243652] font-display tracking-widest text-sm text-[#7A8FA6] hover:border-[#00CFFF]/30 hover:text-[#00CFFF] transition-all"
      >
        <RotateCcw size={14} />
        RETAKE TRAINING
      </button>
    </div>
  );
}
