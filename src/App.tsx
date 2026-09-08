import { useDrillStore } from './store/useDrillStore';
import { useThemeStore } from './store/useThemeStore';
import { SetupScreen } from './components/setup/SetupScreen';
import { DrillScreen } from './components/drill/DrillScreen';
import { ResultScreen } from './components/result/ResultScreen';
import { Moon, Sun } from 'lucide-react';

export function App() {
  const status = useDrillStore((s) => s.status);
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100 flex flex-col justify-between transition-colors duration-200 bg-grid-pattern selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-200">
      {/* Top Navbar */}
      <header className="w-full border-b border-zinc-200/80 bg-white/80 dark:border-zinc-800/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-japanese font-black text-white text-base shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
              あ
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold tracking-tight text-base text-zinc-900 dark:text-zinc-100">
                KanaDrill
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-400 dark:border-zinc-700/60 font-semibold">
                v1.0
              </span>
            </div>
          </div>

          {/* Right Action: Theme toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 transition-all cursor-pointer shadow-sm active:scale-95"
              title={theme === 'light' ? 'Beralih ke Mode Gelap' : 'Beralih ke Mode Terang'}
              aria-label="Toggle tema tampilan"
            >
              {theme === 'light' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Mode Gelap</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 flex flex-col justify-center">
        {status === 'idle' ? (
          <SetupScreen />
        ) : status === 'running' || status === 'paused' ? (
          <DrillScreen />
        ) : status === 'finished' ? (
          <ResultScreen />
        ) : null}
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-zinc-200/80 dark:border-zinc-900/80 py-4 text-center text-xs text-zinc-500 dark:text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>KanaDrill — Japanese Kana Speed & Accuracy Reading Drill</span>
          <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-600">
            JLPT N5-N4 Speed Trainer
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
