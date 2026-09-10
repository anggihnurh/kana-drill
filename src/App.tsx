import { Moon, Sun } from 'lucide-react';
import { DrillScreen } from './components/drill/DrillScreen';
import { ResultScreen } from './components/result/ResultScreen';
import { SetupScreen } from './components/setup/SetupScreen';
import { useDrillStore } from './store/useDrillStore';
import { useThemeStore } from './store/useThemeStore';

export function App() {
  const status = useDrillStore((s) => s.status);
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100 flex flex-col justify-between transition-colors duration-200 bg-grid-pattern selection:bg-zinc-900/10 selection:text-zinc-900 dark:selection:bg-zinc-100/10 dark:selection:text-zinc-100">
      {/* Top Navbar */}
      <header className="w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#09090b] sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo & Brand — shadcn style: hitam/putih solid */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center font-japanese font-black text-white dark:text-zinc-900 text-base shadow-sm ring-1 ring-zinc-900/10 dark:ring-white/10">
              あ
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold tracking-tight text-base text-zinc-900 dark:text-zinc-100">
                KanaDrill
              </span>
            </div>
          </div>

          {/* Right Action: Theme toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-semibold text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 transition-all cursor-pointer shadow-sm active:scale-95"
              title={theme === 'light' ? 'Beralih ke Mode Gelap' : 'Beralih ke Mode Terang'}
              aria-label="Toggle tema tampilan"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="hidden sm:inline">Mode Gelap</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden sm:inline">Mode Terang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-6 flex flex-col justify-center sm:justify-center">
        {status === 'idle' ? (
          <SetupScreen />
        ) : status === 'running' || status === 'paused' ? (
          <DrillScreen />
        ) : status === 'finished' ? (
          <ResultScreen />
        ) : null}
      </main>
    </div>
  );
}

export default App;
