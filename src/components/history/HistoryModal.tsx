import React, { useState, useMemo } from 'react';
import { useHistoryStore } from '../../store/useHistoryStore';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatTime } from '../../lib/utils';
import { Trash2, Calendar, Target, Clock, Zap, Layers } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const records = useHistoryStore((s) => s.records);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const getLifetimeStats = useHistoryStore((s) => s.getLifetimeStats);

  const [confirmClear, setConfirmClear] = useState(false);
  const [filterScript, setFilterScript] = useState<'all' | 'hiragana' | 'katakana' | 'both'>('all');

  const stats = useMemo(() => getLifetimeStats(), [records, getLifetimeStats]);

  const filteredRecords = useMemo(() => {
    if (filterScript === 'all') return records;
    return records.filter((r) => r.config.script === filterScript);
  }, [records, filterScript]);

  const handleClear = () => {
    clearHistory();
    setConfirmClear(false);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Riwayat & Statistik Latihan"
      description="Rekap performa dan data sesi drill yang tersimpan pada penyimpanan peramban Anda."
    >
      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">Belum ada riwayat sesi tersimpan.</p>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Selesaikan minimal 1 sesi (10 soal) untuk melihat grafik kemajuan dan rekor kecepatan di sini.
            </p>
          </div>
        ) : (
          <>
            {/* Lifetime Summary Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Total Sesi
                </div>
                <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
                  {stats.totalSessions}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  {stats.totalTokens} token
                </div>
              </div>

              <div className="text-center border-l border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Total Waktu
                </div>
                <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
                  {formatTime(stats.totalTimeMs)}
                </div>
                <div className="text-[10px] text-zinc-500">
                  Waktu drill
                </div>
              </div>

              <div className="text-center border-l border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Best CPM
                </div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  {stats.bestCpm}
                </div>
                <div className="text-[10px] text-zinc-500">
                  Karakter/mnt
                </div>
              </div>

              <div className="text-center border-l border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Rata-rata Akurasi
                </div>
                <div className="text-lg font-black text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
                  {stats.avgAccuracy}%
                </div>
                <div className="text-[10px] text-zinc-500">
                  Presisi jawaban
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(
                  [
                    { key: 'all', label: 'Semua' },
                    { key: 'hiragana', label: 'Hiragana' },
                    { key: 'katakana', label: 'Katakana' },
                    { key: 'both', label: 'Campuran' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilterScript(f.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filterScript === f.key
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <span className="text-xs text-zinc-400 font-mono">
                {filteredRecords.length} sesi
              </span>
            </div>

            {/* List Riwayat Sesi */}
            <div className="max-h-[42vh] overflow-y-auto space-y-2 pr-1">
              {filteredRecords.map((rec) => {
                const date = new Date(rec.timestamp);
                const formattedDate = date.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={rec.sessionId}
                    className="p-3 bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          {formattedDate}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono py-0">
                          {rec.config.script}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] capitalize py-0">
                          {rec.config.mode}
                        </Badge>
                      </div>

                      <div className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          {formatTime(rec.summary.totalDurationMs)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-emerald-600 dark:text-emerald-500" />
                          {rec.summary.accuracyPercentage}% Akurasi
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono">
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center sm:justify-end gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>{rec.summary.cpm} CPM</span>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {rec.summary.wpm} WPM
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Clear Action */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Maksimal 50 sesi disimpan di LocalStorage
              </span>

              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    Hapus semua?
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClear}
                    className="h-8 text-xs font-semibold cursor-pointer"
                  >
                    Ya, Hapus
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmClear(false)}
                    className="h-8 text-xs cursor-pointer"
                  >
                    Batal
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmClear(true)}
                  className="h-8 text-xs text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Riwayat</span>
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
};
