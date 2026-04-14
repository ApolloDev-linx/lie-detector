'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronRight, Gavel, AlertTriangle, RotateCcw, Eye } from 'lucide-react';
import { INTERROGATION_SCENARIOS } from '@/lib/constants';
import { scoreToColor, generateId, formatTime } from '@/lib/utils';
import type { InterrogationMessage, InterrogationScenario, InterrogationPhase } from '@/lib/types';

const DETECTIVE_PROMPTS = [
  'Where were you on the evening in question?',
  'Can you walk me through exactly what happened?',
  'Is there anyone who can verify your whereabouts?',
  'Why would you need to access that area at that time?',
  "That doesn't add up. Can you explain the discrepancy?",
  'Let me be direct with you — we have evidence.',
];

interface ChatBubbleProps {
  message: InterrogationMessage;
}

function ChatBubble({ message }: ChatBubbleProps) {
  const isDetective = message.role === 'detective';
  const isSystem = message.role === 'system';
  const color = message.analysis ? scoreToColor(message.analysis.deceptionScore) : undefined;

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="font-mono text-[9px] text-[#3D5166] tracking-wider px-3 py-1 border border-[#1A2840] rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isDetective ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] flex flex-col gap-1 ${isDetective ? 'items-end' : 'items-start'}`}>
        {/* Role label */}
        <div className="font-mono text-[9px] tracking-widest px-1" style={{ color: isDetective ? '#00CFFF' : '#7A8FA6' }}>
          {isDetective ? 'DETECTIVE' : 'SUSPECT'}
        </div>

        {/* Bubble */}
        <div
          className={`px-4 py-2.5 rounded-lg text-sm leading-relaxed ${
            isDetective
              ? 'bg-[#00CFFF]/8 border border-[#00CFFF]/20 text-[#C8D6E5]'
              : 'bg-[#121C2E] border text-[#C8D6E5]'
          }`}
          style={
            !isDetective && color
              ? { borderColor: `${color}30`, background: `${color}06` }
              : !isDetective
              ? { borderColor: '#1A2840' }
              : {}
          }
        >
          {message.content}
        </div>

        {/* Analysis indicators for suspect */}
        {message.analysis && (
          <div className="flex items-center gap-2">
            <div
              className="font-mono text-[9px] px-2 py-0.5 rounded-full border tracking-wider"
              style={{ color, borderColor: `${color}30`, background: `${color}10` }}
            >
              DECEPTION: {message.analysis.deceptionScore}%
            </div>
            {message.analysis.flags.map((flag, i) => (
              <div key={i} className="font-mono text-[8px] text-[#3D5166] border border-[#1A2840] px-1.5 py-0.5 rounded">
                {flag}
              </div>
            ))}
          </div>
        )}

        <div className="font-mono text-[8px] text-[#3D5166] px-1">{formatTime(message.timestamp)}</div>
      </div>
    </motion.div>
  );
}

interface ScenarioCardProps {
  scenario: InterrogationScenario;
  onStart: (scenario: InterrogationScenario) => void;
}

