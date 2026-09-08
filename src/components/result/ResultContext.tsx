import { createContext, useContext } from 'react';
import { QuestionRecord, SessionConfig, SessionRecord, SessionSummary } from '../../types/drill';

export interface PerformanceRank {
  grade: 'S+' | 'S' | 'A' | 'B' | 'C';
  title: string;
  badgeVariant: 'indigo' | 'success' | 'danger' | 'default';
  description: string;
}

export interface MistakeItem {
  questionIndex: number;
  tokenIndex: number;
  kanaText: string;
  meaning?: string;
  userAnswer: string;
  expectedRomaji: string[];
}

export interface ResultState {
  lastCompletedSession: SessionRecord;
  summary: SessionSummary;
  questions: QuestionRecord[];
  config: SessionConfig;
  rank: PerformanceRank;
  mistakes: MistakeItem[];
  hasMistakes: boolean;
  maxStreak: number;
  maxDuration: number;
  expandedQuestion: number | null;
  isCopied: boolean;
}

export interface ResultActions {
  setExpandedQuestion: (idx: number | null) => void;
  startSession: () => void;
  resetSession: () => void;
  retryMistakes: () => void;
  shareScore: () => Promise<void>;
}

export interface ResultContextValue {
  state: ResultState;
  actions: ResultActions;
}

export const ResultContext = createContext<ResultContextValue | null>(null);

export function useResultContext(): ResultContextValue {
  const context = useContext(ResultContext);
  if (!context) {
    throw new Error('useResultContext must be used within a Result.Root / ResultProvider');
  }
  return context;
}
