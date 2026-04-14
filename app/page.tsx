'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '@/components/Header';
import AnalyzeMode from '@/components/AnalyzeMode';
import TrainingMode from '@/components/TrainingMode';
import InterrogationMode from '@/components/InterrogationMode';
import type { AppMode } from '@/lib/types';

export default function Home() {
  const [mode, setMode] = useState<AppMode>('analyze');

  return (
    <div className="min-h-screen flex flex-col">
      <Header mode={mode} onModeChange={setMode} />

      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {mode === 'analyze'       && <AnalyzeMode />}
            {mode === 'training'      && <TrainingMode />}
            {mode === 'interrogation' && <InterrogationMode />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
