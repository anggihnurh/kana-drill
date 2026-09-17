import { Clock, Gauge, Home, Medal, RotateCcw, Target, Trophy } from 'lucide-react';
import { useRaceStore } from '../../store/useRaceStore';
import { PlayerProgress } from '../../types/race';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';

const formatTime = (milliseconds?: number) => {
  if (milliseconds === undefined) return '—';
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}.${String(Math.floor((milliseconds % 1000) / 100))}`;
};

export function RaceResultModal() {
  const { status, myProgress, players, summaries, role, requestRematch, leaveRace } = useRaceStore();
  const ranking = [myProgress, ...players].sort(
    (a, b) => (a.finishTimeMs ?? Number.MAX_SAFE_INTEGER) - (b.finishTimeMs ?? Number.MAX_SAFE_INTEGER)
  );
  const myRank = ranking.findIndex((player) => player.id === myProgress.id) + 1;

  return (
    <Dialog
      isOpen={status === 'finished'}
      onClose={leaveRace}
      title={myRank === 1 ? '🏆 Kamu Juara!' : `Balapan Selesai — Peringkat #${myRank}`}
      description="Semua pemain sudah mencapai garis finish. Berikut klasemen akhir room ini."
      className="max-w-2xl w-full"
    >
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center justify-center">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
            <Trophy className="h-7 w-7" />
          </div>
        </div>

        <div className="max-h-[42dvh] sm:max-h-[48vh] space-y-2 overflow-y-auto overscroll-contain pr-1">
          {ranking.map((player: PlayerProgress, index) => {
            const summary = summaries[player.id];
            const isMe = player.id === myProgress.id;
            return (
              <div
                key={player.id}
                className={`grid grid-cols-[auto_1fr] gap-3 rounded-2xl border p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center ${
                  index === 0
                    ? 'border-amber-300 bg-amber-50/70 dark:border-amber-800/70 dark:bg-amber-950/20'
                    : 'border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/50'
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-black ${index === 0 ? 'bg-amber-500 text-white' : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'}`}>
                  {index < 3 ? <Medal className="h-5 w-5" /> : index + 1}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                    #{index + 1} {player.name}{isMe ? ' (Kamu)' : ''}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <Clock className="h-3 w-3" /> {formatTime(player.finishTimeMs)}
                  </p>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-4 border-t border-zinc-200/70 pt-2 text-xs dark:border-zinc-800 sm:col-span-1 sm:border-0 sm:pt-0">
                  <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                    <Gauge className="h-3.5 w-3.5" /> <strong className="font-mono text-zinc-900 dark:text-zinc-100">{summary?.cpm ?? player.currentCpm}</strong> CPM
                  </span>
                  <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                    <Target className="h-3.5 w-3.5" /> <strong className="font-mono text-zinc-900 dark:text-zinc-100">{summary?.accuracyPercentage ?? 0}%</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <Button onClick={requestRematch} size="lg" className="h-11 w-full flex-1 gap-2 font-bold">
            <RotateCcw className="h-4 w-4" />
            <span>{role === 'host' ? 'Rematch dengan Pemain yang Sama' : 'Minta Rematch'}</span>
          </Button>
          <Button variant="secondary" size="lg" onClick={leaveRace} className="h-11 w-full gap-2 font-semibold sm:w-auto">
            <Home className="h-4 w-4" /> Kembali ke Menu
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
