import React, { useState, useEffect } from 'react';
import { Copy, Check, Play, Loader2, AlertCircle } from 'lucide-react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useRaceStore } from '../../store/useRaceStore';

interface RaceLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoomId?: string | null;
}

export const RaceLobbyModal: React.FC<RaceLobbyModalProps> = ({
  isOpen,
  onClose,
  initialRoomId,
}) => {
  const {
    myName,
    setMyName,
    createRoom,
    joinRoom,
    startRaceCountdown,
    leaveRace,
    roomId,
    role,
    status,
    opponentName,
    isConnecting,
    errorMessage,
    clearError,
  } = useRaceStore();

  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [joinInputId, setJoinInputId] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-fill roomId if query param exists
  useEffect(() => {
    if (initialRoomId && isOpen) {
      setTab('join');
      setJoinInputId(initialRoomId);
    }
  }, [initialRoomId, isOpen]);

  const handleCreate = async () => {
    try {
      await createRoom(myName);
    } catch {
      // Handled in store
    }
  };

  const handleJoin = async () => {
    if (!joinInputId.trim()) return;
    try {
      await joinRoom(joinInputId.trim(), myName);
    } catch {
      // Handled in store
    }
  };

  const handleCopyLink = () => {
    if (!roomId) return;
    const url = `${window.location.origin}${window.location.pathname}?race=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    if (status === 'lobby') {
      leaveRace();
    }
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Balapan Online (1v1)"
      description="Adu kecepatan membaca Kana langsung bersama teman secara real-time via P2P."
      className="max-w-md w-full"
    >
      <div className="space-y-4">
        {/* Input Nama Pemain */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Nama Pembalap
          </label>
          <Input
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            placeholder="Masukkan nama kamu..."
            className="h-10 text-sm font-medium"
            disabled={status === 'lobby'}
          />
        </div>

        {errorMessage && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={clearError}
              className="text-[10px] underline font-semibold hover:opacity-80"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Jika belum berada di lobby room */}
        {status === 'idle' ? (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1">
              <button
                onClick={() => setTab('create')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  tab === 'create'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Buat Room Baru
              </button>
              <button
                onClick={() => setTab('join')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  tab === 'join'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Gabung Room
              </button>
            </div>

            {tab === 'create' ? (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Buat room balapan privat, lalu bagikan kode atau link ke temanmu.
                </p>
                <Button
                  onClick={handleCreate}
                  disabled={isConnecting}
                  className="w-full h-11 font-bold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Membuat Room...
                    </>
                  ) : (
                    'Buat Room Balapan'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Tempelkan Room Code atau buka link undangan yang diberikan oleh lawanmu.
                </p>
                <Input
                  value={joinInputId}
                  onChange={(e) => setJoinInputId(e.target.value)}
                  placeholder="Contoh: kd_abc123"
                  className="h-10 text-sm font-mono"
                />
                <Button
                  onClick={handleJoin}
                  disabled={isConnecting || !joinInputId.trim()}
                  className="w-full h-11 font-bold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Menghubungkan...
                    </>
                  ) : (
                    'Gabung ke Room'
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Saat sudah berada di Lobby Room */
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Kode Room:
                </span>
                <span className="font-mono font-black text-sm text-zinc-900 dark:text-zinc-100 px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800">
                  {roomId}
                </span>
              </div>

              {/* Salin link undangan */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="w-full h-9 gap-1.5 text-xs font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Link Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link Undangan Balapan</span>
                  </>
                )}
              </Button>
            </div>

            {/* Status Lawan */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    opponentName ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400 animate-ping'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {opponentName ? `Lawan: ${opponentName}` : 'Menunggu lawan bergabung...'}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {opponentName
                      ? 'Lawan sudah siap di lintasan!'
                      : 'Kirim link atau kode room ke temanmu untuk mulai.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              {role === 'host' ? (
                <Button
                  onClick={startRaceCountdown}
                  disabled={!opponentName}
                  className="w-full h-12 font-black text-base gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-40"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Mulai Balapan!</span>
                </Button>
              ) : (
                <div className="p-3 text-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/20">
                  Menunggu Tuan Rumah (Host) memulai balapan...
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={leaveRace}
                className="w-full text-xs text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400"
              >
                Keluar dari Room
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
