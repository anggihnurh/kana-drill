import React, { useState, useMemo, useCallback } from 'react';
import {
  ResultContext,
  useResultContext,
  ResultContextValue,
  PerformanceRank,
  MistakeItem,
} from './ResultContext';
import { useDrillStore } from '../../store/useDrillStore';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { formatTime, cn } from '../../lib/utils';
import {
  RotateCcw,
  Target,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  Home,
  ChevronDown,
  ChevronUp,
  Share2,
  Check,
  Award,
} from 'lucide-react';

function calculateRank(cpm: number, accuracy: number): PerformanceRank {
  if (cpm >= 200 && accuracy >= 95) {
    return {
      grade: 'S+',
      title: 'Divine Reflex (神レベル)',
      badgeVariant: 'success',
      description: 'Refleks membaca sempurna dan instan tanpa jeda mengeja!',
    };
  }
  if (cpm >= 150 && accuracy >= 90) {
    return {
      grade: 'S',
      title: 'Kana Master (達人)',
      badgeVariant: 'success',
      description: 'Kecepatan dan presisi tingkat tinggi, siap untuk tes JLPT!',
    };
  }
  if (cpm >= 100 && accuracy >= 80) {
    return {
      grade: 'A',
      title: 'Fluent Reader (上級)',
      badgeVariant: 'indigo',
      description: 'Kemampuan membaca lancar dengan refleks yang sangat baik.',
    };
  }
  if (cpm >= 65) {
    return {
      grade: 'B',
      title: 'Steady Learner (中級)',
      badgeVariant: 'default',
      description: 'Progres bagus! Latih terus untuk meningkatkan otomatisasi membaca.',
    };
  }
  return {
    grade: 'C',
    title: 'Beginner Cadet (初級)',
    badgeVariant: 'default',
    description: 'Pondasi awal yang baik. Ulangi sesi secara rutin untuk membangun refleks.',
  };
}

// ==========================================
// 1. Result Root (Provider)
// ==========================================
export interface ResultRootProps {
  children: React.ReactNode;
}

export const ResultRoot: React.FC<ResultRootProps> = ({ children }) => {
  const lastCompletedSession = useDrillStore((s) => s.lastCompletedSession);
  const startSessionStore = useDrillStore((s) => s.startSession);
  const resetSessionStore = useDrillStore((s) => s.resetSession);
  const retryMistakesStore = useDrillStore((s) => s.retryMistakes);
  const maxStreak = useDrillStore((s) => s.maxStreak);

  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!lastCompletedSession) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-500 dark:text-zinc-400">Tidak ada sesi aktif yang ditemukan.</p>
        <Button onClick={resetSessionStore} className="mt-4">
          Kembali ke Menu
        </Button>
      </div>
    );
  }

  const { summary, questions, config } = lastCompletedSession;
  const rank = useMemo(
    () => calculateRank(summary.cpm, summary.accuracyPercentage),
    [summary.cpm, summary.accuracyPercentage]
  );

  const mistakes: MistakeItem[] = useMemo(() => {
    const list: MistakeItem[] = [];
    for (let q = 0; q < questions.length; q++) {
      const qTokens = questions[q].tokens;
      for (let t = 0; t < qTokens.length; t++) {
        const tok = qTokens[t];
        if (!tok.isCorrect) {
          list.push({
            questionIndex: q + 1,
            tokenIndex: t + 1,
            kanaText: tok.kanaText,
            meaning: tok.meaning,
            userAnswer: tok.userAnswer || '(kosong)',
            expectedRomaji: tok.expectedRomaji,
          });
        }
      }
    }
    return list;
  }, [questions]);

  const maxDuration = useMemo(
    () => questions.reduce((max, q) => (q.durationMs > max ? q.durationMs : max), 1000),
    [questions]
  );

  const shareScore = useCallback(async () => {
    const text = `🎌 KanaDrill Performance Summary:\n👑 Rank: ${rank.grade} (${rank.title})\n⚡ CPM: ${summary.cpm} | WPM: ${summary.wpm}\n🎯 Akurasi: ${summary.accuracyPercentage}%\n⏱ Total Waktu: ${formatTime(summary.totalDurationMs)}\n🔥 Best Streak: ${maxStreak}x`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch {
      // Safe fallback
    }
  }, [rank, summary, maxStreak]);

  const contextValue: ResultContextValue = useMemo(
    () => ({
      state: {
        lastCompletedSession,
        summary,
        questions,
        config,
        rank,
        mistakes,
        hasMistakes: mistakes.length > 0,
        maxStreak,
        maxDuration,
        expandedQuestion,
        isCopied,
      },
      actions: {
        setExpandedQuestion,
        startSession: startSessionStore,
        resetSession: resetSessionStore,
        retryMistakes: retryMistakesStore,
        shareScore,
      },
    }),
    [
      lastCompletedSession,
      summary,
      questions,
      config,
      rank,
      mistakes,
      maxStreak,
      maxDuration,
      expandedQuestion,
      isCopied,
      startSessionStore,
      resetSessionStore,
      retryMistakesStore,
      shareScore,
    ]
  );

  return (
    <ResultContext.Provider value={contextValue}>
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-16 animate-pop-in">
        {children}
      </div>
    </ResultContext.Provider>
  );
};

