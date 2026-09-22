import { cn } from "@/lib/utils";
import { BookOpen, History, Play, Type, Users } from "lucide-react";
import { Button } from "../ui/button";
import { useSetupContext } from "./SetupContext";

export const SetupSessionOverview: React.FC = () => {
    const { actions, state } = useSetupContext();
    const config = state.config;
    const inputMode = config.inputMode ?? 'kotoba';

    const handleAllChaptersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        actions.setConfig({ allChapters: e.target.checked });
    };

    const handleChapterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = 1;
        if (val < 1) val = 1;
        if (val > 50) val = 50;
        actions.setConfig({ selectedChapter: val });
    };

    return (
        <div className="flex flex-col items-center gap-3.5 py-2">

            {/* ─── Tab Switcher: Kotoba / Bun ─── */}
            <div className="w-full max-w-sm">
                <div
                    role="tablist"
                    aria-label="Mode Drill"
                    className="flex w-full rounded-2xl border border-zinc-200 bg-zinc-100/80 p-1 dark:border-zinc-800 dark:bg-zinc-900/70 shadow-sm gap-1"
                >
                    {/* Tab: Kotoba */}
                    <button
                        id="tab-kotoba"
                        role="tab"
                        aria-selected={inputMode === 'kotoba'}
                        aria-controls="tabpanel-kotoba"
                        onClick={() => actions.setConfig({ inputMode: 'kotoba' })}
                        className={cn(
                            'relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer select-none',
                            inputMode === 'kotoba'
                                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                        )}
                    >
                        <Type className="w-3.5 h-3.5 shrink-0" />
                        <span>Kotoba</span>
                        {inputMode === 'kotoba' && (
                            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-zinc-900 dark:bg-white opacity-60" />
                        )}
                    </button>

                    {/* Tab: Bun */}
                    <button
                        id="tab-bun"
                        role="tab"
                        aria-selected={inputMode === 'bun'}
                        aria-controls="tabpanel-bun"
                        onClick={() => actions.setConfig({ inputMode: 'bun' })}
                        className={cn(
                            'relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer select-none',
                            inputMode === 'bun'
                                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                        )}
                    >
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>Bun</span>
                        {inputMode === 'bun' && (
                            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-zinc-900 dark:bg-white opacity-60" />
                        )}
                    </button>
                </div>

                {/* Tab description */}
                <p className="mt-2 text-center text-[11px] text-zinc-400 dark:text-zinc-500 font-medium transition-all duration-200">
                    {inputMode === 'kotoba'
                        ? '9 kata per soal • 5 soal • Filter bab tersedia'
                        : '1 kalimat per soal • 5 soal • Ketik romaji kalimat penuh'}
                </p>
            </div>

            {/* ─── Filter Bab (Kotoba only) ─── */}
            <div
                id="tabpanel-kotoba"
                role="tabpanel"
                aria-labelledby="tab-kotoba"
                className={cn(
                    'w-full max-w-sm overflow-hidden transition-all duration-300 ease-in-out',
                    inputMode === 'kotoba'
                        ? 'max-h-40 opacity-100 translate-y-0'
                        : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'
                )}
            >
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 transition-colors">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2.5">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">Pilih Bab</span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-500 font-mono">Minna no Nihongo</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        {/* Checkbox "Semua" */}
                        <label className="flex items-center gap-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                id="all-chapters-checkbox"
                                checked={config.allChapters ?? true}
                                onChange={handleAllChaptersChange}
                                className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-white cursor-pointer accent-zinc-900 dark:accent-white"
                            />
                            <span className="font-semibold">Semua (Bab 1 - 50)</span>
                        </label>

                        {/* Input Number Bab 1-50 */}
                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="chapter-number-input"
                                className={cn(
                                    'text-xs font-semibold transition-colors',
                                    config.allChapters
                                        ? 'text-zinc-400 dark:text-zinc-600'
                                        : 'text-zinc-700 dark:text-zinc-300'
                                )}
                            >
                                Bab:
                            </label>
                            <input
                                id="chapter-number-input"
                                type="number"
                                min={1}
                                max={50}
                                value={config.selectedChapter ?? 1}
                                disabled={config.allChapters ?? true}
                                onChange={handleChapterChange}
                                className={cn(
                                    'w-16 h-9 rounded-lg border text-center font-mono font-bold text-sm transition-all outline-none',
                                    config.allChapters
                                        ? 'border-zinc-200 bg-zinc-100/70 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-600 cursor-not-allowed'
                                        : 'border-zinc-300 bg-white text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-white dark:focus:ring-white shadow-sm'
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Info panel mode Bun ─── */}
            <div
                id="tabpanel-bun"
                role="tabpanel"
                aria-labelledby="tab-bun"
                className={cn(
                    'w-full max-w-sm overflow-hidden transition-all duration-300 ease-in-out',
                    inputMode === 'bun'
                        ? 'max-h-40 opacity-100 translate-y-0'
                        : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'
                )}
            >
                <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/60 p-3.5 shadow-sm dark:border-indigo-900/60 dark:bg-indigo-950/20 transition-colors">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-7 h-7 shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-0.5">Mode Kalimat Penuh</p>
                            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed">
                                Latihan mengetik kalimat lengkap dari Minna no Nihongo. Ketikkan romaji kalimat satu per satu, karakter demi karakter.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
                className="w-full max-w-sm h-11 gap-2 text-sm font-bold cursor-pointer border-emerald-300 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
                <Users className="w-4 h-4" />
                <span>Balapan Multiplayer Realtime</span>
            </Button>

            <Button
                variant="secondary"
                onClick={() => actions.setIsHistoryOpen(true)}
                className="w-full max-w-sm h-10 gap-2 text-xs font-semibold cursor-pointer"
            >
                <History className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Riwayat &amp; Statistik</span>
            </Button>
        </div>
    );
};

