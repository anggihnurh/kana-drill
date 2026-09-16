import { useDrillStore } from "@/store/useDrillStore";
import { PlayCircle, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

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