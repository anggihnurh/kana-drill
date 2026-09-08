export type KanaCategory =
  | 'gojuuon'
  | 'dakuon'
  | 'handakuon'
  | 'youon'
  | 'sokuon'
  | 'chouon'
  | 'tokushuon';

export type KanaScript = 'hiragana' | 'katakana' | 'both';

export type DrillMode = 'random' | 'vocab' | 'hybrid';

export interface KanaEntry {
  id: string;
  script: 'hiragana' | 'katakana';
  category: KanaCategory;
  character: string;
  romaji: string[];
  length: number;
}

export interface VocabEntry {
  id: string;
  kana: string;
  script: 'hiragana' | 'katakana' | 'mixed';
  length: number;
  meaning: string;
  validRomaji: string[];
}

export interface TokenItem {
  id: string;
  kanaText: string;
  meaning?: string;
  script: 'hiragana' | 'katakana' | 'mixed';
  expectedRomaji: string[];
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface Question {
  questionNumber: number; // 1 s.d. 10
  tokens: TokenItem[]; // 10 tokens per question
  durationMs: number;
  isCompleted: boolean;
}

export interface SessionConfig {
  script: KanaScript;
  mode: DrillMode;
  categories: KanaCategory[];
  soundEnabled: boolean;
}

export interface SessionSummary {
  totalDurationMs: number;
  averageDurationPerQuestionMs: number;
  totalTokens: number;
  correctTokens: number;
  accuracyPercentage: number;
  cpm: number;
  wpm: number;
}

export interface QuestionRecord {
  questionNumber: number;
  durationMs: number;
  correctCount: number;
  totalCount: number;
  tokens: TokenItem[];
}

export interface SessionRecord {
  sessionId: string;
  timestamp: string;
  config: SessionConfig;
  summary: SessionSummary;
  questions: QuestionRecord[];
}
