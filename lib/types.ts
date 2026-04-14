// ─── Pattern Types ──────────────────────────────────────────────────────────

export type PatternType =
  | 'hedging'
  | 'distancing'
  | 'over-explanation'
  | 'inconsistency'
  | 'filler'
  | 'qualifier'
  | 'tense-shift'
  | 'denial-structure'
  | 'emotional-flatness'
  | 'memory-qualification';

export type Severity = 'low' | 'medium' | 'high';
export type Verdict = 'truthful' | 'uncertain' | 'suspicious' | 'deceptive';
export type AppMode = 'analyze' | 'training' | 'interrogation';
export type Difficulty = 'easy' | 'medium' | 'hard';

// ─── Analysis Types ─────────────────────────────────────────────────────────

export interface PatternFlag {
  id: string;
  type: PatternType;
  phrase: string;
  explanation: string;
  severity: Severity;
  confidence: number;
}

export interface LinguisticProfile {
  hedgingDensity: number;       // 0–100
  qualifierUsage: number;       // 0–100
  negationPatterns: number;     // 0–100
  temporalConsistency: number;  // 0–100
  emotionalAuthenticity: number; // 0–100
}

export interface AnalysisResult {
  deceptionScore: number;       // 0–100
  confidence: number;           // 0–100
  verdict: Verdict;
  summary: string;
  patterns: PatternFlag[];
  keyInsights: string[];
  linguisticProfile: LinguisticProfile;
}

// ─── Training Types ──────────────────────────────────────────────────────────

export interface TrainingScenario {
  id: string;
  title: string;
  context: string;
  text: string;
  isDeceptive: boolean;
  difficulty: Difficulty;
  explanation: string;
  giveaways: string[];
}

export type TrainingState = 'reading' | 'guessing' | 'revealed';

// ─── Interrogation Types ─────────────────────────────────────────────────────

export interface InterrogationMessage {
  id: string;
  role: 'detective' | 'suspect' | 'system';
  content: string;
  timestamp: string;
  analysis?: {
    deceptionScore: number;
    flags: string[];
  };
}

export interface InterrogationScenario {
  id: string;
  title: string;
  setup: string;
  crime: string;
  suspectName: string;
  suspectPersona: string;
  isGuilty: boolean;
  backstory: string;
  evidence: string[];
}

export type InterrogationPhase = 'briefing' | 'interrogating' | 'verdict' | 'reveal';
