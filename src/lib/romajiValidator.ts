/**
 * Romaji Normalizer & Validator
 * Menangani berbagai variasi transliterasi resmi (Hepburn, Kunrei-shiki, Nihon-shiki)
 * serta vokal panjang (macron, hyphen, double vowels) dan input langsung karakter kana.
 *
 * Dioptimalkan dengan Vercel React Best Practices:
 * - js-hoist-regexp: Pola regex di-hoist ke module level.
 * - js-cache-function-results: Hasil komputasi variasi di-cache menggunakan Map.
 * - js-set-map-lookups: Lookup O(1) untuk perbandingan cepat.
 */

// Hoisted RegExp patterns to module scope for optimal performance
const FULLWIDTH_RE = /[\uFF01-\uFF5E]/g;
const WHITESPACE_RE = /[\s_]+/g;

const MACRON_REPLACEMENTS: readonly [RegExp, string][] = [
  [/ā|Â/g, 'aa'],
  [/ī|Î/g, 'ii'],
  [/ū|Û/g, 'uu'],
  [/ē|Ê/g, 'ee'],
  [/ō|Ō/g, 'oo'],
];

const CANONICAL_MAPPINGS: readonly [RegExp, string][] = [
  [/sya/g, 'sha'],
  [/syu/g, 'shu'],
  [/syo/g, 'sho'],
  [/tya/g, 'cha'],
  [/tyu/g, 'chu'],
  [/tyo/g, 'cho'],
  [/zya/g, 'ja'],
  [/zyu/g, 'ju'],
  [/zyo/g, 'jo'],
  [/jya/g, 'ja'],
  [/jyu/g, 'ju'],
  [/jyo/g, 'jo'],
  [/shi/g, 'si'],
];

const VARIATION_SUBS: readonly [RegExp, string][] = [
  [/shi/g, 'si'],
  [/si/g, 'shi'],
  [/chi/g, 'ti'],
  [/ti/g, 'chi'],
  [/tsu/g, 'tu'],
  [/tu/g, 'tsu'],
  [/fu/g, 'hu'],
  [/hu/g, 'fu'],
  [/ji/g, 'zi'],
  [/zi/g, 'ji'],
  [/sha/g, 'sya'],
  [/sya/g, 'sha'],
  [/shu/g, 'syu'],
  [/syu/g, 'shu'],
  [/sho/g, 'syo'],
  [/syo/g, 'sho'],
  [/cha/g, 'tya'],
  [/tya/g, 'cha'],
  [/chu/g, 'tyu'],
  [/tyu/g, 'chu'],
  [/cho/g, 'tyo'],
  [/tyo/g, 'cho'],
  [/ja/g, 'zya'],
  [/zya/g, 'ja'],
  [/ju/g, 'zyu'],
  [/zyu/g, 'ju'],
  [/jo/g, 'zyo'],
  [/zyo/g, 'jo'],
  // Chouon variants
  [/ou/g, 'oo'],
  [/oo/g, 'ou'],
  [/o-/g, 'ou'],
  [/u-/g, 'uu'],
  [/a-/g, 'aa'],
  [/i-/g, 'ii'],
  [/e-/g, 'ee'],
  [/oo/g, 'o-'],
  [/ou/g, 'o-'],
  [/aa/g, 'a-'],
  [/ii/g, 'i-'],
  [/uu/g, 'u-'],
  [/ee/g, 'e-'],
];

// Module-level cache for string variations to avoid repetitive regex runs
const variationCache = new Map<string, Set<string>>();

