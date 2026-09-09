import {
  Award,
  BookOpen,
  Check,
  Flame,
  History,
  Layers,
  Play,
  PlayCircle,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trash2,
  Zap
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { playSound } from '../../lib/soundEffects';
import { cn } from '../../lib/utils';
import { useDrillStore } from '../../store/useDrillStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { DrillMode, KanaCategory, KanaScript, SessionConfig } from '../../types/drill';
import { HistoryModal } from '../history/HistoryModal';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardDescription, CardTitle } from '../ui/card';
import { SetupContext, SetupContextValue, useSetupContext } from './SetupContext';

interface PresetItem {
  id: string;
  name: string;
  badge: string;
  icon: string;
  desc: string;
  config: Partial<SessionConfig>;
}

const PRESETS: PresetItem[] = [
  {
    id: 'hiragana_basic',
    name: 'Hiragana Dasar',
    badge: 'Pemula',
    icon: 'あ',
    desc: '46 huruf dasar Gojuuon untuk melatih pondasi awal',
    config: {
      script: 'hiragana',
      mode: 'hybrid',
      categories: ['gojuuon'],
    },
  },
  {
    id: 'jlpt_n5',
    name: 'JLPT N5 Core',
    badge: 'Populer',
    icon: '🎌',
    desc: 'Gojuuon, Dakuon & Handakuon dengan kosakata nyata',
    config: {
      script: 'hiragana',
      mode: 'vocab',
      categories: ['gojuuon', 'dakuon', 'handakuon'],
    },
  },
  {
    id: 'katakana_master',
    name: 'Katakana Serapan',
    badge: 'Menengah',
    icon: 'ア',
    desc: 'Katakana, Chouon & Tokushuon serapan asing',
    config: {
      script: 'katakana',
      mode: 'hybrid',
      categories: ['gojuuon', 'dakuon', 'handakuon', 'chouon', 'tokushuon'],
    },
  },
  {
    id: 'full_drill',
    name: 'Master Speed Drill',
    badge: 'Hardcore',
    icon: '👑',
    desc: 'Semua aksara dan 7 kategori kana kombinasi',
    config: {
      script: 'both',
      mode: 'hybrid',
      categories: [
        'gojuuon',
        'dakuon',
        'handakuon',
        'youon',
        'sokuon',
        'chouon',
        'tokushuon',
      ],
    },
  },
];

interface CategoryMeta {
  key: KanaCategory;
  title: string;
  subtitle: string;
  sampleHiragana: string;
  sampleKatakana: string;
}

