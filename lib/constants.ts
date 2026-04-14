import type { TrainingScenario, InterrogationScenario, PatternType } from './types';

// ─── Pattern Metadata ────────────────────────────────────────────────────────

export const PATTERN_META: Record<PatternType, { label: string; color: string; bgColor: string; description: string }> = {
  hedging: {
    label: 'Hedging',
    color: '#FFB020',
    bgColor: 'rgba(255, 176, 32, 0.18)',
    description: 'Uncertain language used to avoid commitment',
  },
  distancing: {
    label: 'Distancing',
    color: '#9B6EFF',
    bgColor: 'rgba(155, 110, 255, 0.18)',
    description: 'Language that creates psychological distance from events',
  },
  'over-explanation': {
    label: 'Over-Explain',
    color: '#FF7A3D',
    bgColor: 'rgba(255, 122, 61, 0.18)',
    description: 'Excessive detail on irrelevant points',
  },
  inconsistency: {
    label: 'Inconsistency',
    color: '#FF2855',
    bgColor: 'rgba(255, 40, 85, 0.20)',
    description: 'Contradictory or conflicting statements',
  },
  filler: {
    label: 'Filler Words',
    color: '#7A8FA6',
    bgColor: 'rgba(122, 143, 166, 0.18)',
    description: 'Cognitive load markers suggesting stress',
  },
  qualifier: {
    label: 'Qualifier',
    color: '#00CFFF',
    bgColor: 'rgba(0, 207, 255, 0.15)',
    description: 'Unprompted honesty assertions',
  },
  'tense-shift': {
    label: 'Tense Shift',
    color: '#FF9B2E',
    bgColor: 'rgba(255, 155, 46, 0.18)',
    description: 'Inconsistent verb tense when recalling events',
  },
  'denial-structure': {
    label: 'Formal Denial',
    color: '#FF2855',
    bgColor: 'rgba(255, 40, 85, 0.18)',
    description: 'Overly formal denial pattern ("I did not" vs "I didn\'t")',
  },
  'emotional-flatness': {
    label: 'Flat Affect',
    color: '#3D5166',
    bgColor: 'rgba(61, 81, 102, 0.25)',
    description: 'Absence of expected emotional response',
  },
  'memory-qualification': {
    label: 'Memory Gaps',
    color: '#7A8FA6',
    bgColor: 'rgba(122, 143, 166, 0.15)',
    description: 'Selective or convenient memory uncertainty',
  },
};

// ─── Training Scenarios ──────────────────────────────────────────────────────

export const TRAINING_SCENARIOS: TrainingScenario[] = [
  {
    id: 'ts-1',
    title: 'The Evening Alibi',
    context: 'A neighbor asks where you were last Tuesday evening.',
    text: "I was home all evening. I definitely didn't go out. I made dinner around 7 — pasta or something — and watched TV. My neighbor might have seen my car, but... she wasn't home anyway. I'm just saying, I was there the whole time.",
    isDeceptive: true,
    difficulty: 'easy',
    explanation: "Multiple deception markers: 'definitely didn't' (formal denial), unprompted alibi details, self-correction about the neighbor, and the qualifier 'I'm just saying'.",
    giveaways: [
      '"definitely didn\'t" — formal denial is a classic deception marker',
      'Unprompted mention of the neighbor then immediate retraction',
      '"I\'m just saying" — defensive qualifier',
      'Vague food detail ("pasta or something") mixed with oddly specific time',
    ],
  },
  {
    id: 'ts-2',
    title: 'The Witnessed Accident',
    context: 'Police are asking what you saw at an intersection crash.',
    text: "I heard the squeal of brakes first and looked up. The blue sedan was already sideways — I couldn't see the initial collision. I think it was around 3:15? I'm not 100% sure on the time. The driver looked shaken, he was gripping the wheel even after the car stopped.",
    isDeceptive: false,
    difficulty: 'easy',
    explanation: 'Truthful account: admits gaps in observation, uses sensory-specific details (squeal, gripping the wheel), appropriate uncertainty about time, emotional authenticity.',
    giveaways: [
      'Admits limitation: "couldn\'t see the initial collision"',
      'Sensory-specific detail: squealing brakes, gripping the wheel',
      'Appropriate uncertainty about time with honest acknowledgment',
      'Emotionally congruent detail about the shaken driver',
    ],
  },
  {
    id: 'ts-3',
    title: 'The Missing Report',
    context: 'A manager asks why a project report was never submitted.',
    text: "To be completely honest with you, I thought I had submitted it. I want to be transparent — I worked extremely hard on that report. I can assure you that my intention was never to miss that deadline. The email system may have had issues that day. I am telling you, I did not intentionally withhold it.",
    isDeceptive: true,
    difficulty: 'medium',
    explanation: 'Dense with qualifiers: "to be completely honest", "I want to be transparent", "I can assure you", "I am telling you". Blame displacement to "email system". Formal denial: "I did not".',
    giveaways: [
      'Four separate honesty qualifiers in one short statement',
      'Blame displacement: "email system may have had issues"',
      'Formal denial: "I did not intentionally" — the word "intentionally" is also a hedge',
      'Unprompted emphasis on effort ("worked extremely hard")',
    ],
  },
  {
    id: 'ts-4',
    title: 'The Business Trip',
    context: 'Your partner asks about your recent work trip.',
    text: "It was fine, pretty standard. We had client meetings Monday and Tuesday — boring stuff, mostly numbers. I got back Thursday, stayed at the usual Marriott. Honestly I just wanted to get home. The team dinner Wednesday ran late, so I was exhausted.",
    isDeceptive: false,
    difficulty: 'medium',
    explanation: 'Truthful: natural flow, mild dismissiveness (consistent with boring work trips), specific but not over-explained details, no unprompted alibi construction.',
    giveaways: [
      'Natural hedging ("pretty standard", "boring stuff") consistent with dismissive tone',
      'Chronological flow without gaps or self-corrections',
      'No unprompted denials or honesty qualifiers',
      '"Honestly I just wanted to get home" — emotionally congruent with described exhaustion',
    ],
  },
  {
    id: 'ts-5',
    title: 'The Wallet Incident',
    context: 'A coworker asks if you took money from an unattended wallet.',
    text: "I would never do something like that. That wallet was sitting there when I walked past, yes, I noticed it, but that means nothing. Some of the money was probably already missing before I got there. I have my own money, I don't need to take from anyone. I want to be crystal clear: I did not touch it.",
    isDeceptive: true,
    difficulty: 'hard',
    explanation: 'A sophisticated liar: distancing ("that wallet" not "the wallet"), preemptive minimization ("probably already missing"), unsolicited financial justification, formal concluding denial.',
    giveaways: [
      '"That wallet" — psychological distancing from the object',
      'Preemptive damage control: "probably already missing before I got there"',
      'Unsolicited justification: "I have my own money"',
      '"I want to be crystal clear" + formal denial to close — over-engineered ending',
    ],
  },
  {
    id: 'ts-6',
    title: 'The Lab Results',
    context: 'A doctor is asking a patient about medication compliance.',
    text: "I've been trying to take them, I really have. Sometimes I forget, maybe... two or three times a week? I know that's bad. The side effects make me feel kind of sick in the mornings, so I've been skipping those. I know I should call you about that but — honestly I kept hoping it would get better on its own.",
    isDeceptive: false,
    difficulty: 'hard',
    explanation: 'Truthful non-compliance confession: self-aware guilt, voluntary admission of frequency, specific side effect information, honest reasoning. Hedging is present but reflects genuine uncertainty, not deception.',
    giveaways: [
      'Self-incriminating specificity: "two or three times a week"',
      'Volunteers guilt: "I know that\'s bad"',
      'Specific mechanism: morning side effects causing skips',
      'Honest reasoning ("hoping it would get better") rather than excuse or blame',
    ],
  },
];

