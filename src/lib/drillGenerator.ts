import {
  Question,
  SessionConfig,
  TokenItem,
  VocabEntry,
} from '../types/drill';
import { VOCAB_DATABASE } from '../data/vocabDatabase';

/**
 * Pre-indexed maps for O(1) vocab retrieval by script
 * (Vercel Best Practice: js-index-maps & js-set-map-lookups)
 */
const VOCAB_BY_SCRIPT = {
  hiragana: VOCAB_DATABASE.filter((v) => v.script === 'hiragana' || v.script === 'mixed'),
  katakana: VOCAB_DATABASE.filter((v) => v.script === 'katakana' || v.script === 'mixed'),
  both: VOCAB_DATABASE,
};

/**
 * Fast unbiased Fisher-Yates array shuffle (O(N))
 */
function shuffleArray<T>(arr: readonly T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

function getVocabToken(vocab: VocabEntry, id: string): TokenItem {
  return {
    id,
    kanaText: vocab.kana,
    meaning: vocab.meaning,
    script: vocab.script,
    expectedRomaji: vocab.validRomaji,
  };
}

/**
 * Generator Utama Sesi Drill Menggunakan Kosakata Penuh Minna no Nihongo (Bab 1 - 50)
 * Setiap soal berisi 9 token kosakata (total 5 soal x 9 token = 45 token)
 */
export function generateSessionQuestions(config: SessionConfig): Question[] {
  const availablePool = VOCAB_BY_SCRIPT[config.script] || VOCAB_DATABASE;
  const vocabPool = availablePool.length > 0 ? availablePool : VOCAB_DATABASE;

  const TOTAL_QUESTIONS = 5;
  const TOKENS_PER_QUESTION = 9;
  const TOTAL_TOKENS_NEEDED = TOTAL_QUESTIONS * TOKENS_PER_QUESTION; // 45 tokens

  const shuffledVocab = shuffleArray(vocabPool);
  const allTokens: TokenItem[] = [];

  for (let i = 0; i < TOTAL_TOKENS_NEEDED; i++) {
    const vocab = shuffledVocab[i % shuffledVocab.length];
    const tokenId = `tok_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`;
    allTokens.push(getVocabToken(vocab, tokenId));
  }

  const questions: Question[] = [];
  for (let q = 0; q < TOTAL_QUESTIONS; q++) {
    const sliceStart = q * TOKENS_PER_QUESTION;
    const questionTokens = allTokens.slice(
      sliceStart,
      sliceStart + TOKENS_PER_QUESTION
    );

    questions.push({
      questionNumber: q + 1,
      tokens: questionTokens,
      durationMs: 0,
      isCompleted: false,
    });
  }

  return questions;
}