const CATEGORY_DATA: CategoryMeta[] = [
  {
    key: 'gojuuon',
    title: 'Gojuuon (Dasar)',
    subtitle: '46 huruf dasar vokal & konsonan',
    sampleHiragana: 'あ い う え お',
    sampleKatakana: 'ア イ ウ エ オ',
  },
  {
    key: 'dakuon',
    title: 'Dakuon (Tenten)',
    subtitle: 'Konsonan bersuara g, z, d, b',
    sampleHiragana: 'が ざ だ ば',
    sampleKatakana: 'ガ ザ ダ バ',
  },
  {
    key: 'handakuon',
    title: 'Handakuon (Maru)',
    subtitle: 'Konsonan semi-suara p',
    sampleHiragana: 'ぱ ぴ ぷ ぺ ぽ',
    sampleKatakana: 'パ ピ プ ペ ポ',
  },
  {
    key: 'youon',
    title: 'Youon (Kombinasi)',
    subtitle: 'Kombinasi kana dengan ya, yu, yo kecil',
    sampleHiragana: 'きゃ しゅ ちょ',
    sampleKatakana: 'キャ シュ チョ',
  },
  {
    key: 'sokuon',
    title: 'Sokuon (Konsonan Ganda)',
    subtitle: 'Tanda jeda konsonan rangkap (tsu kecil)',
    sampleHiragana: 'っ (kitte)',
    sampleKatakana: 'ッ (beddo)',
  },
  {
    key: 'chouon',
    title: 'Chouon (Vokal Panjang)',
    subtitle: 'Vokal panjang strip ー atau vokal rangkap',
    sampleHiragana: 'おう / ああ',
    sampleKatakana: 'ー (koohii)',
  },
  {
    key: 'tokushuon',
    title: 'Tokushuon (Serapan Asing)',
    subtitle: 'Kombinasi modern fa, ti, di, ve, we',
    sampleHiragana: '—',
    sampleKatakana: 'ファ ティ ヴェ',
  },
];

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
  const bestRecord = useMemo(() => getBestRecord(), [records, getBestRecord]);

  const applyPreset = useCallback(
    (presetConfig: Partial<SessionConfig>) => {
      playSound('click', config.soundEnabled);
      setConfig(presetConfig);
    },
    [config.soundEnabled, setConfig]
  );

  const selectScript = useCallback(
    (script: KanaScript) => {
      playSound('click', config.soundEnabled);
      setConfig({ script });
    },
    [config.soundEnabled, setConfig]
  );

  const selectMode = useCallback(
    (mode: DrillMode) => {
      playSound('click', config.soundEnabled);
      setConfig({ mode });
    },
    [config.soundEnabled, setConfig]
  );

  const selectInputMode = useCallback(
    (inputMode: 'text' | 'voice') => {
      playSound('click', config.soundEnabled);
      setConfig({ inputMode });
    },
    [config.soundEnabled, setConfig]
  );

  const toggleCategory = useCallback(
    (cat: KanaCategory) => {
      playSound('click', config.soundEnabled);
      const current = config.categories;
      if (current.includes(cat)) {
        if (current.length === 1) return;
        setConfig({ categories: current.filter((c) => c !== cat) });
      } else {
        setConfig({ categories: [...current, cat] });
      }
    },
    [config.categories, config.soundEnabled, setConfig]
  );

  const selectAllCategories = useCallback(() => {
    playSound('click', config.soundEnabled);
    setConfig({
      categories: [
        'gojuuon',
        'dakuon',
        'handakuon',
        'youon',
        'sokuon',
        'chouon',
        'tokushuon',
      ],
    });
  }, [config.soundEnabled, setConfig]);

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
      },
      actions: {
        setConfig,
        startSession,
        applyPreset,
        selectScript,
        selectMode,
        selectInputMode,
        toggleCategory,
        selectAllCategories,
        toggleSound,
        setIsHistoryOpen,
      },
    }),
    [
      config,
      records,
      bestRecord,
      isHistoryOpen,
      setConfig,
      startSession,
      applyPreset,
      selectScript,
      selectMode,
      selectInputMode,
      toggleCategory,
      selectAllCategories,
      toggleSound,
    ]
  );

  return (
    <SetupContext.Provider value={contextValue}>
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 animate-pop-in">
        {children}
        <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
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
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide mb-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Japanese Kana Reflex Trainer</span>
      </div>

      <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center justify-center gap-3">
        <span>Kana</span>
        <span className="text-indigo-600 dark:text-indigo-400">Drill</span>
        <span className="font-japanese text-3xl sm:text-4xl font-normal text-zinc-400 dark:text-zinc-500">
          かな練習
        </span>
      </h1>

      <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
        Latih refleks membaca huruf Hiragana & Katakana dengan cepat, presisi, dan otomatis tanpa mengeja lambat.
      </p>

      {state.records.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <Badge variant="indigo" className="gap-1.5 py-1 px-3 shadow-sm">
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
// 3. Setup Presets
// ==========================================
export const SetupPresets: React.FC = () => {
  const { state, actions } = useSetupContext();

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Preset Latihan Cepat</span>
        </span>
        <span className="text-[11px] text-zinc-400">Pilih konfigurasi siap pakai</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESETS.map((p) => {
          const isMatch =
            state.config.script === p.config.script &&
            state.config.mode === p.config.mode &&
            state.config.categories.length === p.config.categories?.length &&
            p.config.categories?.every((c) => state.config.categories.includes(c));

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => actions.applyPreset(p.config)}
              className={cn(
                'relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md',
                isMatch
                  ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/50 dark:bg-indigo-950/40 dark:border-indigo-500 text-zinc-900 dark:text-zinc-100'
                  : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-japanese text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {p.icon}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                      isMatch
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    )}
                  >
                    {p.badge}
                  </span>
                </div>
                <div className="font-bold text-sm text-zinc-900 dark:text-white">
                  {p.name}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  {p.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 4. Setup Script Selector
// ==========================================
export const SetupScriptSelector: React.FC = () => {
  const { state, actions } = useSetupContext();

  return (
    <Card className="p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center justify-between">
        <span>1. Jenis Aksara Jepang</span>
        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
          Script
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'hiragana' as KanaScript, label: 'Hiragana', sub: 'あ い う え お' },
          { key: 'katakana' as KanaScript, label: 'Katakana', sub: 'ア イ ウ エ オ' },
          { key: 'both' as KanaScript, label: 'Campuran', sub: 'Hiragana & Katakana' },
        ].map((item) => {
          const isSelected = state.config.script === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => actions.selectScript(item.key)}
              className={cn(
                'p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer',
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 text-zinc-900 ring-2 ring-indigo-500/50 shadow-sm dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-white'
                  : 'border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300 dark:hover:border-zinc-700'
              )}
            >
              <div className="font-bold text-sm flex items-center justify-between">
                <span>{item.label}</span>
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                ) : null}
              </div>
              <div className="font-japanese text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                {item.sub}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

// ==========================================
// 5. Setup Mode Selector
// ==========================================
export const SetupModeSelector: React.FC = () => {
  const { state, actions } = useSetupContext();

  return (
    <Card className="p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center justify-between">
        <span>2. Mode Peracikan Soal</span>
        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
          Content Engine
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            key: 'hybrid' as DrillMode,
            icon: Zap,
            title: 'Campuran (Hybrid)',
            desc: 'Kombinasi kata nyata & suku acak',
          },
          {
            key: 'vocab' as DrillMode,
            icon: BookOpen,
            title: 'Kosakata Nyata',
            desc: 'Kamus kosakata Minna no Nihongo',
          },
          {
            key: 'random' as DrillMode,
            icon: Shuffle,
            title: 'Huruf Acak',
            desc: 'Kombinasi acak melatih refleks murni',
          },
        ].map((m) => {
          const Icon = m.icon;
          const isSelected = state.config.mode === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => actions.selectMode(m.key)}
              className={cn(
                'p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer',
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 text-zinc-900 ring-2 ring-indigo-500/50 shadow-sm dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-white'
                  : 'border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300 dark:hover:border-zinc-700'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 mb-2',
                  isSelected
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-400 dark:text-zinc-500'
                )}
              />
              <div className="font-bold text-sm leading-tight flex items-center justify-between">
                <span>{m.title}</span>
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                ) : null}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                {m.desc}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

// ==========================================
// 6. Setup Category Matrix
// ==========================================
export const SetupCategoryMatrix: React.FC = () => {
  const { state, actions } = useSetupContext();

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          3. Cakupan Kategori Kana ({state.config.categories.length}/7 Aktif)
        </div>
        <button
          type="button"
          onClick={actions.selectAllCategories}
          className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold cursor-pointer"
        >
          Pilih Semua
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CATEGORY_DATA.map((cat) => {
          const isChecked = state.config.categories.includes(cat.key);
          const sampleText =
            state.config.script === 'katakana' ? cat.sampleKatakana : cat.sampleHiragana;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => actions.toggleCategory(cat.key)}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer',
                isChecked
                  ? 'border-indigo-500/80 bg-indigo-50/50 text-zinc-900 dark:border-indigo-500/60 dark:bg-indigo-950/30 dark:text-zinc-100 shadow-sm'
                  : 'border-zinc-200 bg-zinc-50/40 text-zinc-500 hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:text-zinc-500 dark:hover:border-zinc-700/60'
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 mt-0.5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 border transition-colors',
                  isChecked
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900'
                )}
              >
                {isChecked ? '✓' : ''}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
                    {cat.title}
                  </span>
                  <span className="font-japanese text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[90px]">
                    {sampleText}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {cat.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

// ==========================================
// 7. Setup Session Overview & Action
// ==========================================
export const SetupSessionOverview: React.FC = () => {
  const { actions } = useSetupContext();
  // const { isInstallable, promptInstall } = usePWAInstall();

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
      <div>
        <CardTitle className="text-base text-zinc-900 dark:text-zinc-100 mb-1">
          Spesifikasi Sesi Drill
        </CardTitle>
        <CardDescription className="text-xs text-zinc-500">
          Sesi terstandarisasi untuk metrik kecepatan & akurasi
        </CardDescription>

        <div className="space-y-3 mt-4 text-xs text-zinc-700 dark:text-zinc-300">
          <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <span className="text-zinc-500 dark:text-zinc-400">Jumlah Soal</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
              10 Halaman
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <span className="text-zinc-500 dark:text-zinc-400">Unit per Soal</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
              12 Token Kana (4×3 Grid)
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <span className="text-zinc-500 dark:text-zinc-400">Total Pembacaan</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              120 Token Kana
            </span>
          </div>
          {/* <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <span className="text-zinc-500 dark:text-zinc-400">Pengukuran Waktu</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Timer per Soal
            </span>
          </div> */}
        </div>

        {/* Sound toggle with tactile tester */}
        {/* <div className="mt-5 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            {state.config.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            )}
            Efek Suara Ketukan
          </span>
          <button
            type="button"
            onClick={actions.toggleSound}
            className={cn(
              'w-10 h-5.5 rounded-full transition-colors relative cursor-pointer',
              state.config.soundEnabled ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
            )}
            title="Toggle Efek Suara"
          >
            <div
              className={cn(
                'w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform shadow-sm',
                state.config.soundEnabled ? 'right-1' : 'left-1'
              )}
            />
          </button>
        </div> */}

        {/* Mode Menjawab: Text vs Voice */}
        {/* <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <span>Mode Menjawab</span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
              {state.config.inputMode === 'voice' ? '🎙️ Mode Suara' : '⌨️ Mode Teks'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => actions.selectInputMode('text')}
              className={cn(
                'p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer text-center',
                state.config.inputMode === 'text'
                  ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 ring-2 ring-indigo-500/50 shadow-sm dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-white'
                  : 'border-zinc-200 bg-zinc-50/50 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400 dark:hover:border-zinc-700'
              )}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Keyboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Ketik (Teks)</span>
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Ketik Romaji via Keyboard
              </span>
            </button>

            <button
              type="button"
              onClick={() => actions.selectInputMode('voice')}
              className={cn(
                'p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer text-center',
                state.config.inputMode === 'voice'
                  ? 'border-rose-600 bg-rose-50/90 text-rose-950 ring-2 ring-rose-500/50 shadow-sm dark:border-rose-500 dark:bg-rose-950/40 dark:text-white'
                  : 'border-zinc-200 bg-zinc-50/50 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400 dark:hover:border-zinc-700'
              )}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Mic className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Ucapkan (Suara)</span>
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Ucapkan Kana via Mikrofon
              </span>
            </button>
          </div>
        </div> */}
      </div>

      {/* Action buttons */}
      <div className="mt-5 space-y-2.5">
        <Button
          onClick={actions.startSession}
          size="lg"
          className="w-full font-bold h-12 text-base gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Mulai Sesi Drill (10 Soal)</span>
        </Button>

        <div>
          <Button
            variant="secondary"
            onClick={() => actions.setIsHistoryOpen(true)}
            className="w-full h-10 gap-2 text-xs font-semibold cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Riwayat & Statistik</span>
          </Button>
          {/* 
          {isInstallable ? (
            <Button
              variant="outline"
              onClick={promptInstall}
              className="w-full h-10 gap-2 text-xs font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/40 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Pasang Aplikasi (PWA)</span>
            </Button>
          ) : null} */}
        </div>
      </div>
    </Card>
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
  const tokenCount = currentQ?.tokens.length || 12;
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
  Presets: SetupPresets,
  ScriptSelector: SetupScriptSelector,
  ModeSelector: SetupModeSelector,
  CategoryMatrix: SetupCategoryMatrix,
  SessionOverview: SetupSessionOverview,
};
