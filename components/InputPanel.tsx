'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Trash2, Zap, AlertCircle, Copy, Check } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { getTextStats } from '@/lib/utils';

interface InputPanelProps {
  value: string;
  onChange: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  error: string | null;
}

const PLACEHOLDER = `Paste a statement, transcript, or testimony here — or click the mic to speak.

Examples:
• A statement given to police
• An employee's explanation  
• A social media post under scrutiny
• A spoken alibi or excuse

Minimum 20 characters for analysis.`;

const SAMPLE_TEXTS = [
  "I was home all evening, I definitely didn't go out. I made dinner around 7 and watched TV. My neighbor might have seen my car, but she wasn't home anyway. I'm just saying, I was there the whole time.",
  "To be completely honest with you, I thought I had submitted it. I want to be transparent — I worked extremely hard on that report. I can assure you my intention was never to miss the deadline.",
  "I would never do something like that. That wallet was sitting there when I walked past, yes, I noticed it, but that means nothing. I have my own money, I don't need to take from anyone.",
];

export default function InputPanel({ value, onChange, onAnalyze, isAnalyzing, error }: InputPanelProps) {
  const { isListening, isSupported, transcript, interimTranscript, error: speechError, startListening, stopListening } = useSpeech();
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stats = getTextStats(value);
  const canAnalyze = value.trim().length >= 20 && !isAnalyzing;

  // Sync speech transcript into the text field
  useEffect(() => {
    if (transcript) {
      onChange(transcript);
    }
  }, [transcript, onChange]);

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      onChange(''); // clear before speaking
      startListening();
    }
  };

  const handleClear = () => {
    onChange('');
    stopListening();
    textareaRef.current?.focus();
  };

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadSample = () => {
    const sample = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    onChange(sample);
    stopListening();
  };

  const charLimit = 3000;
  const charPercent = Math.min((value.length / charLimit) * 100, 100);
  const charColor = charPercent > 90 ? '#FF2855' : charPercent > 75 ? '#FFB020' : '#3D5166';

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#3D5166] tracking-widest">INPUT STATEMENT</span>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FF2855]/10 border border-[#FF2855]/20"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF2855] animate-pulse" />
              <span className="font-mono text-[9px] text-[#FF2855]">RECORDING</span>
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Sample button */}
          <button
            onClick={loadSample}
            className="px-2 py-1 text-[10px] font-mono text-[#3D5166] hover:text-[#7A8FA6] border border-transparent hover:border-[#1A2840] rounded transition-all"
          >
            LOAD SAMPLE
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            disabled={!value}
            className="p-1.5 text-[#3D5166] hover:text-[#7A8FA6] disabled:opacity-30 rounded hover:bg-[#1A2840] transition-all"
          >
            {copied ? <Check size={13} className="text-[#00E87A]" /> : <Copy size={13} />}
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            disabled={!value && !isListening}
            className="p-1.5 text-[#3D5166] hover:text-[#FF2855]/70 disabled:opacity-30 rounded hover:bg-[#1A2840] transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative flex-1 min-h-0">
        <textarea
          ref={textareaRef}
          value={isListening ? value + interimTranscript : value}
          onChange={(e) => !isListening && onChange(e.target.value)}
          readOnly={isListening}
          placeholder={PLACEHOLDER}
          maxLength={charLimit}
          className={`
            w-full h-full min-h-[220px] resize-none rounded-lg p-4
            bg-[#0C1220] border text-[#C8D6E5] text-sm leading-relaxed
            placeholder:text-[#2E4470]/60 font-body
            transition-all duration-200
            ${isListening
              ? 'border-[#FF2855]/30 bg-[#FF2855]/4 cursor-not-allowed'
              : canAnalyze
              ? 'border-[#243652] focus:border-[#00CFFF]/30 focus:bg-[#0C1220]'
              : 'border-[#1A2840] focus:border-[#243652]'
            }
          `}
        />

        {/* Interim speech overlay */}
        {isListening && interimTranscript && (
          <div className="absolute bottom-3 left-4 right-4 text-[#FF2855]/50 text-sm font-body italic pointer-events-none truncate">
            {interimTranscript}
          </div>
        )}

        {/* Char count progress ring */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="font-mono text-[9px]" style={{ color: charColor }}>
            {value.length}/{charLimit}
          </span>
        </div>
      </div>

      {/* Stats bar */}
      {value.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 px-1"
        >
          {[
            { label: 'WORDS', value: stats.words },
            { label: 'SENTENCES', value: stats.sentences },
            { label: 'AVG/SENT', value: stats.avgWordsPerSentence },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] text-[#3D5166] tracking-wider">{s.label}</span>
              <span className="font-mono text-[10px] text-[#7A8FA6]">{s.value}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Char progress bar */}
      {value.length > 0 && (
        <div className="h-px w-full bg-[#1A2840] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${charPercent}%`, background: charColor }}
          />
        </div>
      )}

      {/* Error display */}
      <AnimatePresence>
        {(error || speechError) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded border border-[#FF2855]/20 bg-[#FF2855]/6 text-[#FF2855] text-xs"
          >
            <AlertCircle size={12} className="shrink-0" />
            {error || speechError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        {/* Mic button */}
        {isSupported && (
          <button
            onClick={handleToggleMic}
            className={`
              flex items-center gap-2 px-3 py-2.5 rounded border font-mono text-xs tracking-wider
              transition-all duration-200
              ${isListening
                ? 'border-[#FF2855]/40 bg-[#FF2855]/10 text-[#FF2855] hover:bg-[#FF2855]/15'
                : 'border-[#1A2840] bg-[#0C1220] text-[#3D5166] hover:border-[#243652] hover:text-[#7A8FA6]'
              }
            `}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            {isListening ? 'STOP' : 'SPEAK'}
          </button>
        )}

        {/* Analyze button */}
        <motion.button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          whileHover={canAnalyze ? { scale: 1.02 } : {}}
          whileTap={canAnalyze ? { scale: 0.98 } : {}}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded border
            font-display text-sm tracking-widest font-600 transition-all duration-200
            ${canAnalyze
              ? 'border-[#00CFFF]/30 bg-[#00CFFF]/8 text-[#00CFFF] hover:bg-[#00CFFF]/15 hover:border-[#00CFFF]/50'
              : 'border-[#1A2840] bg-[#0C1220] text-[#3D5166] cursor-not-allowed'
            }
          `}
          style={canAnalyze ? { boxShadow: '0 0 20px rgba(0,207,255,0.08)' } : {}}
        >
          {isAnalyzing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 border-[#00CFFF]/30 border-t-[#00CFFF]"
              />
              ANALYZING...
            </>
          ) : (
            <>
              <Zap size={14} />
              RUN ANALYSIS
            </>
          )}
        </motion.button>
      </div>

      {/* Minimum length hint */}
      {value.length > 0 && value.length < 20 && (
        <p className="text-center font-mono text-[9px] text-[#3D5166] tracking-wider">
          {20 - value.length} MORE CHARACTERS NEEDED
        </p>
      )}
    </div>
  );
}
