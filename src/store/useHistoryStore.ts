import { create } from 'zustand';
import { SessionRecord } from '../types/drill';

const STORAGE_KEY = 'kana_drill_history_v1';

export interface LifetimeStats {
  totalSessions: number;
  totalTimeMs: number;
  totalTokens: number;
  totalCorrect: number;
  avgCpm: number;
  avgAccuracy: number;
  bestCpm: number;
  bestAccuracy: number;
}

interface HistoryState {
  records: SessionRecord[];
  addRecord: (record: SessionRecord) => void;
  clearHistory: () => void;
  getBestRecord: () => SessionRecord | null;
  getLifetimeStats: () => LifetimeStats;
}

function loadHistoryFromStorage(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as SessionRecord[];
    }
    return [];
  } catch (e) {
    console.error('Gagal memuat riwayat sesi dari localStorage', e);
    return [];
  }
}

function saveHistoryToStorage(records: SessionRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Gagal menyimpan riwayat ke localStorage', e);
  }
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  records: loadHistoryFromStorage(),

  addRecord: (record: SessionRecord) => {
    const updated = [record, ...get().records];
    // Batasi maksimum 50 sesi terakhir agar hemat storage
    const trimmed = updated.slice(0, 50);
    saveHistoryToStorage(trimmed);
    set({ records: trimmed });
  },

  clearHistory: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Safe fallback
    }
    set({ records: [] });
  },

  /**
   * O(N) single-pass best record lookup (js-min-max-loop)
   * Menggantikan sort O(N log N)
   */
  getBestRecord: () => {
    const records = get().records;
    if (records.length === 0) return null;

    return records.reduce((best, curr) => {
      if (!best) return curr;
      return curr.summary.cpm > best.summary.cpm ? curr : best;
    }, records[0]);
  },

  /**
   * O(N) single-pass lifetime statistics calculation
   */
  getLifetimeStats: (): LifetimeStats => {
    const records = get().records;
    if (records.length === 0) {
      return {
        totalSessions: 0,
        totalTimeMs: 0,
        totalTokens: 0,
        totalCorrect: 0,
        avgCpm: 0,
        avgAccuracy: 0,
        bestCpm: 0,
        bestAccuracy: 0,
      };
    }

    let totalTimeMs = 0;
    let totalTokens = 0;
    let totalCorrect = 0;
    let sumCpm = 0;
    let sumAcc = 0;
    let bestCpm = 0;
    let bestAccuracy = 0;

    for (let i = 0; i < records.length; i++) {
      const s = records[i].summary;
      totalTimeMs += s.totalDurationMs;
      totalTokens += s.totalTokens;
      totalCorrect += s.correctTokens;
      sumCpm += s.cpm;
      sumAcc += s.accuracyPercentage;
      if (s.cpm > bestCpm) bestCpm = s.cpm;
      if (s.accuracyPercentage > bestAccuracy) bestAccuracy = s.accuracyPercentage;
    }

    const totalSessions = records.length;

    return {
      totalSessions,
      totalTimeMs,
      totalTokens,
      totalCorrect,
      avgCpm: Math.round((sumCpm / totalSessions) * 10) / 10,
      avgAccuracy: Math.round((sumAcc / totalSessions) * 10) / 10,
      bestCpm,
      bestAccuracy,
    };
  },
}));
