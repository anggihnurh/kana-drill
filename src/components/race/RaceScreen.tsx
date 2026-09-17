import React, { useRef, useEffect } from 'react';
import { ChevronRight, CornerDownLeft, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { useRaceStore } from '../../store/useRaceStore';
import { RaceTrack } from './RaceTrack';
import { RaceResultModal } from './RaceResultModal';
import { TokenCard } from '../drill/TokenCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

export const RaceScreen: React.FC = () => {
  const {
    status,
    myProgress,
    players,
    questions,
    currentQuestionIndex,
    activeTokenIndex,
    currentInput,
    isInputErrorShake,
    countdown,
    setInput,
    submitCurrentToken,
    selectToken,
    nextQuestion,
    leaveRace,
  } = useRaceStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length || 5;
  const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

  const isAllAnswered =
    currentQ?.tokens.every((t) => t.userAnswer !== undefined) ?? false;

  // Auto-focus input when racing starts
  useEffect(() => {
    if (status === 'racing') {
      inputRef.current?.focus();
    }
  }, [status, currentQuestionIndex, activeTokenIndex]);

  // Auto advance to next question when all tokens in current question are answered
  useEffect(() => {
    if (status === 'racing' && isAllAnswered) {
      const timer = setTimeout(() => {
        nextQuestion(3000);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [status, isAllAnswered, nextQuestion]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (currentInput.trim().length > 0) {
        submitCurrentToken();
        return;
      }
      if (isAllAnswered) {
        nextQuestion(3000);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (!currentQ) return;
      const nextIdx = (activeTokenIndex + 1) % currentQ.tokens.length;
      selectToken(nextIdx);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3 sm:space-y-5 pb-32 sm:pb-24 animate-pop-in">
      {/* Top Bar with Leave Button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Soal Balapan
          </span>
          <span className="text-xl font-black font-mono text-zinc-900 dark:text-zinc-100">
            {currentQuestionIndex + 1}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono font-semibold">
            / {totalQuestions}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={leaveRace}
          className="text-xs gap-1.5 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Keluar Balapan</span>
        </Button>
      </div>

      {/* Lintasan Balapan TypeRacer */}
      <RaceTrack
        myProgress={myProgress}
        players={players}
      />

      {status === 'waiting' && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <div>
            <p className="text-sm font-bold">Kamu sudah mencapai finish</p>
            <p className="text-xs opacity-80">Menunggu {players.filter((player) => !player.isFinished).length} pemain lain menyelesaikan balapan…</p>
          </div>
        </div>
      )}

      {/* Countdown Overlay (3, 2, 1, Mulai!) */}
      {status === 'countdown' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center animate-pop-in">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Bersiap di Garis Start...
            </span>
            <div className="text-8xl sm:text-9xl font-black font-mono text-white animate-bounce">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
            <p className="text-zinc-400 text-sm">Adu cepat refleks Kana!</p>
          </div>
        </div>
      )}

      {/* Token Cards Grid */}
      {currentQ && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3.5 pt-1 sm:pt-2">
          {currentQ.tokens.map((token, idx) => (
            <TokenCard
              key={token.id || idx}
              index={idx}
              token={token}
              isActive={status === 'racing' && idx === activeTokenIndex}
              onClick={() => selectToken(idx)}
            />
          ))}
        </div>
      )}

      {/* Fixed/Sticky Bottom Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:sticky sm:bottom-4 w-full max-w-5xl mx-auto bg-white/95 dark:bg-zinc-900/95 border-t sm:border border-zinc-200/90 dark:border-zinc-800/90 sm:rounded-2xl px-3 pt-3 sm:p-4 shadow-2xl backdrop-blur-xl pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status !== 'racing'}
              placeholder="Ketik Romaji... Tekan Spasi / Enter"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              className={cn(
                'h-12 text-base font-mono bg-zinc-50/80 dark:bg-zinc-950/90 border-zinc-300 dark:border-zinc-700/80 pr-14 focus-visible:ring-zinc-600 dark:focus-visible:ring-zinc-400 text-zinc-900 dark:text-zinc-100 shadow-inner',
                isInputErrorShake &&
                  'animate-shake border-rose-500 text-rose-600 dark:border-rose-500/80 dark:text-rose-300'
              )}
            />
            <button
              type="button"
              onClick={() => submitCurrentToken()}
              disabled={!currentInput.trim() || status !== 'racing'}
              className="absolute right-2 top-2 h-8 px-2.5 rounded-lg bg-zinc-200/80 hover:bg-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 disabled:opacity-20 transition-all flex items-center gap-1 text-xs font-mono font-medium cursor-pointer shadow-sm"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Submit</span>
            </button>
          </div>

          <Button
            onClick={() => nextQuestion(3000)}
            disabled={status !== 'racing'}
            variant={isAllAnswered ? 'success' : 'default'}
            className="hidden sm:inline-flex h-12 px-5 font-bold shrink-0 gap-2 shadow-md transition-all cursor-pointer"
          >
            {isLastQuestion ? (
              <>
                <span>Finish Balapan</span>
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Soal Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Shortcut guide */}
        <div className="mt-2.5 hidden sm:flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
          <span>
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
          <span className="hidden sm:inline">
            <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 rounded font-mono text-[10px] text-zinc-700 dark:text-zinc-300">
              Tab
            </kbd>{' '}
            Pindah Token
          </span>
        </div>
      </div>

      {/* Result Modal when finished */}
      <RaceResultModal />
    </div>
  );
};
