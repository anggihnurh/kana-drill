import {
  Award,
  History,
  Layers,
  Play,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { playSound } from '../../lib/soundEffects';
import { useDrillStore } from '../../store/useDrillStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { HistoryModal } from '../history/HistoryModal';
import { RaceLobbyModal } from '../race/RaceLobbyModal';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { SetupContext, SetupContextValue, useSetupContext } from './SetupContext';

// ==========================================
// 1. Setup Root (Provider)
// ==========================================
export interface SetupRootProps {
  children: React.ReactNode;
}

export const SetupRoot: React.FC<SetupRootProps> = ({ children }) => {
  const config = useDrillStore((s) => s.config);
  const setConfig = useDrillStore((s) => s.setConfig);
  const startSessionStore = useDrillStore((s) => s.startSession);

  const records = useHistoryStore((s) => s.records);
  const getBestRecord = useHistoryStore((s) => s.getBestRecord);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRaceLobbyOpen, setIsRaceLobbyOpen] = useState(false);
  const [raceRoomQueryId, setRaceRoomQueryId] = useState<string | null>(null);

  const bestRecord = useMemo(() => getBestRecord(), [records, getBestRecord]);

  // Check ?race=ROOM_ID in URL query params on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const raceParam = params.get('race');
      if (raceParam) {
        setRaceRoomQueryId(raceParam);
        setIsRaceLobbyOpen(true);
      }
    } catch {
      // Safe fallback
    }
  }, []);

  const toggleSound = useCallback(() => {
    const next = !config.soundEnabled;
    setConfig({ soundEnabled: next });
    if (next) {
      playSound('correct', true);
    }
  }, [config.soundEnabled, setConfig]);

  const startSession = useCallback(() => {
    startSessionStore();
  }, [startSessionStore]);

  const contextValue: SetupContextValue = useMemo(
    () => ({
      state: {
        config,
        records,
        bestRecord,
        isHistoryOpen,
        isRaceLobbyOpen,
        raceRoomQueryId,
      },
      actions: {
        setConfig,
        startSession,
        toggleSound,
        setIsHistoryOpen,
        setIsRaceLobbyOpen,
      },
    }),
    [
      config,
      records,
      bestRecord,
      isHistoryOpen,
      isRaceLobbyOpen,
      raceRoomQueryId,
      setConfig,
      startSession,
      toggleSound,
    ]
  );

  return (
    <SetupContext.Provider value={contextValue}>
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 animate-pop-in">
        {children}
        <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
        <RaceLobbyModal
          isOpen={isRaceLobbyOpen}
          onClose={() => setIsRaceLobbyOpen(false)}
          initialRoomId={raceRoomQueryId}
        />
      </div>
    </SetupContext.Provider>
  );
};

