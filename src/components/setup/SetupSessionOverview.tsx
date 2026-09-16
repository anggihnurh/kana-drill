import { cn } from "@/lib/utils";
import { History, Play } from "lucide-react";
import { Button } from "../ui/button";
import { useSetupContext } from "./SetupContext";

export const SetupSessionOverview: React.FC = () => {
    const { actions, state } = useSetupContext();
    const config = state.config;

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
            {/* Filter Bab Minna no Nihongo */}
            <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 transition-colors">
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

            <Button
                onClick={actions.startSession}
                size="lg"
                className="w-full max-w-sm font-bold h-12 text-base gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900 shadow-sm cursor-pointer"
            >
                <Play className="w-4 h-4 fill-white dark:fill-zinc-900" />
                <span>Mulai Sesi Drill Solo</span>
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
