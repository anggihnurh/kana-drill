import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { DrillContext, useDrillContext, DrillContextValue } from './DrillContext';
import { useDrillStore } from '../../store/useDrillStore';
import { useStopwatch } from '../../hooks/useStopwatch';
import { LiveTimer } from './LiveTimer';
import { TokenCard } from './TokenCard';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  ChevronRight,
  CornerDownLeft,
  Sparkles,
  PauseCircle,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Flame,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ==========================================
// 1. Drill Root (Provider & Global Shortcuts)
// ==========================================
export interface DrillRootProps {
  children: React.ReactNode;
}

export const DrillRoot: React.FC<DrillRootProps> = ({ children }) => {
  const status = useDrillStore((s) => s.status);
  const questions = useDrillStore((s) => s.questions);
  const currentQuestionIndex = useDrillStore((s) => s.currentQuestionIndex);
  const activeTokenIndex = useDrillStore((s) => s.activeTokenIndex);
  const currentInput = useDrillStore((s) => s.currentInput);
  const isInputErrorShake = useDrillStore((s) => s.isInputErrorShake);
  const streak = useDrillStore((s) => s.streak);
  const maxStreak = useDrillStore((s) => s.maxStreak);
  const soundEnabled = useDrillStore((s) => s.config.soundEnabled);

  const setConfig = useDrillStore((s) => s.setConfig);
  const setInput = useDrillStore((s) => s.setInput);
  const submitCurrentToken = useDrillStore((s) => s.submitCurrentToken);
  const selectToken = useDrillStore((s) => s.selectToken);
  const nextQuestionStore = useDrillStore((s) => s.nextQuestion);
  const pauseSession = useDrillStore((s) => s.pauseSession);
  const resumeSession = useDrillStore((s) => s.resumeSession);
  const resetSession = useDrillStore((s) => s.resetSession);

  const inputRef = useRef<HTMLInputElement>(null);

  const isPaused = status === 'paused';
  const isRunning = status === 'running';

  const isMac = useMemo(
    () => typeof navigator !== 'undefined' && /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent),
    []
  );
  const cmdKeyText = isMac ? '⌘ Enter' : 'Ctrl+Enter';

  // High precision time tracker
  const { getCurrentElapsed } = useStopwatch({
    isRunning,
    questionIndex: currentQuestionIndex,
  });

  const nextQuestion = useCallback(() => {
    nextQuestionStore(getCurrentElapsed());
  }, [nextQuestionStore, getCurrentElapsed]);

  const toggleSound = useCallback(() => {
    setConfig({ soundEnabled: !soundEnabled });
  }, [setConfig, soundEnabled]);

  // Autofocus input
  useEffect(() => {
    if (isRunning) {
      inputRef.current?.focus();
    }
  }, [isRunning, activeTokenIndex, currentQuestionIndex]);

  // Global window listener for Ctrl+Enter / Cmd+Enter
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        nextQuestion();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isRunning, isPaused, nextQuestion]);

  const currentQ = questions[currentQuestionIndex];
  const tokens = currentQ ? currentQ.tokens : [];
  const currentToken = tokens[activeTokenIndex];
  const answeredCount = tokens.filter((t) => t.userAnswer !== undefined).length;
  const isAllAnswered = answeredCount === tokens.length && tokens.length > 0;
  const isLastQuestion = currentQuestionIndex === (questions.length > 0 ? questions.length - 1 : 9);

  const contextValue: DrillContextValue = useMemo(
    () => ({
      state: {
        currentQuestion: currentQuestionIndex + 1,
        totalQuestions: questions.length || 10,
        currentQuestionIndex,
        activeTokenIndex,
        currentInput,
        isInputErrorShake,
        streak,
        maxStreak,
        answeredCount,
        isAllAnswered,
        isLastQuestion,
        isPaused,
        isRunning,
        currentQ,
        tokens,
        currentToken,
        cmdKeyText,
        soundEnabled,
      },
      actions: {
        setInput,
        submitCurrentToken,
        selectToken,
        nextQuestion,
        pauseSession,
        resumeSession,
        resetSession,
        toggleSound,
      },
      meta: {
        inputRef,
      },
    }),
    [
      currentQuestionIndex,
      activeTokenIndex,
      currentInput,
      isInputErrorShake,
      streak,
      maxStreak,
      answeredCount,
      isAllAnswered,
      isLastQuestion,
      isPaused,
      isRunning,
      currentQ,
      tokens,
      currentToken,
      cmdKeyText,
      soundEnabled,
      setInput,
      submitCurrentToken,
      selectToken,
      nextQuestion,
      pauseSession,
      resumeSession,
      resetSession,
      toggleSound,
    ]
  );

  return (
    <DrillContext.Provider value={contextValue}>
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 pb-32 md:pb-12 animate-pop-in">
        {children}
      </div>
    </DrillContext.Provider>
  );
};