// ==========================================
// 2. Result Rank Banner
// ==========================================
export const ResultRankBanner: React.FC = () => {
  const { state } = useResultContext();
  const { rank, config, maxStreak } = state;

  return (
    <div className="text-center space-y-3 pt-2">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono">
        <Award className="w-4 h-4 text-indigo-500" />
        <span>Sesi 10 Soal Selesai</span>
      </div>

      <div className="flex items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-500/30 font-mono">
          {rank.grade}
        </div>
        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            {rank.title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {rank.description}
          </p>
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
        Mode: <strong className="text-zinc-800 dark:text-zinc-200 capitalize">{config.mode}</strong> •{' '}
        Aksara: <strong className="text-zinc-800 dark:text-zinc-200 capitalize">{config.script}</strong> •{' '}
        Max Streak: <strong className="text-amber-600 dark:text-amber-400 font-mono">{maxStreak}x 🔥</strong>
      </p>
    </div>
  );
};

// ==========================================
// 3. Result Metrics Grid
// ==========================================
export const ResultMetricsGrid: React.FC = () => {
  const { state } = useResultContext();
  const { summary } = state;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Card className="p-4 bg-white dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Akurasi</span>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
          {summary.accuracyPercentage}%
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">
          {summary.correctTokens} dari {summary.totalTokens} token benar
        </div>
      </Card>

      <Card className="p-4 bg-white dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Total Waktu</span>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-300 font-mono">
          {formatTime(summary.totalDurationMs)}
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">
          Rata-rata {formatTime(summary.averageDurationPerQuestionMs)} / soal
        </div>
      </Card>

      <Card className="p-4 bg-white dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Kecepatan (CPM)</span>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-mono">
          {summary.cpm}
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">
          Karakter per menit
        </div>
      </Card>

      <Card className="p-4 bg-white dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Kecepatan (WPM)</span>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
          {summary.wpm}
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">
          Token per menit
        </div>
      </Card>
    </div>
  );
};

