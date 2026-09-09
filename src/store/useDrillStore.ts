import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Question,
  QuestionRecord,
  SessionConfig,
  SessionRecord,
  SessionSummary,
} from '../types/drill';
import { generateSessionQuestions } from '../lib/drillGenerator';
import { isRomajiMatch } from '../lib/romajiValidator';
import { playSound } from '../lib/soundEffects';
import { useHistoryStore } from './useHistoryStore';

const SAVED_SESSION_KEY = 'kana_drill_session_v1';

interface DrillState {
  status: 'idle' | 'running' | 'paused' | 'finished';
  config: SessionConfig;
  questions: Question[];
  currentQuestionIndex: number;
  activeTokenIndex: number;
  currentInput: string;
  isInputErrorShake: boolean;
  streak: number;
  maxStreak: number;
  lastCompletedSession: SessionRecord | null;

  // Derived
  hasSavedSession: boolean;

  // Actions
  setConfig: (config: Partial<SessionConfig>) => void;
  startSession: (customConfig?: Partial<SessionConfig>) => void;
  setInput: (value: string) => void;
  submitCurrentToken: (overrideValue?: string) => void;
  selectToken: (index: number) => void;
  nextQuestion: (durationMs: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  resetSession: () => void;
  retryMistakes: () => void;
  clearSavedSession: () => void;
}

export const DEFAULT_CONFIG: SessionConfig = {
  script: 'both',
  mode: 'hybrid',
  inputMode: 'text',
  categories: ['gojuuon', 'dakuon', 'handakuon', 'youon', 'sokuon', 'chouon', 'tokushuon'],
  soundEnabled: true,
};

export const useDrillStore = create<DrillState>()(
  persist(
    (set, get) => ({
  status: 'idle',
  config: DEFAULT_CONFIG,
  questions: [],
  currentQuestionIndex: 0,
  activeTokenIndex: 0,
  currentInput: '',
  isInputErrorShake: false,
  streak: 0,
  maxStreak: 0,
  lastCompletedSession: null,
  hasSavedSession: false,

  setConfig: (partial) => {
    set((state) => ({
      config: { ...state.config, ...partial },
    }));
  },

  startSession: (customConfig) => {
    const finalConfig = {
      ...get().config,
      ...(customConfig || {}),
    };

    const questions = generateSessionQuestions(finalConfig);

    set({
      status: 'running',
      config: finalConfig,
      questions,
      currentQuestionIndex: 0,
      activeTokenIndex: 0,
      currentInput: '',
      isInputErrorShake: false,
      streak: 0,
      maxStreak: 0,
      hasSavedSession: false,
    });
  },

  setInput: (value: string) => {
    set({ currentInput: value, isInputErrorShake: false });
  },

  selectToken: (index: number) => {
    const state = get();
    if (state.status !== 'running') return;
    const currentQ = state.questions[state.currentQuestionIndex];
    if (!currentQ || index < 0 || index >= currentQ.tokens.length) return;

    const targetToken = currentQ.tokens[index];
    set({
      activeTokenIndex: index,
      currentInput: targetToken.userAnswer || '',
      isInputErrorShake: false,
    });
  },

  submitCurrentToken: (overrideValue?: string) => {
    const state = get();
    if (state.status !== 'running') return;

    const currentQ = state.questions[state.currentQuestionIndex];
    if (!currentQ) return;

    const currentToken = currentQ.tokens[state.activeTokenIndex];
    if (!currentToken) return;

    const inputVal = (overrideValue !== undefined ? overrideValue : state.currentInput).trim();
    if (!inputVal) return;

    const isCorrect = isRomajiMatch(
      inputVal,
      currentToken.expectedRomaji,
      currentToken.kanaText
    );

    // Audio & Streak feedback
    const currentStreak = isCorrect ? state.streak + 1 : 0;
    const newMaxStreak = Math.max(state.maxStreak, currentStreak);

    if (isCorrect) {
      if (currentStreak >= 3 && currentStreak % 3 === 0) {
        playSound('combo', state.config.soundEnabled);
      } else {
        playSound('correct', state.config.soundEnabled);
      }
    } else {
      playSound('wrong', state.config.soundEnabled);
    }

    // Update token immutably
    const updatedTokens = [...currentQ.tokens];
    updatedTokens[state.activeTokenIndex] = {
      ...currentToken,
      userAnswer: inputVal,
      isCorrect,
    };

    const updatedQuestions = [...state.questions];
    updatedQuestions[state.currentQuestionIndex] = {
      ...currentQ,
      tokens: updatedTokens,
    };

    // Cari token berikutnya yang belum dijawab
    let nextIndex = state.activeTokenIndex + 1;
    const tokenCount = currentQ.tokens.length;
    if (nextIndex < tokenCount && updatedTokens[nextIndex].userAnswer !== undefined) {
      const firstUnanswered = updatedTokens.findIndex((t) => t.userAnswer === undefined);
      if (firstUnanswered !== -1) {
        nextIndex = firstUnanswered;
      }
    }

    if (nextIndex < tokenCount) {
      set({
        questions: updatedQuestions,
        activeTokenIndex: nextIndex,
        currentInput: updatedTokens[nextIndex]?.userAnswer || '',
        isInputErrorShake: !isCorrect,
        streak: currentStreak,
        maxStreak: newMaxStreak,
      });
    } else {
      set({
        questions: updatedQuestions,
        isInputErrorShake: !isCorrect,
        streak: currentStreak,
        maxStreak: newMaxStreak,
      });
    }
  },

  nextQuestion: (durationMs: number) => {
    const state = get();
    if (state.status !== 'running') return;

    const currentQ = state.questions[state.currentQuestionIndex];
    if (!currentQ) return;

    // Jika ada input aktif yang belum di-submit saat klik selanjutnya
    let updatedTokens = [...currentQ.tokens];
    const activeToken = updatedTokens[state.activeTokenIndex];
    const inputVal = state.currentInput.trim();

    if (inputVal && activeToken.userAnswer === undefined) {
      const isCorrect = isRomajiMatch(
        inputVal,
        activeToken.expectedRomaji,
        activeToken.kanaText
      );
      updatedTokens[state.activeTokenIndex] = {
        ...activeToken,
        userAnswer: inputVal,
        isCorrect,
      };
    }

    // Token yang tidak dijawab ditandai salah
    updatedTokens = updatedTokens.map((t) => ({
      ...t,
      userAnswer: t.userAnswer ?? '',
      isCorrect: t.isCorrect ?? false,
    }));

    const updatedQuestions = [...state.questions];
    updatedQuestions[state.currentQuestionIndex] = {
      ...currentQ,
      tokens: updatedTokens,
      durationMs: Math.max(durationMs, 500),
      isCompleted: true,
    };

    const isLastQuestion = state.currentQuestionIndex >= state.questions.length - 1;

    if (!isLastQuestion) {
      playSound('next', state.config.soundEnabled);
      set({
        questions: updatedQuestions,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        activeTokenIndex: 0,
        currentInput: '',
        isInputErrorShake: false,
      });
    } else {
      // Selesai seluruh 10 soal!
      playSound('complete', state.config.soundEnabled);

      // Hitung metrik ringkasan (Single-pass iteration)
      let totalDuration = 0;
      let totalTokens = 0;
      let correctTokens = 0;
      let totalCharactersRead = 0;

      const questionRecords: QuestionRecord[] = new Array(updatedQuestions.length);

      for (let i = 0; i < updatedQuestions.length; i++) {
        const q = updatedQuestions[i];
        totalDuration += q.durationMs;
        let qCorrect = 0;

        for (let t = 0; t < q.tokens.length; t++) {
          const tok = q.tokens[t];
          if (tok.isCorrect) qCorrect++;
          totalCharactersRead += tok.kanaText.length;
        }

        correctTokens += qCorrect;
        totalTokens += q.tokens.length;

        questionRecords[i] = {
          questionNumber: q.questionNumber,
          durationMs: q.durationMs,
          correctCount: qCorrect,
          totalCount: q.tokens.length,
          tokens: q.tokens,
        };
      }

      const accuracy = totalTokens > 0 ? (correctTokens / totalTokens) * 100 : 0;
      const durationInMinutes = totalDuration / 60000;
      const cpm =
        durationInMinutes > 0
          ? Math.round((totalCharactersRead / durationInMinutes) * 10) / 10
          : 0;
      const wpm =
        durationInMinutes > 0
          ? Math.round((correctTokens / durationInMinutes) * 10) / 10
          : 0;

      const summary: SessionSummary = {
        totalDurationMs: totalDuration,
        averageDurationPerQuestionMs: Math.round(totalDuration / Math.max(1, updatedQuestions.length)),
        totalTokens,
        correctTokens,
        accuracyPercentage: Math.round(accuracy * 10) / 10,
        cpm,
        wpm,
      };

      const sessionRecord: SessionRecord = {
        sessionId: `ses_${Date.now()}`,
        timestamp: new Date().toISOString(),
        config: state.config,
        summary,
        questions: questionRecords,
      };

      // Simpan ke history store (localStorage)
      useHistoryStore.getState().addRecord(sessionRecord);

      // Dynamic import confetti (Vercel Best Practice: bundle-dynamic-imports)
      import('canvas-confetti')
        .then(({ default: confetti }) => {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
          });
        })
        .catch(() => {
          // Graceful fallback
        });

      // Hapus sesi tersimpan karena sudah selesai
      try {
        localStorage.removeItem(SAVED_SESSION_KEY);
      } catch {
        // safe fallback
      }

      set({
        questions: updatedQuestions,
        status: 'finished',
        lastCompletedSession: sessionRecord,
        currentInput: '',
        hasSavedSession: false,
      });
    }
  },

  pauseSession: () => {
    if (get().status === 'running') {
      set({ status: 'paused', hasSavedSession: true });
    }
  },

  resumeSession: () => {
    if (get().status === 'paused') {
      set({ status: 'running' });
    }
  },

  resetSession: () => {
    try {
      localStorage.removeItem(SAVED_SESSION_KEY);
    } catch {
      // safe fallback
    }
    set({
      status: 'idle',
      questions: [],
      currentQuestionIndex: 0,
      activeTokenIndex: 0,
      currentInput: '',
      isInputErrorShake: false,
      streak: 0,
      maxStreak: 0,
      lastCompletedSession: null,
      hasSavedSession: false,
    });
  },

  clearSavedSession: () => {
    try {
      localStorage.removeItem(SAVED_SESSION_KEY);
    } catch {
      // safe fallback
    }
    set({ hasSavedSession: false });
  },

  retryMistakes: () => {
    const session = get().lastCompletedSession;
    if (!session) return;

    // Kumpulkan seluruh token yang salah dijawab
    const mistakeTokens: typeof session.questions[0]['tokens'] = [];
    for (let q = 0; q < session.questions.length; q++) {
      const qTokens = session.questions[q].tokens;
      for (let t = 0; t < qTokens.length; t++) {
        if (!qTokens[t].isCorrect) {
          mistakeTokens.push({
            ...qTokens[t],
            id: `retry_${Date.now()}_${q}_${t}`,
            userAnswer: undefined,
            isCorrect: undefined,
          });
        }
      }
    }

    if (mistakeTokens.length === 0) return;

    const totalQuestions = session.questions.length || 10;
    const tokensPerQuestion = session.questions[0]?.tokens.length || 9;
    const totalNeeded = totalQuestions * tokensPerQuestion;

    // Buat token dari token yang salah (diulang jika kurang)
    const newTokens: typeof mistakeTokens = [];
    while (newTokens.length < totalNeeded) {
      for (let i = 0; i < mistakeTokens.length; i++) {
        if (newTokens.length < totalNeeded) {
          newTokens.push({
            ...mistakeTokens[i],
            id: `retry_${Date.now()}_${newTokens.length}`,
            userAnswer: undefined,
            isCorrect: undefined,
          });
        }
      }
    }

    const questions: Question[] = [];
    for (let q = 0; q < totalQuestions; q++) {
      questions.push({
        questionNumber: q + 1,
        tokens: newTokens.slice(q * tokensPerQuestion, q * tokensPerQuestion + tokensPerQuestion),
        durationMs: 0,
        isCompleted: false,
      });
    }

    set({
      status: 'running',
      questions,
      currentQuestionIndex: 0,
      activeTokenIndex: 0,
      currentInput: '',
      isInputErrorShake: false,
      streak: 0,
      maxStreak: 0,
      hasSavedSession: false,
    });
  },
}),
  {
    name: SAVED_SESSION_KEY,
    storage: createJSONStorage(() => localStorage),
    // Only persist session-critical fields — skip ephemeral UI state
    partialize: (state) => ({
      status: state.status === 'finished' ? 'idle' : state.status,
      config: state.config,
      questions: state.status === 'idle' || state.status === 'finished' ? [] : state.questions,
      currentQuestionIndex: state.currentQuestionIndex,
      activeTokenIndex: state.activeTokenIndex,
      streak: state.streak,
      maxStreak: state.maxStreak,
      hasSavedSession: state.hasSavedSession,
    }),
    // Normalize running -> paused on hydration so session resumes in controlled state
    onRehydrateStorage: () => (state) => {
      if (state && state.status === 'running') {
        state.status = 'paused';
        state.hasSavedSession = true;
      }
      if (state && state.status === 'paused' && state.questions.length > 0) {
        state.hasSavedSession = true;
      }
    },
  }
));
