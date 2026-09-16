import { Award, Layers, Sparkles } from "lucide-react";
import { Badge } from '../ui/badge';
import { useSetupContext } from "./SetupContext";

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