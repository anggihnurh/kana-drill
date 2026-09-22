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

/** Mode input drill: per-kata (kotoba), per-kalimat utuh (bun), atau kanji dasar (kanji) */
export type DrillInputMode = 'kotoba' | 'bun' | 'kanji';

/** Entri kanji untuk mode Kanji Dasar (MNN I & II + Irodori) */
export interface KanjiEntry {
  id: string;
  /** Karakter kanji tunggal atau senyawa dasar */
  kanji: string;
  /** Pembacaan on'yomi dalam katakana */
  onyomi?: string[];
  /** Pembacaan kun'yomi dalam hiragana */
  kunyomi?: string[];
  /** Arti dalam bahasa Indonesia */
  meaning: string;
  /** Daftar romaji & kana yang diterima */
  validRomaji: string[];
  /** Kategori tema kanji */
  category?: string;
  /** Sumber kurikulum kanji */
  source?: 'mnn1' | 'mnn2' | 'irodori' | 'both';
}

/** Entri kalimat untuk mode Bun */
export interface SentenceEntry {
  id: string;
  /** Teks kalimat dalam kana (hiragana/katakana/campuran) */
  kana: string;
  /** Arti kalimat dalam bahasa Indonesia */
  meaning: string;
  /** Daftar romaji yang diterima (tanpa spasi, lowercase) */
  validRomaji: string[];
  /** Nomor bab MNN asal kalimat */
  chapter: number;
}

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
  allChapters: boolean;
  selectedChapter: number;
  /** Mode drill: 'kotoba' (per kata, default) atau 'bun' (per kalimat utuh) */
  inputMode: DrillInputMode;
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