// ==========================================
// 2. Drill Header
// ==========================================
export const DrillHeaderCompound: React.FC = () => {
  const { state, actions } = useDrillContext();
  const progressPercent = ((state.currentQuestion - 1) / state.totalQuestions) * 100;

  return (
    <header className="w-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-4 shadow-sm dark:shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Progress info & Question Number */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Soal
            </span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {state.currentQuestion}
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold font-mono">
              / {state.totalQuestions}
            </span>
          </div>

          <div className="hidden sm:block w-32 md:w-44">
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Live Combo Streak Badge */}
          {state.streak >= 3 ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono animate-combo-bounce shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{state.streak}x Combo!</span>
            </div>
          ) : null}
        </div>

        {/* Center: Live Timer Per Soal (Decoupled & Isolated) */}
        <LiveTimer
          isRunning={state.isRunning}
          isPaused={state.isPaused}
          questionIndex={state.currentQuestionIndex}
        />

        {/* Right: Controls (Sound, Pause, Reset) */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={actions.toggleSound}
            title={state.soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            aria-label="Toggle Suara"
          >
            {state.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={state.isPaused ? actions.resumeSession : actions.pauseSession}
            className="text-xs gap-1.5 font-medium"
          >
            {state.isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                <span>Lanjut</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Jeda</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={actions.resetSession}
            title="Keluar / Reset Sesi"
            className="text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400"
            aria-label="Reset Sesi"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile progress bar */}
      <div className="block sm:hidden mt-3">
        <Progress value={progressPercent} className="h-1.5" />
      </div>
    </header>
  );
};

// ==========================================
// 3. Drill Token Grid
// ==========================================
export const DrillTokenGrid: React.FC = () => {
  const { state, actions } = useDrillContext();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
      {state.tokens.map((token, idx) => (
        <TokenCard
          key={token.id || idx}
          index={idx}
          token={token}
          isActive={idx === state.activeTokenIndex}
          onClick={() => actions.selectToken(idx)}
        />
      ))}
    </div>
  );
};

