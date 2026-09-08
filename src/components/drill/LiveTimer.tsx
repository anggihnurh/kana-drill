import React from 'react';
import { useStopwatch } from '../../hooks/useStopwatch';
import { formatTime } from '../../lib/utils';
import { Timer as TimerIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LiveTimerProps {
  isRunning: boolean;
  isPaused: boolean;
  questionIndex: number;
  className?: string;
}

/**
 * Isolated Live Timer Component (Vercel Best Practice: rerender-defer-reads)
 * Localizes stopwatch render state to this badge alone, preventing parent
 * DrillScreen and 10 TokenCard children from re-rendering every 50ms.
 */
export const LiveTimer: React.FC<LiveTimerProps> = React.memo(
  ({ isRunning, isPaused, questionIndex, className }) => {
    const { elapsedMs } = useStopwatch({
      isRunning,
      questionIndex,
    });

    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm transition-colors',
          isPaused
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            : 'bg-zinc-100 dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100',
          className
        )}
      >
        <TimerIcon
          className={cn(
            'w-4 h-4 transition-colors',
            isPaused
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-emerald-600 dark:text-emerald-400 animate-pulse'
          )}
        />
        <span className="font-mono text-base font-bold tracking-wider min-w-[72px] text-center tabular-nums">
          {formatTime(elapsedMs)}
        </span>
        {isPaused ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 rounded font-mono">
            PAUSE
          </span>
        ) : null}
      </div>
    );
  }
);

LiveTimer.displayName = 'LiveTimer';
