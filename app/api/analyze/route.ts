import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are Dr. VERITY, an expert forensic linguist and behavioral deception analyst. Analyze text for deception markers based on Statement Validity Analysis (SVA) and SCAN methodology.

Analyze for: hedging, distancing, over-explanation, qualifier words (honestly/I swear/believe me), filler words, tense-shifts, formal denials (I did not vs I didn't), inconsistencies, emotional flatness, and memory qualification.

IMPORTANT CALIBRATION:
- Nervousness can create false positives — consider context
- Truthful people use qualifiers naturally; deceptive people cluster them
- Over-explanation alone is not deception; it's a signal when combined with others
- Rate the CLUSTER of patterns, not individual words

Return ONLY valid JSON (no markdown, no preamble, no code fences) matching the schema provided.`;

const SCHEMA = `{
  "deceptionScore": <number 0-100>,
  "confidence": <number 0-100>,
  "verdict": <"truthful" | "uncertain" | "suspicious" | "deceptive">,
  "summary": "<2 sentences: overall assessment + key reason>",
  "patterns": [
    {
      "id": "<unique short id like p1, p2>",
      "type": "<hedging|distancing|over-explanation|qualifier|filler|tense-shift|denial-structure|inconsistency|emotional-flatness|memory-qualification>",
      "phrase": "<exact verbatim phrase from the input text, 1-6 words>",
      "explanation": "<1-2 sentence explanation of why this phrase is suspicious>",
      "severity": "<low|medium|high>",
      "confidence": <number 0-100>
    }
  ],
  "keyInsights": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "linguisticProfile": {
    "hedgingDensity": <0-100>,
    "qualifierUsage": <0-100>,
    "negationPatterns": <0-100>,
    "temporalConsistency": <0-100>,
    "emotionalAuthenticity": <0-100>
  }
}`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: 'Text too short (minimum 20 characters)' }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze this statement and return JSON matching this schema:\n${SCHEMA}\n\nStatement: "${text}"`,
        },
      ],
    });

    const rawText = response.choices[0]?.message?.content || '';
    const analysis = JSON.parse(rawText);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Analysis error:', error);

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Failed to parse analysis response' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Analysis failed. Check your OPENAI_API_KEY in .env.local' }, { status: 500 });
  }
}