// ==========================================
// 2. Setup Hero Banner
// ==========================================
export const SetupHero: React.FC = () => {
  const { state } = useSetupContext();

  return (
    <div className="text-center space-y-2.5 pt-2">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 text-xs font-semibold tracking-wide mb-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Japanese Kana Reflex Trainer</span>
      </div>

      <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center justify-center gap-3">
        <span>Kana</span>
        <span className="text-zinc-700 dark:text-zinc-300">Drill</span>
        <span className="font-japanese text-3xl sm:text-4xl font-normal text-zinc-400 dark:text-zinc-500">
          かな練習
        </span>
      </h1>

      <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
        Latih refleks membaca huruf Hiragana & Katakana dengan cepat, presisi, dan otomatis tanpa mengeja lambat.
      </p>

      {state.records.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <Badge variant="default" className="gap-1.5 py-1 px-3 shadow-sm">
            <Layers className="w-3.5 h-3.5" />
            <span>{state.records.length} Sesi Terselesaikan</span>
          </Badge>
          {state.bestRecord ? (
            <Badge variant="success" className="gap-1.5 py-1 px-3 shadow-sm">
              <Award className="w-3.5 h-3.5" />
              <span>Best CPM: {state.bestRecord.summary.cpm}</span>
            </Badge>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
// ==========================================
// 7. Setup Session Overview & Action
// ==========================================
export const SetupSessionOverview: React.FC = () => {
  const { actions } = useSetupContext();

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <Button
        onClick={actions.startSession}
        size="lg"
        className="w-full max-w-sm font-bold h-12 text-base gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 shadow-sm cursor-pointer"
      >
        <Play className="w-4 h-4 fill-white dark:fill-zinc-900" />
        <span>Mulai Sesi Drill Solo</span>
      </Button>

      <Button
        variant="outline"
        onClick={() => actions.setIsRaceLobbyOpen(true)}
        className="w-full max-w-sm h-11 gap-2 text-xs font-bold border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 cursor-pointer shadow-sm"
      >
        <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
        <span>Balapan Online (1v1 TypeRacer)</span>
      </Button>

      <Button
        variant="secondary"
        onClick={() => actions.setIsHistoryOpen(true)}
        className="w-full max-w-sm h-10 gap-2 text-xs font-semibold cursor-pointer"
      >
        <History className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
        <span>Riwayat & Statistik</span>
      </Button>
    </div>
  );
};

// ==========================================
// 8. Setup Resume Banner (Saved Session)
// ==========================================
export const SetupResumeBanner: React.FC = () => {
  const hasSavedSession = useDrillStore((s) => s.hasSavedSession);
  const savedQuestions = useDrillStore((s) => s.questions);
  const savedQuestionIndex = useDrillStore((s) => s.currentQuestionIndex);
  const resumeSession = useDrillStore((s) => s.resumeSession);
  const resetSession = useDrillStore((s) => s.resetSession);
  const [dismissed, setDismissed] = useState(false);

  if (!hasSavedSession || dismissed || savedQuestions.length === 0) return null;

  const totalQuestions = savedQuestions.length || 10;
  const currentQ = savedQuestions[savedQuestionIndex];
  const tokenCount = currentQ?.tokens.length || 9;
  const answeredOnCurrent = currentQ
    ? currentQ.tokens.filter((t) => t.userAnswer !== undefined).length
    : 0;

  const completedQuestions = savedQuestions.filter((q) => q.isCompleted).length;

  const handleResume = () => {
    resumeSession();
  };

  const handleDiscard = () => {
    setDismissed(true);
    resetSession();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-400/60 bg-gradient-to-br from-amber-50 to-orange-50/60 dark:from-amber-950/40 dark:to-orange-950/30 dark:border-amber-500/40 shadow-md shadow-amber-500/10 animate-pop-in">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 pointer-events-none" />

      <div className="relative p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30">
            <PlayCircle className="w-5 h-5 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Sesi Latihan Tersimpan
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold uppercase tracking-wider">
                Dijeda
              </span>
            </div>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/70 mt-1">
              Soal{' '}
              <strong className="font-mono font-bold text-amber-900 dark:text-amber-200">
                {savedQuestionIndex + 1} / {totalQuestions}
              </strong>
              {answeredOnCurrent > 0 ? (
                <>
                  {' '}— sudah terjawab{' '}
                  <strong className="font-mono font-bold text-amber-900 dark:text-amber-200">
                    {answeredOnCurrent} / {tokenCount}
                  </strong>{' '}
                  token di soal ini
                </>
              ) : null}
              {completedQuestions > 0 ? (
                <>
                  {', '}
                  <strong className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {completedQuestions}
                  </strong>{' '}
                  soal selesai
                </>
              ) : null}
            </p>
          </div>

          {/* Progress bar mini */}
          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-semibold">
              {Math.round(((completedQuestions) / totalQuestions) * 100)}% selesai
            </span>
            <div className="w-24 h-1.5 rounded-full bg-amber-200 dark:bg-amber-900 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                style={{ width: `${Math.max(5, (completedQuestions / totalQuestions) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 mt-4">
          <Button
            onClick={handleResume}
            size="sm"
            className="gap-2 font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 cursor-pointer border-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Lanjutkan Sesi
          </Button>
          <button
            type="button"
            onClick={handleDiscard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Buang Sesi
          </button>
        </div>
      </div>
    </div>
  );
};

export const Setup = {
  Root: SetupRoot,
  Hero: SetupHero,
  ResumeBanner: SetupResumeBanner,
  SessionOverview: SetupSessionOverview,
};
