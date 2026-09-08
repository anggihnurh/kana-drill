import React from 'react';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { LiveTimer } from './LiveTimer';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Flame } from 'lucide-react';
import { useDrillStore } from '../../store/useDrillStore';

interface DrillHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  isPaused: boolean;
  isRunning: boolean;
  questionIndex: number;
  streak: number;
  onTogglePause: () => void;
  onReset: () => void;
}

export const DrillHeader: React.FC<DrillHeaderProps> = React.memo(
  ({
    currentQuestion,
    totalQuestions,
    isPaused,
    isRunning,
    questionIndex,
    streak,
    onTogglePause,
    onReset,
  }) => {
    const soundEnabled = useDrillStore((s) => s.config.soundEnabled);
    const setConfig = useDrillStore((s) => s.setConfig);

    const progressPercent = ((currentQuestion - 1) / totalQuestions) * 100;

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
                {currentQuestion}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold font-mono">
                / {totalQuestions}
              </span>
            </div>

            <div className="hidden sm:block w-32 md:w-44">
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Live Combo Streak Badge */}
            {streak >= 3 ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-bold font-mono animate-combo-bounce shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{streak}x Combo!</span>
              </div>
            ) : null}
          </div>

          {/* Center: Live Timer Per Soal (Decoupled & Isolated) */}
          <LiveTimer
            isRunning={isRunning}
            isPaused={isPaused}
            questionIndex={questionIndex}
          />

          {/* Right: Controls (Sound, Pause, Reset) */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfig({ soundEnabled: !soundEnabled })}
              title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              aria-label="Toggle Suara"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              )}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onTogglePause}
              className="text-xs gap-1.5 font-medium"
            >
              {isPaused ? (
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
              onClick={onReset}
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
  }
);

DrillHeader.displayName = 'DrillHeader';