// ==========================================
// 4. Drill Floating Input Bar
// ==========================================
export const DrillInputBar: React.FC = () => {
  const { state, actions, meta } = useDrillContext();

  // Auto-scroll aktif agar token tidak terhalang oleh container input ataupun top header
  useEffect(() => {
    const scrollToActiveToken = () => {
      const activeEl =
        document.getElementById(`token-card-${state.activeTokenIndex}`) ||
        document.querySelector('[data-token-active="true"]');
      if (!activeEl) return;

      const inputBar = document.getElementById('drill-input-bar');
      const header = document.querySelector('header');

      const tokenRect = activeEl.getBoundingClientRect();
      const inputBarTop = inputBar
        ? inputBar.getBoundingClientRect().top
        : window.innerHeight - 120;
      const headerBottom = header
        ? header.getBoundingClientRect().bottom
        : 60;

      const BOTTOM_MARGIN = 20;
      const TOP_MARGIN = 16;

      // Jika kartu token terhalang atau berada terlalu dekat di bawah floating input bar
      if (tokenRect.bottom > inputBarTop - BOTTOM_MARGIN) {
        const delta = tokenRect.bottom - inputBarTop + BOTTOM_MARGIN;
        window.scrollBy({ top: delta, behavior: 'smooth' });
      }
      // Jika kartu token terhalang di belakang sticky header atas
      else if (tokenRect.top < headerBottom + TOP_MARGIN) {
        const delta = tokenRect.top - (headerBottom + TOP_MARGIN);
        window.scrollBy({ top: delta, behavior: 'smooth' });
      }
    };

    // Jalankan auto-scroll setelah render frame
    const frameId = requestAnimationFrame(() => {
      scrollToActiveToken();
    });

    // Dengarkan perubahan ukuran visual viewport (misal keyboard mobile muncul/tutup)
    const viewport = window.visualViewport;
    if (viewport) {
      viewport.addEventListener('resize', scrollToActiveToken);
    }

    return () => {
      cancelAnimationFrame(frameId);
      if (viewport) {
        viewport.removeEventListener('resize', scrollToActiveToken);
      }
    };
  }, [state.activeTokenIndex]);

  // Reset scroll ke atas saat berganti soal baru
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.currentQuestionIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (state.isPaused) {
      if (e.key === 'Escape') {
        actions.resumeSession();
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      actions.nextQuestion();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      actions.pauseSession();
      return;
    }

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();

      if (state.currentInput.trim().length > 0) {
        actions.submitCurrentToken();
        return;
      }

      if (state.isAllAnswered) {
        actions.nextQuestion();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const nextIdx = (state.activeTokenIndex + 1) % (state.tokens.length || 12);
      actions.selectToken(nextIdx);
    }
  };

  return (
    <div
      id="drill-input-bar"
      className="fixed bottom-0 left-0 right-0 z-40 sm:sticky sm:bottom-4 w-full max-w-5xl mx-auto bg-white/95 dark:bg-zinc-900/95 border-t sm:border border-zinc-200/90 dark:border-zinc-800/90 sm:rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-xl transition-all pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Input Kolom Romaji */}
        <div className="relative flex-1">
          <Input
            ref={meta.inputRef}
            type="text"
            value={state.currentInput}
            onChange={(e) => actions.setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ketik Romaji (misal: ${state.currentToken?.expectedRomaji[0] || 'romaji'})... Tekan Spasi/Enter`}
            autoFocus
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            className={cn(
              'h-12 text-base font-mono bg-zinc-50/80 dark:bg-zinc-950/90 border-zinc-300 dark:border-zinc-700/80 pr-14 focus-visible:ring-indigo-500 text-zinc-900 dark:text-zinc-100 shadow-inner',
              state.isInputErrorShake &&
              'animate-shake border-rose-500 text-rose-600 dark:border-rose-500/80 dark:text-rose-300'
            )}
          />
          <button
            type="button"
            onClick={actions.submitCurrentToken}
            disabled={!state.currentInput.trim()}
            className="absolute right-2 top-2 h-8 px-2.5 rounded-lg bg-zinc-200/80 hover:bg-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 disabled:opacity-20 transition-all flex items-center gap-1 text-xs font-mono font-medium cursor-pointer shadow-sm"
            title="Submit Token (Spasi / Enter)"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>

        {/* Next Question / Finish Action Button */}
        <Button
          onClick={actions.nextQuestion}
          variant={state.isAllAnswered ? 'success' : 'default'}
          className="h-12 px-5 font-bold shrink-0 gap-2 shadow-md transition-all cursor-pointer"
          title={`Lanjut ke soal berikutnya (${state.cmdKeyText})`}
        >
          {state.isLastQuestion ? (
            <>
              <span>Selesaikan Sesi</span>
              <Sparkles className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Selanjutnya</span>
              <span className="hidden sm:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 dark:bg-black/20 text-white font-semibold">
                {state.cmdKeyText}
              </span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Helper Shortcut Bar */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1 gap-2">
        <div className="flex items-center gap-2">
          <span>
            Terjawab:{' '}
            <strong className="text-zinc-900 dark:text-zinc-200 font-mono">
              {state.answeredCount} / {state.tokens.length || 12}
            </strong>
          </span>
          <span>•</span>
          <span className="hidden sm:inline">
            Tekan{' '}
            <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 rounded font-mono text-[10px] text-zinc-700 dark:text-zinc-300">
              Spasi
            </kbd>{' '}
            atau{' '}
            <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 rounded font-mono text-[10px] text-zinc-700 dark:text-zinc-300">
              Enter
            </kbd>{' '}
            untuk submit token
          </span>
        </div>
        <div className="text-right hidden sm:block text-[11px]">
          <span>
            <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 rounded font-mono text-[10px] text-zinc-700 dark:text-zinc-300 font-semibold text-indigo-600 dark:text-indigo-400">
              {state.cmdKeyText}
            </kbd>{' '}
            Soal Selanjutnya •{' '}
            <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 rounded font-mono text-[10px] text-zinc-700 dark:text-zinc-300">
              Tab
            </kbd>{' '}
            Pindah Token •{' '}
            <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 rounded font-mono text-[10px] text-zinc-700 dark:text-zinc-300">
              Esc
            </kbd>{' '}
            Jeda
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. Drill Pause Overlay
// ==========================================
export const DrillPauseOverlay: React.FC = () => {
  const { state, actions } = useDrillContext();

  if (!state.isPaused) return null;

  return (
    <div className="flex flex-col items-center justify-center p-10 md:p-14 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl text-center backdrop-blur-xl animate-pop-in">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center mb-4 shadow-sm">
        <PauseCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2">
        Sesi Sedang Dijeda
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-md">
        Waktu pengerjaan soal dihentikan sementara. Tekan tombol di bawah atau tombol{' '}
        <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700 font-mono text-xs">
          Esc
        </kbd>{' '}
        untuk melanjutkan drill.
      </p>
      <Button
        onClick={actions.resumeSession}
        size="lg"
        className="px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
      >
        Lanjutkan Pengerjaan (Esc)
      </Button>
    </div>
  );
};

// ==========================================
// 6. Drill Compound Export
// ==========================================
export const Drill = {
  Root: DrillRoot,
  Header: DrillHeaderCompound,
  TokenGrid: DrillTokenGrid,
  TokenCard,
  InputBar: DrillInputBar,
  PauseOverlay: DrillPauseOverlay,
};
