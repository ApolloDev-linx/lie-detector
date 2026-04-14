import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import type { InterrogationScenario, InterrogationMessage } from '@/lib/types';

const client = new Anthropic();

function buildSuspectSystemPrompt(scenario: InterrogationScenario): string {
  const guiltyInstructions = `
You ARE guilty. Your behavioral rules:
- Use deceptive language naturally: pepper in qualifiers ("honestly", "I want to be clear"), hedging ("I think", "as far as I know"), and slight over-explanation on irrelevant details
- Avoid the central incriminating detail unless pressed hard; then deflect
- Become slightly more defensive when questioned about specific evidence
- Occasionally use formal denials ("I did not") rather than contractions
- You can remember mundane things clearly but have convenient vagueness about key moments
- Don't make it too obvious — a clever liar sounds mostly normal with occasional slips`;

  const innocentInstructions = `
You are NOT guilty. Your behavioral rules:
- Speak naturally and directly; you have nothing to hide
- You may be nervous or upset about being accused — that's realistic and allowed
- You can be frustrated, confused, or emotional — innocent people feel these things
- You remember details clearly because the event matters to you
- You may occasionally ask why you're being asked certain questions
- Don't over-explain or over-qualify — you're just telling the truth`;

  return `You are roleplaying as ${scenario.suspectName} in a police/HR interrogation scenario.

SCENARIO: ${scenario.setup}

YOUR CHARACTER: ${scenario.suspectPersona}

YOUR BACKSTORY (known only to you): ${scenario.backstory}

GUILT STATUS: ${scenario.isGuilty ? 'YOU ARE GUILTY.' : 'YOU ARE INNOCENT.'}
${scenario.isGuilty ? guiltyInstructions : innocentInstructions}

AVAILABLE EVIDENCE THE DETECTIVE MAY REFERENCE: ${scenario.evidence.join('; ')}

ROLEPLAY RULES:
- Keep responses to 2-4 sentences — interrogation answers are short
- Stay completely in character; never break the fourth wall
- If asked something you'd genuinely not know, say so naturally
- React realistically to evidence being presented
- The detective may try to trick you — respond as your character would`;
}

const ANALYSIS_PROMPT = `You are a deception analyst. The following is a suspect's response during interrogation.
Analyze it briefly for deception patterns and return ONLY valid JSON (no markdown):
{
  "deceptionScore": <0-100>,
  "flags": ["<short flag 1>", "<short flag 2>"]
}
Keep flags to 2-4 words each, maximum 3 flags. If no flags, return empty array.`;

export async function POST(req: NextRequest) {
  try {
    const { scenario, messages, newMessage } = await req.json() as {
      scenario: InterrogationScenario;
      messages: InterrogationMessage[];
      newMessage: string;
    };

    if (!scenario || !newMessage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build conversation history for Claude
    const conversationHistory = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'detective' ? 'user' : 'assistant',
        content: m.content,
      }));

    // Add the new detective message
    conversationHistory.push({ role: 'user', content: newMessage });

    // Step 1: Get suspect response
    const suspectResponse = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: buildSuspectSystemPrompt(scenario),
      messages: conversationHistory as Anthropic.MessageParam[],
    });

    const suspectText = suspectResponse.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    // Step 2: Analyze the suspect's response for deception
    const analysisResponse = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: ANALYSIS_PROMPT,
      messages: [
        { role: 'user', content: `Suspect's response: "${suspectText}"` },
      ],
    });

    const analysisRaw = analysisResponse.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
      .replace(/```json\n?|\n?```/g, '')
      .trim();

    let analysis = { deceptionScore: 0, flags: [] as string[] };
    try {
      analysis = JSON.parse(analysisRaw);
    } catch {
      // fallback if parsing fails
    }

    return NextResponse.json({
      response: suspectText,
      analysis,
    });
  } catch (error) {
    console.error('Interrogation error:', error);
    return NextResponse.json({ error: 'Interrogation request failed' }, { status: 500 });
  }
}
