import React from 'react';
import { Flag, Zap, Trophy } from 'lucide-react';
import { PlayerProgress } from '../../types/race';

interface RaceTrackProps {
  myProgress: PlayerProgress;
  opponentProgress: PlayerProgress | null;
  myName: string;
  opponentName: string | null;
}

export const RaceTrack: React.FC<RaceTrackProps> = ({
  myProgress,
  opponentProgress,
  myName,
  opponentName,
}) => {
  return (
    <div className="w-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-3 sm:p-4 shadow-sm backdrop-blur-md space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>Lintasan Balapan</span>
        </div>
        <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
          <Flag className="w-3 h-3" />
          <span>Finish</span>
        </div>
      </div>

      {/* Track Lanes */}
      <div className="space-y-2.5">
        {/* Lane 1: Player (You) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs px-0.5">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{myName} (Kamu)</span>
              {myProgress.isFinished && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                  <Trophy className="w-2.5 h-2.5" /> FINISH
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
              <span>{myProgress.currentCpm} CPM</span>
              <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                {myProgress.progressPercent}%
              </span>
            </div>
          </div>

          {/* Minimalist Line Track with Dot */}
          <div className="relative h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center">
            {/* Filled line */}
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, myProgress.progressPercent))}%` }}
            />

            {/* Runner Dot */}
            <div
              className="absolute transition-all duration-300 ease-out -translate-x-1/2 z-10"
              style={{
                left: `${Math.min(100, Math.max(0, myProgress.progressPercent))}%`,
              }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900 shadow-sm" />
            </div>
          </div>
        </div>

        {/* Lane 2: Opponent */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs px-0.5">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{opponentName || 'Menunggu Lawan...'}</span>
              {opponentProgress?.isFinished && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono border border-indigo-500/20">
                  <Trophy className="w-2.5 h-2.5" /> FINISH
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
              <span>{opponentProgress?.currentCpm || 0} CPM</span>
              <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                {opponentProgress?.progressPercent || 0}%
              </span>
            </div>
          </div>

          {/* Minimalist Line Track with Dot */}
          <div className="relative h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center">
            {/* Filled line */}
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${Math.min(100, Math.max(0, opponentProgress?.progressPercent || 0))}%`,
              }}
            />

            {/* Runner Dot */}
            <div
              className="absolute transition-all duration-300 ease-out -translate-x-1/2 z-10"
              style={{
                left: `${Math.min(100, Math.max(0, opponentProgress?.progressPercent || 0))}%`,
              }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-zinc-900 shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