function ScenarioCard({ scenario, onStart }: ScenarioCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel p-5 flex flex-col gap-3 cursor-pointer hover:border-[#243652] transition-all group"
      onClick={() => onStart(scenario)}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-[#E2EAF4] tracking-wider text-sm group-hover:text-[#00CFFF] transition-colors">
          {scenario.title}
        </h3>
        <ChevronRight size={16} className="text-[#3D5166] group-hover:text-[#00CFFF] shrink-0 transition-colors" />
      </div>
      <p className="text-xs text-[#7A8FA6] leading-relaxed">{scenario.setup}</p>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-[#3D5166] border border-[#1A2840] px-2 py-0.5 rounded">
          SUSPECT: {scenario.suspectName}
        </span>
        <span className="font-mono text-[9px] text-[#3D5166] border border-[#1A2840] px-2 py-0.5 rounded">
          CRIME: {scenario.crime}
        </span>
      </div>
    </motion.div>
  );
}

export default function InterrogationMode() {
  const [phase, setPhase] = useState<InterrogationPhase>('briefing');
  const [selectedScenario, setSelectedScenario] = useState<InterrogationScenario | null>(null);
  const [messages, setMessages] = useState<InterrogationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [verdict, setVerdict] = useState<'guilty' | 'innocent' | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [averageScore, setAverageScore] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Recalculate average deception score
  useEffect(() => {
    const suspectMessages = messages.filter((m) => m.role === 'suspect' && m.analysis);
    if (suspectMessages.length > 0) {
      const avg = suspectMessages.reduce((sum, m) => sum + (m.analysis?.deceptionScore ?? 0), 0) / suspectMessages.length;
      setAverageScore(Math.round(avg));
    }
  }, [messages]);

  const startInterrogation = (scenario: InterrogationScenario) => {
    setSelectedScenario(scenario);
    setPhase('interrogating');
    setMessages([
      {
        id: generateId(),
        role: 'system',
        content: `INTERROGATION STARTED — ${scenario.suspectName} is in the room`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim() || isThinking || !selectedScenario) return;

    const userMsg: InterrogationMessage = {
      id: generateId(),
      role: 'detective',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/interrogate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: selectedScenario,
          messages: newMessages,
          newMessage: input.trim(),
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      const suspectMsg: InterrogationMessage = {
        id: generateId(),
        role: 'suspect',
        content: data.response,
        timestamp: new Date().toISOString(),
        analysis: data.analysis,
      };

      setMessages((prev) => [...prev, suspectMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'system',
          content: 'CONNECTION ERROR — please try again',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const submitVerdict = (v: 'guilty' | 'innocent') => {
    setVerdict(v);
    setPhase('verdict');
  };

  const revealTruth = () => setRevealed(true);

  const resetInterrogation = () => {
    setPhase('briefing');
    setSelectedScenario(null);
    setMessages([]);
    setInput('');
    setVerdict(null);
    setRevealed(false);
    setAverageScore(0);
  };

  // ── Scenario Selection ──
  if (phase === 'briefing') {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 flex flex-col gap-6">
        <div>
          <h2 className="font-display text-[#E2EAF4] tracking-[0.2em] text-base">INTERROGATION MODE</h2>
          <p className="text-sm text-[#7A8FA6] mt-1">
            Play detective. Question an AI suspect, analyze their responses for deception, and make your accusation.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {INTERROGATION_SCENARIOS.map((s) => (
            <ScenarioCard key={s.id} scenario={s} onStart={startInterrogation} />
          ))}
        </div>
        <div className="panel p-4 flex flex-col gap-2">
          <div className="font-mono text-[9px] text-[#3D5166] tracking-widest mb-1">HOW IT WORKS</div>
          {[
            'Question the suspect — each response is analyzed for deception in real time',
            'Watch for hedging, qualifiers, and behavioral flags in their answers',
            'After 3+ exchanges, you can make an accusation: guilty or innocent',
            'See if your read matches the truth and review the full analysis',
          ].map((tip, i) => (
            <div key={i} className="flex gap-2 text-xs text-[#7A8FA6]">
              <span className="font-mono text-[#00CFFF] shrink-0">{i + 1}.</span>
              {tip}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Verdict Screen ──
  if (phase === 'verdict' && selectedScenario) {
    const correct = verdict === (selectedScenario.isGuilty ? 'guilty' : 'innocent');
    const verdictColor = verdict === 'guilty' ? '#FF2855' : '#00E87A';
    const actualColor = selectedScenario.isGuilty ? '#FF2855' : '#00E87A';

    return (
      <div className="max-w-xl mx-auto py-10 px-4 flex flex-col items-center gap-6">
        <Gavel size={40} className="text-[#FFB020]" style={{ filter: 'drop-shadow(0 0 12px rgba(255,176,32,0.3))' }} />

        <div className="text-center">
          <div className="font-mono text-[10px] text-[#3D5166] tracking-widest mb-2">YOUR VERDICT</div>
          <div className="font-display text-2xl tracking-[0.3em]" style={{ color: verdictColor }}>
            {verdict?.toUpperCase()}
          </div>
        </div>

        <div className="panel p-4 w-full flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#3D5166]">AVG DECEPTION SCORE</span>
            <span className="font-display text-lg" style={{ color: scoreToColor(averageScore) }}>
              {averageScore}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#3D5166]">EXCHANGES</span>
            <span className="font-mono text-sm text-[#7A8FA6]">
              {messages.filter((m) => m.role === 'suspect').length}
            </span>
          </div>
        </div>

        {!revealed ? (
          <button
            onClick={revealTruth}
            className="flex items-center gap-2 px-6 py-3 rounded border border-[#FFB020]/20 bg-[#FFB020]/6 text-[#FFB020] font-display tracking-widest text-sm hover:bg-[#FFB020]/12 transition-all"
          >
            <Eye size={16} />
            REVEAL THE TRUTH
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col gap-4"
          >
            <div
              className="panel p-4 flex flex-col items-center gap-2 text-center"
              style={{ borderColor: `${correct ? '#00E87A' : '#FF2855'}30` }}
            >
              <div className="font-mono text-[9px] text-[#3D5166] tracking-widest">ACTUAL ANSWER</div>
              <div className="font-display text-2xl tracking-[0.3em]" style={{ color: actualColor }}>
                {selectedScenario.isGuilty ? 'GUILTY' : 'INNOCENT'}
              </div>
              <div
                className="font-display tracking-widest text-sm mt-1"
                style={{ color: correct ? '#00E87A' : '#FF2855' }}
              >
                {correct ? '✓ CORRECT READ' : '✗ WRONG CALL'}
              </div>
            </div>

            <div className="panel p-4">
              <div className="font-mono text-[9px] text-[#3D5166] tracking-widest mb-2">THE FULL STORY</div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">{selectedScenario.backstory}</p>
            </div>

            <div className="panel p-4">
              <div className="font-mono text-[9px] text-[#3D5166] tracking-widest mb-2">EVIDENCE</div>
              {selectedScenario.evidence.map((e, i) => (
                <div key={i} className="flex gap-2 text-xs text-[#7A8FA6] mb-1.5">
                  <span className="text-[#FFB020] font-mono shrink-0">›</span>
                  {e}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <button
          onClick={resetInterrogation}
          className="flex items-center gap-2 text-sm font-mono text-[#3D5166] hover:text-[#7A8FA6] transition-colors"
        >
          <RotateCcw size={13} />
          NEW INTERROGATION
        </button>
      </div>
    );
  }

  // ── Chat Interface ──
  const suspectCount = messages.filter((m) => m.role === 'suspect').length;
  const canAccuse = suspectCount >= 3;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto px-4">
      {/* Top bar */}
      <div className="flex items-center justify-between py-3 border-b border-[#1A2840]">
        <div>
          <h3 className="font-display text-[#E2EAF4] tracking-wider text-sm">{selectedScenario?.title}</h3>
          <p className="font-mono text-[9px] text-[#3D5166] mt-0.5">
            SUSPECT: {selectedScenario?.suspectName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {averageScore > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] text-[#3D5166]">AVG:</span>
              <span className="font-display text-sm" style={{ color: scoreToColor(averageScore) }}>
                {averageScore}%
              </span>
            </div>
          )}
          {canAccuse && (
            <div className="flex gap-1">
              <button
                onClick={() => submitVerdict('innocent')}
                className="px-2 py-1 text-[9px] font-mono tracking-wider border border-[#00E87A]/20 text-[#00E87A] rounded hover:bg-[#00E87A]/8 transition-all"
              >
                INNOCENT
              </button>
              <button
                onClick={() => submitVerdict('guilty')}
                className="px-2 py-1 text-[9px] font-mono tracking-wider border border-[#FF2855]/20 text-[#FF2855] rounded hover:bg-[#FF2855]/8 transition-all"
              >
                GUILTY
              </button>
            </div>
          )}
          <button onClick={resetInterrogation} className="p-1.5 text-[#3D5166] hover:text-[#7A8FA6] rounded hover:bg-[#1A2840] transition-all">
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
        {/* Case briefing */}
        <div className="panel p-3 mb-2">
          <div className="font-mono text-[9px] text-[#3D5166] tracking-widest mb-1">CASE BRIEF</div>
          <p className="text-xs text-[#7A8FA6] leading-relaxed">{selectedScenario?.setup}</p>
        </div>

        {messages.map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 px-4 py-2.5 bg-[#121C2E] border border-[#1A2840] rounded-lg">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#3D5166]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        {DETECTIVE_PROMPTS.slice(0, 4).map((prompt) => (
          <button
            key={prompt}
            onClick={() => setInput(prompt)}
            className="shrink-0 font-mono text-[9px] text-[#3D5166] border border-[#1A2840] rounded px-2 py-1 hover:text-[#7A8FA6] hover:border-[#243652] transition-all whitespace-nowrap"
          >
            {prompt.length > 35 ? prompt.slice(0, 35) + '…' : prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 pb-4 pt-1">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask the suspect a question..."
          disabled={isThinking}
          className="flex-1 bg-[#0C1220] border border-[#1A2840] focus:border-[#243652] rounded-lg px-4 py-2.5 text-sm text-[#C8D6E5] placeholder:text-[#3D5166] font-body transition-all"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isThinking}
          className="p-2.5 rounded-lg border border-[#00CFFF]/20 bg-[#00CFFF]/8 text-[#00CFFF] hover:bg-[#00CFFF]/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Send size={16} />
        </button>
      </div>

      {!canAccuse && suspectCount > 0 && (
        <div className="text-center font-mono text-[9px] text-[#3D5166] tracking-wider pb-2">
          {3 - suspectCount} MORE EXCHANGE{3 - suspectCount !== 1 ? 'S' : ''} BEFORE YOU CAN ACCUSE
        </div>
      )}

      {canAccuse && !verdict && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 justify-center pb-2 font-mono text-[9px] text-[#FFB020] tracking-wider"
        >
          <AlertTriangle size={10} />
          READY TO MAKE YOUR ACCUSATION
        </motion.div>
      )}
    </div>
  );
}
