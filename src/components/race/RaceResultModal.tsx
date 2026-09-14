import React from 'react';
import { Trophy, RotateCcw, Home, Clock, Gauge, Target } from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { useRaceStore } from '../../store/useRaceStore';

export const RaceResultModal: React.FC = () => {
  const {
    status,
    myName,
    opponentName,
    myProgress,
    opponentProgress,
    mySummary,
    opponentSummary,
    requestRematch,
    leaveRace,
  } = useRaceStore();

  const isOpen = status === 'finished';

  // Determine winner
  const isOpponentFinished = opponentProgress?.isFinished;
  const myFinishTime = myProgress.finishTimeMs || 999999;
  const opponentFinishTime = opponentProgress?.finishTimeMs || (isOpponentFinished ? 999999 : 9999999);

  const iWon = isOpponentFinished ? myFinishTime <= opponentFinishTime : true;

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const remS = s % 60;
    return `${m}:${remS.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={leaveRace}
      title={iWon ? '🎉 Kamu Menang Balapan!' : '🥈 Lawan Lebih Cepat!'}
      description={
        iWon
          ? 'Refleks Kana kamu luar biasa cepat menembus garis finish lebih dulu!'
          : 'Balapan sengit! Asah refleksmu lagi dan ajak tanding ulang.'
      }
      className="max-w-lg w-full"
    >
      <div className="space-y-6">
        {/* Winner Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/20">
          <Trophy className="w-8 h-8" />
        </div>

        {/* Stats Comparison Card */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Card Kamu */}
          <div
            className={`p-4 rounded-2xl border ${
              iWon
                ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800'
            } space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                {myName}
              </span>
              {iWon && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                  Juara 1
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5" /> CPM
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {mySummary?.cpm || myProgress.currentCpm}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Waktu
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {formatTime(myFinishTime)}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> Akurasi
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {mySummary?.accuracyPercentage || 100}%
                </span>
              </div>
            </div>
          </div>

          {/* Card Lawan */}
          <div
            className={`p-4 rounded-2xl border ${
              !iWon && isOpponentFinished
                ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800'
            } space-y-3`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                {opponentName || 'Lawan'}
              </span>
              {!iWon && isOpponentFinished && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                  Juara 1
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5" /> CPM
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {opponentSummary?.cpm || opponentProgress?.currentCpm || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Waktu
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {isOpponentFinished ? formatTime(opponentFinishTime) : 'Belum selesai'}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> Akurasi
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {opponentSummary?.accuracyPercentage ? `${opponentSummary.accuracyPercentage}%` : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            onClick={requestRematch}
            size="lg"
            className="w-full sm:flex-1 font-bold h-11 gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tanding Ulang (Rematch)</span>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={leaveRace}
            className="w-full sm:w-auto h-11 px-5 font-semibold text-xs gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Menu</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
