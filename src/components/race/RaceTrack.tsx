import { Flag, MapPin, Trophy, Zap } from 'lucide-react';
import { PlayerProgress } from '../../types/race';

interface RaceTrackProps {
  myProgress: PlayerProgress;
  players: PlayerProgress[];
}

const laneColors = [
  { dot: 'bg-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  { dot: 'bg-indigo-500', bar: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
  { dot: 'bg-amber-500', bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  { dot: 'bg-sky-500', bar: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400' },
  { dot: 'bg-fuchsia-500', bar: 'bg-fuchsia-500', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
];

export function RaceTrack({ myProgress, players }: RaceTrackProps) {
  const racers = [myProgress, ...players];

  return (
    <div className="w-full space-y-3 rounded-2xl border border-zinc-200/90 bg-white/90 p-3 shadow-sm backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-900/90 sm:p-4">
      <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="h-3 w-3 fill-amber-500 text-amber-500" />
          <span>Progres semua pemain</span>
        </div>
        <span>{racers.filter((player) => player.isFinished).length}/{racers.length} selesai</span>
      </div>

      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Start</span>
        <span className="flex items-center gap-1">Finish <Flag className="h-3 w-3" /></span>
      </div>

      <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
        {racers.map((player, index) => {
          const colors = laneColors[index % laneColors.length];
          const progress = Math.min(100, Math.max(0, player.progressPercent));
          return (
            <div key={player.id || 'me'} className="space-y-1">
              <div className="flex items-center justify-between gap-3 px-0.5 text-xs">
                <div className="flex min-w-0 items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${colors.dot}`} />
                  <span className="truncate">{player.name}{index === 0 ? ' (Kamu)' : ''}</span>
                  {player.isFinished && (
                    <span className={`inline-flex shrink-0 items-center gap-0.5 text-[10px] font-bold ${colors.text}`}>
                      <Trophy className="h-3 w-3" /> Selesai
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>{player.currentCpm} CPM</span>
                  <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{progress}%</span>
                </div>
              </div>
              <div className="relative flex h-2 w-full items-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className={`h-full rounded-full transition-all duration-300 ease-out ${colors.bar}`} style={{ width: `${progress}%` }} />
                <div className="absolute z-10 -translate-x-1/2 transition-all duration-300 ease-out" style={{ left: `${progress}%` }}>
                  <div className={`h-3.5 w-3.5 rounded-full ring-2 ring-white shadow-sm dark:ring-zinc-900 ${colors.dot}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