// ─── Interrogation Scenarios ─────────────────────────────────────────────────

export const INTERROGATION_SCENARIOS: InterrogationScenario[] = [
  {
    id: 'int-1',
    title: 'The Missing Laptop',
    setup: "A company laptop worth $2,400 went missing from the 3rd floor office overnight. Only four employees had keycard access that evening. You're interrogating Marcus Webb, a mid-level analyst.",
    crime: 'theft of company property',
    suspectName: 'Marcus Webb',
    suspectPersona: 'Marcus is a 34-year-old analyst who has been with the company 3 years. He is financially stressed due to a recent divorce.',
    isGuilty: true,
    backstory: 'Marcus took the laptop, intending to sell it. He entered the office at 7:42 PM, claiming he forgot his phone. He hid the laptop in his gym bag.',
    evidence: ['Keycard log shows Marcus entered at 7:42 PM, exited at 8:03 PM', 'Security camera at entrance shows him with a gym bag on exit', 'His phone was found at his desk the next morning'],
  },
  {
    id: 'int-2',
    title: 'The Gallery Fire',
    setup: "A small art gallery was deliberately set on fire last Saturday. Two pieces were destroyed (insured for $40,000 each). You\'re interrogating Sofia Navarro, the gallery\'s co-owner and business partner of the primary owner.",
    crime: 'arson and insurance fraud',
    suspectName: 'Sofia Navarro',
    suspectPersona: 'Sofia, 41, co-owns the gallery and has been arguing with her business partner over its financial direction. The gallery has been losing money.',
    isGuilty: false,
    backstory: 'Sofia is innocent. She was at a documented dinner event across town. The fire was set by a disgruntled former employee, but Sofia does not know this and is genuinely confused and distressed.',
    evidence: ['Her key was not used that evening', 'She has a confirmed alibi at a fundraiser dinner', 'Security footage shows an unidentified person entering via a side door'],
  },
  {
    id: 'int-3',
    title: 'The Leaked Memo',
    setup: "An internal strategic memo was leaked to a competitor, costing the company a major contract. The memo was only distributed to three senior managers. You\'re interrogating Daniel Okafor, VP of Operations.",
    crime: 'corporate espionage / breach of confidentiality',
    suspectName: 'Daniel Okafor',
    suspectPersona: 'Daniel, 47, VP of Operations. Recently passed over for a promotion in favor of a younger colleague. Has been visibly resentful.',
    isGuilty: true,
    backstory: 'Daniel photographed the memo and sent it to a contact at the competitor firm. He was motivated by resentment over the promotion decision. He deleted the outgoing message from his work phone but forgot his personal email.',
    evidence: ['He was the last to access the shared document before the leak', 'Unusual login to the document at 11:47 PM from an unfamiliar IP', 'His work phone shows deleted messages around the same timeframe'],
  },
];

// ─── Verdict Config ──────────────────────────────────────────────────────────

export const VERDICT_CONFIG = {
  truthful: { label: 'TRUTHFUL', color: '#00E87A', glow: 'rgba(0,232,122,0.3)', range: '0–25' },
  uncertain: { label: 'UNCERTAIN', color: '#FFB020', glow: 'rgba(255,176,32,0.3)', range: '26–45' },
  suspicious: { label: 'SUSPICIOUS', color: '#FF7A3D', glow: 'rgba(255,122,61,0.3)', range: '46–70' },
  deceptive: { label: 'DECEPTIVE', color: '#FF2855', glow: 'rgba(255,40,85,0.3)', range: '71–100' },
};
