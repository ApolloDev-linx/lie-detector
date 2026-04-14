import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import type { InterrogationScenario, InterrogationMessage } from '@/lib/types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { scenario, messages, newMessage } = await req.json() as {
      scenario: InterrogationScenario;
      messages: InterrogationMessage[];
      newMessage: string;
    };

    const guiltyRules = scenario.isGuilty
      ? `YOU ARE GUILTY. Use hedging, qualifiers, be vague on key moments, occasionally use formal denials. Sound mostly normal with occasional slips.`
      : `YOU ARE INNOCENT. Speak naturally and directly. You may be nervous or frustrated but you are telling the truth.`;

    const systemPrompt = `You are roleplaying as ${scenario.suspectName} in a police interrogation.
SCENARIO: ${scenario.setup}
CHARACTER: ${scenario.suspectPersona}
BACKSTORY (private): ${scenario.backstory}
${guiltyRules}
EVIDENCE detective may reference: ${scenario.evidence.join('; ')}
Keep responses 2-4 sentences. Stay in character completely.`;

    const history = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'detective' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.content }],
      }));

    const suspectModel = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.85, maxOutputTokens: 300 },
      systemInstruction: systemPrompt,
    });

    const chat = suspectModel.startChat({ history });
    const suspectResult = await chat.sendMessage(newMessage);
    const suspectText = suspectResult.response.text().trim();

    const analysisModel = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 150 },
      systemInstruction: `Analyze this interrogation response for deception. Return ONLY JSON: {"deceptionScore": <0-100>, "flags": ["<2-4 word flag>"]}. Max 3 flags.`,
    });

    const analysisResult = await analysisModel.generateContent(`Suspect said: "${suspectText}"`);
    let analysis = { deceptionScore: 0, flags: [] as string[] };
    try { analysis = JSON.parse(analysisResult.response.text()); } catch { /* use defaults */ }

    return NextResponse.json({ response: suspectText, analysis });
  } catch (error) {
    console.error('Interrogation error:', error);
    return NextResponse.json({ error: 'Interrogation failed' }, { status: 500 });
  }
}
