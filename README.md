# VERITY — AI Behavioral Analysis Tool

> A forensic linguistic pattern analyzer that detects deception markers in text using Claude AI.

![VERITY Screenshot](./public/preview.png)

---

## What It Does

VERITY analyzes text for **evidence-based behavioral deception patterns** — it doesn't claim to "detect lies" magically. Every flag comes with an explanation of *why* it's suspicious, grounded in real linguistic research (Statement Validity Analysis, SCAN methodology, cognitive load research).

### Three Modes

| Mode | Description |
|------|-------------|
| **ANALYZE** | Paste/type/speak text. Get a deception score, annotated highlights, and a full breakdown. |
| **TRAINING** | 6 real-world scenarios. Guess truthful/deceptive before the reveal. Scored at the end. |
| **INTERROGATION** | Play detective. Question an AI suspect (guilty or innocent). Make your accusation. |

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| AI | Anthropic Claude API (`claude-opus-4-6` for analysis, `claude-sonnet-4-6` for interrogation) |
| Speech | Web Speech API (browser native) |

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo>
cd ai-lie-detector
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get an API key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

##  Project Structure

```
ai-lie-detector/
├── app/
│   ├── layout.tsx              # Root layout, metadata, font import
│   ├── page.tsx                # Main page with mode routing
│   ├── globals.css             # CSS variables, animations, base styles
│   └── api/
│       ├── analyze/route.ts    # POST /api/analyze — forensic text analysis
│       └── interrogate/route.ts # POST /api/interrogate — suspect roleplay + analysis
│
├── components/
│   ├── Header.tsx              # Top nav with mode tabs
│   ├── AnalyzeMode.tsx         # Analyze mode orchestrator
│   ├── InputPanel.tsx          # Text input + speech recognition
│   ├── ResultsPanel.tsx        # Analysis results layout
│   ├── DeceptionGauge.tsx      # Animated SVG arc gauge
│   ├── PatternHighlighter.tsx  # Text with color-coded highlights + tooltips
│   ├── BreakdownPanel.tsx      # Flagged patterns + linguistic profile
│   ├── TrainingMode.tsx        # Scenario-based training module
│   ├── InterrogationMode.tsx   # Detective/suspect chat game
│   ├── LoadingState.tsx        # EKG animation during analysis
│   └── EmptyState.tsx          # Pre-analysis landing content
│
├── hooks/
│   └── useSpeech.ts            # Web Speech API hook
│
└── lib/
    ├── types.ts                # All TypeScript interfaces
    ├── constants.ts            # Training/interrogation scenarios, pattern metadata
    └── utils.ts                # Text segmentation, score helpers, formatting
```

---

## 🔬 Detected Deception Patterns

| Pattern | Description |
|---------|-------------|
| **Hedging** | "maybe", "I think", "sort of", "I believe" |
| **Qualifier** | "honestly", "to be honest", "I swear", "believe me" |
| **Distancing** | "that" vs "this", passive voice, third-person self-reference |
| **Over-Explanation** | Unnecessary detail, unprompted justifications |
| **Formal Denial** | "I did not" vs "I didn't" — unnatural in casual speech |
| **Tense Shift** | Switching to present tense mid-story (common in fabrication) |
| **Inconsistency** | Contradictory statements within the same passage |
| **Emotional Flatness** | Absence of expected emotional language |
| **Filler Words** | "um", "uh", "like", "you know" (cognitive load markers) |
| **Memory Qualification** | Selective "I can't remember" on key moments |

---

##  API Reference

### `POST /api/analyze`

```json
// Request
{ "text": "string (min 20 chars)" }

// Response
{
  "deceptionScore": 73,
  "confidence": 85,
  "verdict": "suspicious",
  "summary": "...",
  "patterns": [
    {
      "id": "abc123",
      "type": "qualifier",
      "phrase": "to be honest",
      "explanation": "...",
      "severity": "high",
      "confidence": 92
    }
  ],
  "keyInsights": ["...", "...", "..."],
  "linguisticProfile": {
    "hedgingDensity": 45,
    "qualifierUsage": 80,
    "negationPatterns": 30,
    "temporalConsistency": 60,
    "emotionalAuthenticity": 40
  }
}
```

### `POST /api/interrogate`

```json
// Request
{
  "scenario": { InterrogationScenario },
  "messages": [ InterrogationMessage[] ],
  "newMessage": "string"
}

// Response
{
  "response": "Suspect's reply...",
  "analysis": {
    "deceptionScore": 68,
    "flags": ["hedging language", "over-qualified"]
  }
}
```

---

##  Design System

**Palette:**
- `#060A10` — Background base
- `#00CFFF` — Cyan (primary accent / truthful-leaning)
- `#00E87A` — Green (truthful verdict)
- `#FF2855` — Red (deceptive verdict)
- `#FFB020` — Amber (uncertain)

**Fonts:**
- `Oxanium` — Display / scores / verdicts
- `DM Sans` — Body text
- `JetBrains Mono` — Data / labels / mono

---

## ⚖️ Important Disclaimer

VERITY is a **linguistic pattern analysis tool** — not a verified lie detection system. Deception analysis based on language patterns alone has significant limitations:

- Nervous people may exhibit deception markers while telling the truth
- Cultural and neurodivergent communication differences affect output
- Short texts yield less reliable results
- This is not admissible as evidence in any legal context

Use for educational purposes, creative writing, research, and entertainment only.

---

## 🔧 Extending the App

**Add more training scenarios** → `lib/constants.ts` — `TRAINING_SCENARIOS` array

**Add more interrogation cases** → `lib/constants.ts` — `INTERROGATION_SCENARIOS` array

**Tune the analysis prompt** → `app/api/analyze/route.ts` — `SYSTEM_PROMPT`

**Change the models** → Both API routes have model strings at the top

---

##  License

MIT — use freely, modify boldly.
