import {
  Question,
  SessionConfig,
  TokenItem,
  VocabEntry,
} from '../types/drill';
import { VOCAB_DATABASE } from '../data/vocabDatabase';

/**
 * Mendapatkan nomor bab dari entri kosakata (Bab 1 - 50)
 */
export function getVocabChapter(vocab: VocabEntry): number | null {
  const idMatch = vocab.id.match(/^mnn_b(\d+)_/);
  if (idMatch) return parseInt(idMatch[1], 10);
  const meaningMatch = vocab.meaning.match(/\(Bab\s*(\d+)\)/i);
  if (meaningMatch) return parseInt(meaningMatch[1], 10);
  return null;
}

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
 * Filter pool kosakata berdasarkan bab dan skrip
 */
export function getFilteredVocab(config: SessionConfig): VocabEntry[] {
  let pool = VOCAB_DATABASE;

  // Filter berdasarkan bab jika checkbox "Semua" bernilai false
  if (!config.allChapters && config.selectedChapter) {
    const chapterTarget = Number(config.selectedChapter);
    const chapterMatches = VOCAB_DATABASE.filter(
      (v) => getVocabChapter(v) === chapterTarget
    );
    if (chapterMatches.length > 0) {
      pool = chapterMatches;
    }
  }

  // Filter berdasarkan skrip jika bukan 'both'
  if (config.script && config.script !== 'both') {
    const scriptMatches = pool.filter(
      (v) => v.script === config.script || v.script === 'mixed'
    );
    if (scriptMatches.length > 0) {
      pool = scriptMatches;
    }
  }

  return pool.length > 0 ? pool : VOCAB_DATABASE;
}

/**
 * Generator Utama Sesi Drill Menggunakan Kosakata Minna no Nihongo (Bab 1 - 50)
 * Menghasilkan 5 Soal x 9 Token = 45 Token per sesi.
 * Menjamin tidak ada token yang sama dalam satu soal, dengan pengulangan token yang berbeda antar-soal.
 */
export function generateSessionQuestions(config: SessionConfig): Question[] {
  const pool = getFilteredVocab(config);
  const TOTAL_QUESTIONS = 5;
  const TOKENS_PER_QUESTION = 9;

  const questions: Question[] = [];
  let currentDeck: VocabEntry[] = [];

  for (let q = 0; q < TOTAL_QUESTIONS; q++) {
    const questionVocab: VocabEntry[] = [];
    const usedIdsInQuestion = new Set<string>();

    while (questionVocab.length < TOKENS_PER_QUESTION) {
      if (currentDeck.length === 0) {
        currentDeck = shuffleArray(pool);
      }

      const candidateIndex = currentDeck.findIndex(
        (item) => !usedIdsInQuestion.has(item.id)
      );

      if (candidateIndex !== -1) {
        const [chosen] = currentDeck.splice(candidateIndex, 1);
        usedIdsInQuestion.add(chosen.id);
        questionVocab.push(chosen);
      } else {
        // Isi ulang deck dengan acakan baru dari pool
        currentDeck = shuffleArray(pool);

        // Penanganan jika total kosakata unik pada pool < 9
        if (pool.length < TOKENS_PER_QUESTION) {
          const fallback = currentDeck.pop()!;
          questionVocab.push(fallback);
        }
      }
    }

    const questionTokens: TokenItem[] = questionVocab.map((vocab, i) =>
      getVocabToken(
        vocab,
        `tok_${Date.now()}_q${q}_${i}_${Math.random().toString(36).slice(2, 6)}`
      )
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
