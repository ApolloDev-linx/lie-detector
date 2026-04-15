'use client';

import { motion } from 'framer-motion';
import { ScanSearch, BookOpen, MessageSquareWarning, Activity } from 'lucide-react';
import type { AppMode } from '@/lib/types';

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const MODES: { id: AppMode; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'analyze',
    label: 'ANALYZE',
    icon: <ScanSearch size={14} />,
    description: 'Paste or speak text for analysis',
  },
  {
    id: 'training',
    label: 'TRAINING',
    icon: <BookOpen size={14} />,
    description: 'Learn from real-world examples',
  },
  {
    id: 'interrogation',
    label: 'INTERROGATE',
    icon: <MessageSquareWarning size={14} />,
    description: 'Play detective with an AI suspect',
  },
];

export default function Header({ mode, onModeChange }: HeaderProps) {
  return (
    <header className="relative border-b border-[#1A2840] bg-[#060A10]/90 backdrop-blur-sm sticky top-0 z-50 scan-line-effect">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-0">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="relative">
              <Activity className="w-5 h-5 text-[#00CFFF]" strokeWidth={2.5} />
              <div className="absolute -inset-1 bg-[#00CFFF]/10 rounded-full blur-sm" />
            </div>
            <div>
              <span className="font-display text-[#E2EAF4] text-base sm:text-lg font-700 tracking-[0.2em]">
                VERITY
              </span>
              <span className="font-mono text-[10px] text-[#3D5166] hidden sm:block leading-none tracking-[0.15em]">
                BEHAVIORAL ANALYSIS v2.0
              </span>
            </div>
          </div>

          {/* Mode Tabs */}
          <nav className="flex items-center gap-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={`
                  relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded text-[10px] sm:text-xs font-display tracking-widest
                  transition-all duration-200 group
                  ${mode === m.id
                    ? 'text-[#00CFFF] bg-[#00CFFF]/8 border border-[#00CFFF]/20'
                    : 'text-[#3D5166] border border-transparent hover:text-[#7A8FA6] hover:border-[#1A2840]'
                  }
                `}
              >
                <span className={`transition-colors ${mode === m.id ? 'text-[#00CFFF]' : 'text-[#3D5166] group-hover:text-[#7A8FA6]'}`}>
                  {m.icon}
                </span>
                <span className="hidden sm:inline">{m.label}</span>
                <span className="sm:hidden">{m.label.slice(0, 3)}</span>
                {mode === m.id && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-[#00CFFF]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Status */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-[#3D5166] tracking-widest">
            <div className="status-dot" />
            SYSTEM ONLINE
          </div>
        </div>
      </div>
    </header>
  );
}