// ==========================================
// 4. Result Timeline Chart
// ==========================================
export const ResultTimelineChart: React.FC = () => {
  const { state, actions } = useResultContext();
  const { questions, expandedQuestion, maxDuration } = state;

  return (
    <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base text-zinc-900 dark:text-zinc-100">
            Analisis Kecepatan 10 Soal
          </CardTitle>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Klik baris soal untuk melihat rincian 9 token dan hasil transliterasi
          </p>
        </div>
      </CardHeader>

      <div className="space-y-2.5">
        {questions.map((q, idx) => {
          const isExpanded = expandedQuestion === idx;
          const allTokensCorrect = q.correctCount === q.totalCount;
          const barWidthPercent = Math.max(15, Math.round((q.durationMs / maxDuration) * 100));

          return (
            <div
              key={idx}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 transition-colors"
            >
              <div
                onClick={() => actions.setExpandedQuestion(isExpanded ? null : idx)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-md">
                    #{q.questionNumber}
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200 min-w-[65px]">
                    ⏱ {formatTime(q.durationMs)}
                  </span>

                  {/* Speed Bar Visualizer */}
                  <div className="hidden md:block w-48 bg-zinc-200/80 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        allTokensCorrect
                          ? 'bg-emerald-500'
                          : q.correctCount >= 8
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      )}
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span
                    className={cn(
                      'text-xs font-bold font-mono px-2 py-0.5 rounded-md border',
                      allTokensCorrect
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-800/60'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800/60'
                    )}
                  >
                    {q.correctCount} / {q.totalCount} Benar
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
              </div>

              {/* Expanded Tokens Grid */}
              {isExpanded ? (
                <div className="mt-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pop-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {q.tokens.map((t, tIdx) => (
                      <div
                        key={tIdx}
                        className={cn(
                          'p-2.5 rounded-lg border text-center text-xs overflow-hidden',
                          t.isCorrect
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/50 dark:text-emerald-200'
                            : 'bg-rose-50/70 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800/50 dark:text-rose-200'
                        )}
                      >
                        <div className="font-japanese text-base font-bold whitespace-nowrap truncate" title={t.kanaText}>
                          {t.kanaText}
                        </div>
                        <div className="font-mono text-[11px] truncate mt-0.5 font-semibold">
                          {t.userAnswer || '—'}
                        </div>
                        {!t.isCorrect ? (
                          <div className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                            ✓ {t.expectedRomaji[0]}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ==========================================
// 5. Result Mistakes Review
// ==========================================
export const ResultMistakesReview: React.FC = () => {
  const { state, actions } = useResultContext();
  const { mistakes, hasMistakes, summary } = state;

  return (
    <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          {hasMistakes ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Evaluasi Kesalahan ({mistakes.length} token)</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Sempurna! 100% Akurat Tanpa Kesalahan</span>
            </>
          )}
        </CardTitle>

        {hasMistakes ? (
          <Button
            variant="outline"
            size="sm"
            onClick={actions.retryMistakes}
            className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-950/40 cursor-pointer font-semibold"
          >
            Latih {mistakes.length} Token Ini Saja
          </Button>
        ) : null}
      </CardHeader>

      {hasMistakes ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
          {mistakes.map((m, idx) => (
            <div
              key={idx}
              className="p-3 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl flex items-center justify-between gap-3 shadow-inner"
            >
              <div>
                <span className="font-japanese text-2xl font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap block" title={m.kanaText}>
                  {m.kanaText}
                </span>
                {m.meaning ? (
                  <span className="text-xs text-zinc-500 block truncate max-w-[150px]">{m.meaning}</span>
                ) : null}
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                  Soal #{m.questionIndex} • Token #{m.tokenIndex}
                </span>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="text-rose-600 dark:text-rose-400 line-through">
                  Input: {m.userAnswer}
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Benar: {m.expectedRomaji[0]}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Luar biasa! Seluruh {summary.totalTokens} token kana dijawab dengan benar tanpa ada kesalahan transliterasi Romaji.
        </p>
      )}
    </Card>
  );
};

// ==========================================
// 6. Result Action Buttons
// ==========================================
export const ResultActions: React.FC = () => {
  const { state, actions } = useResultContext();
  const { hasMistakes, isCopied } = state;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
      <Button
        onClick={actions.startSession}
        size="lg"
        className="w-full sm:w-auto px-8 font-bold h-12 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 cursor-pointer"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>Mulai Sesi Baru (10 Soal)</span>
      </Button>

      {hasMistakes ? (
        <Button
          onClick={actions.retryMistakes}
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto px-6 h-12 gap-2 font-bold cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-amber-500" />
          <span>Latih Ulang Token Salah</span>
        </Button>
      ) : null}

      <Button
        onClick={actions.shareScore}
        variant="outline"
        size="lg"
        className="w-full sm:w-auto px-5 h-12 gap-2 font-semibold cursor-pointer"
        title="Salin hasil ringkasan ke clipboard"
      >
        {isCopied ? (
          <>
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Tersalin!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span>Salin Skor</span>
          </>
        )}
      </Button>

      <Button
        onClick={actions.resetSession}
        variant="ghost"
        size="lg"
        className="w-full sm:w-auto px-5 h-12 gap-2 font-semibold cursor-pointer"
      >
        <Home className="w-4 h-4" />
        <span>Menu Utama</span>
      </Button>
    </div>
  );
};

// ==========================================
// 7. Result Compound Export
// ==========================================
export const Result = {
  Root: ResultRoot,
  RankBanner: ResultRankBanner,
  MetricsGrid: ResultMetricsGrid,
  TimelineChart: ResultTimelineChart,
  MistakesReview: ResultMistakesReview,
  Actions: ResultActions,
};
