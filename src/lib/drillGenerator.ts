import {
  KanaCategory,
  KanaEntry,
  KanaScript,
  Question,
  SessionConfig,
  TokenItem,
  VocabEntry,
} from '../types/drill';
import { KANA_DATABASE } from '../data/kanaDatabase';
import { VOCAB_DATABASE } from '../data/vocabDatabase';

/**
 * Pre-indexed maps for O(1) kana and vocab retrieval
 * (Vercel Best Practice: js-index-maps & js-set-map-lookups)
 */
const KANA_BY_SCRIPT = {
  hiragana: KANA_DATABASE.filter((k) => k.script === 'hiragana'),
  katakana: KANA_DATABASE.filter((k) => k.script === 'katakana'),
  both: KANA_DATABASE,
};

const VOCAB_BY_SCRIPT = {
  hiragana: VOCAB_DATABASE.filter((v) => v.script === 'hiragana' || v.script === 'mixed'),
  katakana: VOCAB_DATABASE.filter((v) => v.script === 'katakana' || v.script === 'mixed'),
  both: VOCAB_DATABASE,
};

/**
 * Filter Kana Database berdasarkan skrip dan kategori dengan O(1) Set lookup
 */
function getFilteredKana(script: KanaScript, categories: KanaCategory[]): KanaEntry[] {
  const catSet = new Set(categories);
  const basePool = KANA_BY_SCRIPT[script] || KANA_DATABASE;
  return basePool.filter((k) => catSet.has(k.category));
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

const LENGTH_POOL = [2, 2, 3, 3, 4] as const;

/**
 * Generator token kombinasi huruf acak (2-4 kana)
 */
function generateRandomKanaToken(
  availableKana: KanaEntry[],
  script: KanaScript,
  id: string
): TokenItem {
  const targetLength = LENGTH_POOL[Math.floor(Math.random() * LENGTH_POOL.length)];

  // Pisahkan kana yang bisa berdiri sendiri (bukan sokuon/chouon murni di awal)
  const standAloneKana = availableKana.filter(
    (k) => k.category !== 'sokuon' && k.category !== 'chouon'
  );
  const pool = standAloneKana.length > 0 ? standAloneKana : availableKana;

  const chosenEntries: KanaEntry[] = [];
  let currentLength = 0;

  while (currentLength < targetLength && chosenEntries.length < 4) {
    const rand = pool[Math.floor(Math.random() * pool.length)];
    if (currentLength + rand.length <= targetLength + 1) {
      chosenEntries.push(rand);
      currentLength += rand.length;
    } else {
      break;
    }
  }

  if (chosenEntries.length === 0) {
    const fallback = pool[0] || KANA_DATABASE[0];
    chosenEntries.push(fallback);
  }

  const kanaText = chosenEntries.map((e) => e.character).join('');
  const combinedRomaji: string[] = [];

  const generateCombos = (index: number, currentStr: string) => {
    if (index === chosenEntries.length) {
      combinedRomaji.push(currentStr);
      return;
    }
    const entry = chosenEntries[index];
    for (let i = 0; i < entry.romaji.length; i++) {
      generateCombos(index + 1, currentStr + entry.romaji[i]);
    }
  };
  generateCombos(0, '');

  const resolvedScript =
    script === 'both'
      ? chosenEntries[0].script
      : script;

  return {
    id,
    kanaText,
    script: resolvedScript,
    expectedRomaji: Array.from(new Set(combinedRomaji)),
  };
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
 * Generator Utama Sesi Drill (10 Soal x 10 Token per Soal)
 */
export function generateSessionQuestions(config: SessionConfig): Question[] {
  const filteredKana = getFilteredKana(config.script, config.categories);
  const filteredVocab = VOCAB_BY_SCRIPT[config.script] || VOCAB_DATABASE;

  const TOTAL_QUESTIONS = 10;
  const TOKENS_PER_QUESTION = 10;
  const TOTAL_TOKENS_NEEDED = TOTAL_QUESTIONS * TOKENS_PER_QUESTION; // 100 tokens

  const shuffledVocab = shuffleArray(filteredVocab);
  let vocabIndex = 0;

  const kanaPool = filteredKana.length > 0 ? filteredKana : KANA_DATABASE;
  const allTokens: TokenItem[] = [];

  for (let i = 0; i < TOTAL_TOKENS_NEEDED; i++) {
    const tokenId = `tok_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`;
    let useVocab = false;

    if (config.mode === 'vocab') {
      useVocab = true;
    } else if (config.mode === 'random') {
      useVocab = false;
    } else {
      useVocab = Math.random() < 0.5;
    }

    if (useVocab && shuffledVocab.length > 0) {
      const vocab = shuffledVocab[vocabIndex % shuffledVocab.length];
      vocabIndex++;
      allTokens.push(getVocabToken(vocab, tokenId));
    } else {
      allTokens.push(
        generateRandomKanaToken(
          kanaPool,
          config.script,
          tokenId
        )
      );
    }
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
