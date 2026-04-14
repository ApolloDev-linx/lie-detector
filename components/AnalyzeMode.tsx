'use client';

import { useState, useCallback } from 'react';
import InputPanel from './InputPanel';
import ResultsPanel from './ResultsPanel';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import type { AnalysisResult } from '@/lib/types';

type AnalyzeState = 'idle' | 'analyzing' | 'results' | 'error';

export default function AnalyzeMode() {
  const [text, setText] = useState('');
  const [state, setState] = useState<AnalyzeState>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzedText, setAnalyzedText] = useState('');

  const handleAnalyze = useCallback(async () => {
    if (!text.trim() || text.trim().length < 20) return;

    setState('analyzing');
    setError(null);
    setAnalyzedText(text);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const data: AnalysisResult = await res.json();

      // Assign IDs to patterns if missing
      const patterns = data.patterns.map((p, i) => ({
        ...p,
        id: p.id || `p-${i}`,
      }));

      setResult({ ...data, patterns });
      setState('results');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed. Check your API key.';
      setError(message);
      setState('idle');
    }
  }, [text]);

  const handleReset = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
    setAnalyzedText('');
    setText('');
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 min-h-[600px]">
        {/* Left: Input Panel */}
        <div className="panel p-5 flex flex-col">
          <InputPanel
            value={text}
            onChange={setText}
            onAnalyze={handleAnalyze}
            isAnalyzing={state === 'analyzing'}
            error={error}
          />
        </div>

        {/* Right: Results area */}
        <div className={`${state === 'results' ? '' : 'panel'} relative`}>
          {state === 'idle' && <EmptyState />}
          {state === 'analyzing' && <LoadingState />}
          {state === 'results' && result && (
            <ResultsPanel
              result={result}
              originalText={analyzedText}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}
