import React, { createContext, useContext } from 'react';
import { Question, TokenItem } from '../../types/drill';

export interface DrillState {
  currentQuestion: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  activeTokenIndex: number;
  currentInput: string;
  isInputErrorShake: boolean;
  streak: number;
  maxStreak: number;
  answeredCount: number;
  isAllAnswered: boolean;
  isLastQuestion: boolean;
  isPaused: boolean;
  isRunning: boolean;
  currentQ: Question | undefined;
  tokens: TokenItem[];
  currentToken: TokenItem | undefined;
  cmdKeyText: string;
  soundEnabled: boolean;
}

export interface DrillActions {
  setInput: (value: string) => void;
  submitCurrentToken: () => void;
  selectToken: (index: number) => void;
  nextQuestion: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  resetSession: () => void;
  toggleSound: () => void;
}

export interface DrillMeta {
  inputRef: React.RefObject<HTMLInputElement>;
}

export interface DrillContextValue {
  state: DrillState;
  actions: DrillActions;
  meta: DrillMeta;
}

export const DrillContext = createContext<DrillContextValue | null>(null);

export function useDrillContext(): DrillContextValue {
  const context = useContext(DrillContext);
  if (!context) {
    throw new Error('useDrillContext must be used within a Drill.Root / DrillProvider');
  }
  return context;
}
