import React from 'react';
import { Flag, Zap, User, Trophy } from 'lucide-react';
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
    <div className="w-full bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-sm backdrop-blur-md space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Lintasan Balapan (Realtime)</span>
        </div>
        <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
          <Flag className="w-3.5 h-3.5" />
          <span>Garis Finish (100%)</span>
        </div>
      </div>

      {/* Track Lanes */}
      <div className="space-y-3">
        {/* Lane 1: Player (You) */}
        <div className="relative bg-zinc-100 dark:bg-zinc-950/60 rounded-xl p-2.5 border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5 px-1">
            <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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

          {/* Lane Track */}
          <div className="relative h-7 w-full bg-zinc-200/70 dark:bg-zinc-900 rounded-lg overflow-hidden flex items-center px-1">
            {/* Striped finish line indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-[repeating-linear-gradient(45deg,#000,#000_3px,#fff_3px,#fff_6px)] dark:bg-[repeating-linear-gradient(45deg,#222,#222_3px,#888_3px,#888_6px)] opacity-60 z-0" />

            {/* Filled progress bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500/30 to-emerald-500/60 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(3, myProgress.progressPercent))}%` }}
            />

            {/* Runner/Car Avatar */}
            <div
              className="absolute transition-all duration-300 ease-out flex items-center gap-1 z-10"
              style={{
                left: `calc(${Math.min(94, Math.max(0, myProgress.progressPercent))}% - 4px)`,
              }}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 ring-2 ring-white dark:ring-zinc-900">
                <User className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Lane 2: Opponent */}
        <div className="relative bg-zinc-100 dark:bg-zinc-950/60 rounded-xl p-2.5 border border-zinc-200 dark:border-zinc-800/80 overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5 px-1">
            <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
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

          {/* Lane Track */}
          <div className="relative h-7 w-full bg-zinc-200/70 dark:bg-zinc-900 rounded-lg overflow-hidden flex items-center px-1">
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-[repeating-linear-gradient(45deg,#000,#000_3px,#fff_3px,#fff_6px)] dark:bg-[repeating-linear-gradient(45deg,#222,#222_3px,#888_3px,#888_6px)] opacity-60 z-0" />

            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500/30 to-indigo-500/60 transition-all duration-300 ease-out"
              style={{
                width: `${Math.min(100, Math.max(3, opponentProgress?.progressPercent || 0))}%`,
              }}
            />

            <div
              className="absolute transition-all duration-300 ease-out flex items-center gap-1 z-10"
              style={{
                left: `calc(${Math.min(94, Math.max(0, opponentProgress?.progressPercent || 0))}% - 4px)`,
              }}
            >
              <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 ring-2 ring-white dark:ring-zinc-900">
                <User className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
