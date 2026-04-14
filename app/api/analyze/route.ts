import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const status = err?.status ?? err?.httpStatusCode ?? err?.code;
      if (status === 429 && i < retries - 1) {
        // Google's retryDelay is typically 30-60s on free tier
        // so we need much longer waits: 15s, 30s, 60s
        const wait = Math.pow(2, i) * 15000;
        console.log(`Rate limited (attempt ${i + 1}/${retries}). Retrying in ${wait / 1000}s...`);
        await delay(wait);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

const SYSTEM_PROMPT = `You are Dr. VERITY, an expert forensic linguist and behavioral deception analyst. Analyze text for deception markers based on Statement Validity Analysis (SVA) and SCAN methodology.
Analyze for: hedging, distancing, over-explanation, qualifier words (honestly/I swear/believe me), filler words, tense-shifts, formal denials (I did not vs I didn't), inconsistencies, emotional flatness, and memory qualification.
Return ONLY valid JSON, no markdown.`;

const SCHEMA = `{
  "deceptionScore": <0-100>,
  "confidence": <0-100>,
  "verdict": <"truthful"|"uncertain"|"suspicious"|"deceptive">,
  "summary": "<2 sentences>",
  "patterns": [{"id":"p1","type":"hedging","phrase":"<exact phrase>","explanation":"<why suspicious>","severity":"high","confidence":85}],
  "keyInsights": ["insight 1","insight 2","insight 3"],
  "linguisticProfile": {"hedgingDensity":0,"qualifierUsage":0,"negationPatterns":0,"temporalConsistency":100,"emotionalAuthenticity":100}
}`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || text.trim().length < 20) {
      return NextResponse.json({ error: 'Text too short (minimum 20 characters)' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.3, maxOutputTokens: 2000 },
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await withRetry(() =>
      model.generateContent(
        `Analyze this statement and return JSON matching this schema:\n${SCHEMA}\n\nStatement: "${text}"`
      )
    );

    const analysis = JSON.parse(result.response.text());
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Analysis error:', error);

    // Give the user a clearer message if it's still rate limited after retries
    const status = error?.status ?? error?.httpStatusCode;
    if (status === 429) {
      return NextResponse.json(
        { error: 'Google API rate limit reached. Please wait about a minute and try again.' },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: 'Analysis failed. Check your GOOGLE_API_KEY in .env.local' }, { status: 500 });
  }
}