// Normalisasi karakter fullwidth Latin/angka ke halfwidth
function normalizeFullWidth(str: string): string {
  return str.replace(FULLWIDTH_RE, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
}

// Normalisasi vokal bertanda macron (ō, ū, ā, ī, ē)
function normalizeMacrons(str: string): string {
  let res = str;
  for (let i = 0; i < MACRON_REPLACEMENTS.length; i++) {
    const [pattern, repl] = MACRON_REPLACEMENTS[i];
    res = res.replace(pattern, repl);
  }
  return res;
}

/**
 * Mengubah string romaji ke bentuk kanonisasi untuk perbandingan fleksibel
 */
export function canonicalizeRomaji(raw: string): string {
  let text = normalizeMacrons(normalizeFullWidth(raw.trim().toLowerCase())).replace(WHITESPACE_RE, '');

  for (let i = 0; i < CANONICAL_MAPPINGS.length; i++) {
    const [pattern, repl] = CANONICAL_MAPPINGS[i];
    text = text.replace(pattern, repl);
  }

  return text;
}

function generateVariations(s: string): Set<string> {
  const cached = variationCache.get(s);
  if (cached) return cached;

  const variants = new Set<string>();
  const base = normalizeMacrons(s.toLowerCase().trim().replace(WHITESPACE_RE, ''));
  variants.add(base);

  let currentArray = Array.from(variants);
  for (let i = 0; i < VARIATION_SUBS.length; i++) {
    const [pattern, repl] = VARIATION_SUBS[i];
    for (let j = 0; j < currentArray.length; j++) {
      const item = currentArray[j];
      if (pattern.test(item)) {
        variants.add(item.replace(pattern, repl));
      }
    }
    currentArray = Array.from(variants);
  }

  // Cache up to 1000 items to avoid unbounded memory growth
  if (variationCache.size > 1000) {
    variationCache.clear();
  }
  variationCache.set(s, variants);

  return variants;
}

/**
 * Validasi apakah input pengguna cocok dengan token
 */
export function isRomajiMatch(
  userInput: string,
  expectedList: string[],
  kanaText: string
): boolean {
  if (!userInput) return false;

  const cleanInput = normalizeFullWidth(userInput.trim().toLowerCase());
  const cleanKana = kanaText.trim();

  // 1. Cek jika pengguna mengetik huruf kana langsung (via IME)
  if (cleanInput === cleanKana || userInput.trim() === cleanKana) {
    return true;
  }

  // 2. Cek kecocokan langsung dengan daftar expectedRomaji (Fast path)
  for (let i = 0; i < expectedList.length; i++) {
    const cleanExp = expectedList[i].toLowerCase().trim();
    if (cleanInput === cleanExp) {
      return true;
    }
  }

  // 3. Normalisasi fleksibel dengan cache
  const inputVariants = generateVariations(cleanInput);

  for (let i = 0; i < expectedList.length; i++) {
    const expVariants = generateVariations(expectedList[i]);
    for (const inVar of inputVariants) {
      if (expVariants.has(inVar)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Konversi karakter Hiragana ke Katakana
 */
export function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

/**
 * Konversi karakter Katakana ke Hiragana
 */
export function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/**
 * Validasi apakah ucapan suara pengguna cocok dengan token target
 */
export function isVoiceMatch(
  spokenText: string,
  expectedList: string[],
  kanaText: string
): boolean {
  if (!spokenText || !spokenText.trim()) return false;

  const cleanSpoken = spokenText
    .trim()
    .toLowerCase()
    .replace(/[。、・\s_.,!?]/g, '');
  const cleanTarget = kanaText.trim().replace(/[。、・\s_.,!?]/g, '');

  if (!cleanSpoken || !cleanTarget) return false;

  // 1. Cek kecocokan langsung teks kana atau romaji
  if (isRomajiMatch(cleanSpoken, expectedList, cleanTarget)) {
    return true;
  }

  // 2. Cek kesetaraan Hiragana <-> Katakana
  const spokenHiragana = katakanaToHiragana(cleanSpoken);
  const targetHiragana = katakanaToHiragana(cleanTarget);
  if (spokenHiragana === targetHiragana) {
    return true;
  }

  const spokenKatakana = hiraganaToKatakana(cleanSpoken);
  const targetKatakana = hiraganaToKatakana(cleanTarget);
  if (spokenKatakana === targetKatakana) {
    return true;
  }

  // 3. Cek jika suara mengandung target atau sebaliknya (untuk ucapan berantai)
  if (cleanSpoken.endsWith(targetHiragana) || cleanSpoken.endsWith(targetKatakana)) {
    return true;
  }

  return false;
}

