import type { PatternFlag, Verdict, Severity } from './types';

// ─── Text Highlighting ───────────────────────────────────────────────────────

export interface TextSegment {
  text: string;
  pattern?: PatternFlag;
}

export function buildTextSegments(text: string, patterns: PatternFlag[]): TextSegment[] {
  if (!patterns.length) return [{ text }];

  // Find all phrase occurrences in text
  const matches: Array<{ start: number; end: number; pattern: PatternFlag }> = [];

  for (const pattern of patterns) {
    const phraseLower = pattern.phrase.toLowerCase().trim();
    if (!phraseLower) continue;
    const textLower = text.toLowerCase();
    let searchFrom = 0;

    while (searchFrom < text.length) {
      const idx = textLower.indexOf(phraseLower, searchFrom);
      if (idx === -1) break;
      matches.push({ start: idx, end: idx + phraseLower.length, pattern });
      searchFrom = idx + 1;
      break; // only first occurrence per pattern
    }
  }

  if (!matches.length) return [{ text }];

  // Sort by start; resolve overlaps by keeping earlier match
  matches.sort((a, b) => a.start - b.start);
  const resolved: typeof matches = [];
  let lastEnd = 0;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      resolved.push(m);
      lastEnd = m.end;
    }
  }

  // Build segments
  const segments: TextSegment[] = [];
  let pos = 0;
  for (const m of resolved) {
    if (m.start > pos) {
      segments.push({ text: text.slice(pos, m.start) });
    }
    segments.push({ text: text.slice(m.start, m.end), pattern: m.pattern });
    pos = m.end;
  }
  if (pos < text.length) {
    segments.push({ text: text.slice(pos) });
  }

  return segments;
}

// ─── Score Helpers ───────────────────────────────────────────────────────────

export function scoreToVerdict(score: number): Verdict {
  if (score <= 25) return 'truthful';
  if (score <= 45) return 'uncertain';
  if (score <= 70) return 'suspicious';
  return 'deceptive';
}

export function scoreToColor(score: number): string {
  if (score <= 25) return '#00E87A';
  if (score <= 45) return '#FFB020';
  if (score <= 70) return '#FF7A3D';
  return '#FF2855';
}

export function severityToWeight(severity: Severity): number {
  return { low: 1, medium: 2, high: 3 }[severity];
}

// ─── Time ────────────────────────────────────────────────────────────────────

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Text Stats ──────────────────────────────────────────────────────────────

export function getTextStats(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  return {
    words: words.length,
    sentences: sentences.length,
    characters: text.length,
    avgWordsPerSentence: sentences.length ? Math.round(words.length / sentences.length) : 0,
  };
}

// ─── Misc ────────────────────────────────────────────────────────────────────

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
