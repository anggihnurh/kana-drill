import { cn } from "@/lib/utils";
import { BookOpen, Languages, Play, Type, Users } from "lucide-react";
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
        <div className="flex flex-col items-center gap-2 py-2">

            {/* ─── Tab Switcher: Kotoba / Bun / Kanji ─── */}
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
                            'relative flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none',
                            inputMode === 'kotoba'
                                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                        )}
                    >
                        <Type className="w-3.5 h-3.5 shrink-0" />
                        <span>Kotoba</span>
                        {inputMode === 'kotoba' && (
                            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-0.5 rounded-full bg-zinc-900 dark:bg-white opacity-60" />
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
                            'relative flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none',
                            inputMode === 'bun'
                                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                        )}
                    >
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>Bun</span>
                        {inputMode === 'bun' && (
                            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-0.5 rounded-full bg-zinc-900 dark:bg-white opacity-60" />
                        )}
                    </button>

                    {/* Tab: Kanji */}
                    <button
                        id="tab-kanji"
                        role="tab"
                        aria-selected={inputMode === 'kanji'}
                        aria-controls="tabpanel-kanji"
                        onClick={() => actions.setConfig({ inputMode: 'kanji' })}
                        className={cn(
                            'relative flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none',
                            inputMode === 'kanji'
                                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                        )}
                    >
                        <Languages className="w-3.5 h-3.5 shrink-0" />
                        <span>Kanji</span>
                        {inputMode === 'kanji' && (
                            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-0.5 rounded-full bg-zinc-900 dark:bg-white opacity-60" />
                        )}
                    </button>
                </div>

                {/* Tab description */}
                <p className="mt-2 text-center text-[11px] text-zinc-400 dark:text-zinc-500 font-medium transition-all duration-200">
                    {inputMode === 'kotoba'
                        ? '9 kata per soal • 5 soal • Filter bab tersedia'
                        : inputMode === 'bun'
                            ? '1 kalimat per soal • 5 soal • Ketik romaji kalimat penuh'
                            : '9 kanji per soal • 5 soal • MNN I & II dan Irodori'}
                </p>
            </div>

            {/* ─── Mode Specific Content Container (Kotoba Filter / Bun Info / Kanji Info) ─── */}
            <div className="w-full max-w-sm min-h-[92px] flex flex-col justify-center">
                {inputMode === 'kotoba' && (
                    <div
                        id="tabpanel-kotoba"
                        role="tabpanel"
                        aria-labelledby="tab-kotoba"
                        className="animate-pop-in"
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
                )}

                {inputMode === 'bun' && (
                    <div
                        id="tabpanel-bun"
                        role="tabpanel"
                        aria-labelledby="tab-bun"
                        className="animate-pop-in"
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
                )}

                {inputMode === 'kanji' && (
                    <div
                        id="tabpanel-kanji"
                        role="tabpanel"
                        aria-labelledby="tab-kanji"
                        className="animate-pop-in"
                    >
                        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3.5 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 w-7 h-7 shrink-0 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                    <Languages className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-0.5">Mode Kanji Dasar</p>
                                    <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
                                        Latihan membaca karakter Kanji dasar dari Minna no Nihongo I &amp; II serta Irodori. Ketik bacaan romaji (kun'yomi / on'yomi) untuk setiap kanji.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>



            <Button
                onClick={actions.startSession}
                size="lg"
                className="w-full max-w-sm font-bold h-12 text-base gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 shadow-sm cursor-pointer mt-4"
            >
                <Play className="w-4 h-4 fill-white dark:fill-zinc-900" />
                <span>Mulai Sesi</span>
            </Button>

            <Button
                variant="outline"
                onClick={() => actions.setIsRaceLobbyOpen(true)}
                className="w-full max-w-sm h-11 gap-2 text-sm font-bold cursor-pointer border-emerald-300 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
                <Users className="w-4 h-4" />
                <span>Balapan Multiplayer</span>
            </Button>
        </div>
    );
};


