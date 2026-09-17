import React, { useState, useEffect } from 'react';
import { Copy, Check, Play, Loader2, AlertCircle, Clock3, Users } from 'lucide-react';
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
    players,
    expiresAt,
    isConnecting,
    errorMessage,
    clearError,
  } = useRaceStore();

  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [joinInputId, setJoinInputId] = useState('');
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isOpen || !expiresAt) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [isOpen, expiresAt]);

  const inactiveSeconds = expiresAt ? Math.max(0, Math.ceil((expiresAt - now) / 1000)) : 300;
  const inactiveTime = `${Math.floor(inactiveSeconds / 60)}:${String(inactiveSeconds % 60).padStart(2, '0')}`;

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
      let roomCode = joinInputId.trim();
      try {
        const pastedUrl = new URL(roomCode);
        roomCode = pastedUrl.searchParams.get('race') || roomCode;
      } catch {
        // Input is already a room code.
      }
      await joinRoom(roomCode, myName);
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
      title="Balapan Multiplayer"
      description="Adu cepat membaca Kana bersama 2 pemain atau lebih secara real-time."
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
            className="h-11 text-base sm:text-sm font-medium"
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
                className={`flex-1 min-h-10 px-2 py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === 'create'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Buat Room Baru
              </button>
              <button
                onClick={() => setTab('join')}
                className={`flex-1 min-h-10 px-2 py-2 text-xs font-bold rounded-lg transition-all ${
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
                  Buat room privat, lalu bagikan satu link yang sama ke semua pemain.
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
                  Tempel Room Code atau link undangan yang diberikan host.
                </p>
                <Input
                  value={joinInputId}
                  onChange={(e) => setJoinInputId(e.target.value)}
                  placeholder="Contoh: kd_abc123"
                  className="h-11 text-base sm:text-sm font-mono"
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

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <Clock3 className="h-3.5 w-3.5" />
                <span>Room ditutup jika tidak aktif dalam {inactiveTime}</span>
              </div>
            </div>

            {/* Daftar pemain */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span>{players.length + 1} pemain di room</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Live</span>
              </div>
              <div className="max-h-32 space-y-2 overflow-y-auto overscroll-contain pr-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{myName} (Kamu{role === 'host' ? ', Host' : ''})</span>
                </div>
                {players.map((player) => (
                  <div key={player.id} className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span>{player.name}</span>
                  </div>
                ))}
                {players.length === 0 && (
                  <p className="pl-4 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Menunggu pemain lain membuka link undangan…
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              {role === 'host' ? (
                <Button
                  onClick={startRaceCountdown}
                  disabled={players.length < 1}
                  className="w-full h-12 font-black text-base gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-40"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Mulai untuk {players.length + 1} Pemain</span>
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
