import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TokenItem } from '../../types/drill';

interface SentenceTypingCardProps {
  token: TokenItem;
  currentInput: string;
  isShaking: boolean;
}

interface KanaMora {
  text: string;
  isPunctuation: boolean;
}

interface MoraWithOffset extends KanaMora {
  endOffset: number;
}

/**
 * Break Japanese kana text into mora units (handling digraphs like しゃ, sokuon っ, and punctuation)
 */
function parseKanaMoras(kanaStr: string): KanaMora[] {
  const moras: KanaMora[] = [];
  const smallKana = new Set(['ゃ', 'ゅ', 'ょ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ャ', 'ュ', 'ョ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ']);
  const sokuon = new Set(['っ', 'ッ']);
  const punctuation = new Set(['。', '、', '！', '？', ' ', '…']);

  let i = 0;
  while (i < kanaStr.length) {
    const ch = kanaStr[i];

    if (punctuation.has(ch)) {
      moras.push({ text: ch, isPunctuation: true });
      i++;
      continue;
    }

    if (sokuon.has(ch) && i + 1 < kanaStr.length && !punctuation.has(kanaStr[i + 1])) {
      let moraText = ch + kanaStr[i + 1];
      i += 2;
      if (i < kanaStr.length && smallKana.has(kanaStr[i])) {
        moraText += kanaStr[i];
        i++;
      }
      moras.push({ text: moraText, isPunctuation: false });
      continue;
    }

    let moraText = ch;
    i++;
    if (i < kanaStr.length && smallKana.has(kanaStr[i])) {
      moraText += kanaStr[i];
      i++;
    }
    moras.push({ text: moraText, isPunctuation: false });
  }

  return moras;
}

function getMoraRomajiLength(moraText: string): number {
  if (['しゃ', 'しゅ', 'しょ', 'ちゃ', 'ちゅ', 'ちょ', 'きゃ', 'きゅ', 'きょ', 'にゃ', 'にゅ', 'にょ', 'ひゃ', 'ひゅ', 'ひょ', 'みゃ', 'みゅ', 'みょ', 'りゃ', 'りゅ', 'りょ', 'ぎゃ', 'ぎゅ', 'ぎょ', 'びゃ', 'びゅ', 'びょ', 'ぴゃ', 'ぴゅ', 'ぴょ'].includes(moraText)) {
    return 3;
  }
  if (moraText.startsWith('っ') || moraText.startsWith('ッ')) {
    return moraText.length >= 2 ? 3 : 1;
  }
  if (['あ', 'い', 'う', 'え', 'お', 'ア', 'イ', 'ウ', 'エ', 'オ', 'ー'].includes(moraText)) {
    return 1;
  }
  return moraText.length * 2;
}

function calculateMoraOffsets(moras: KanaMora[], targetRomaji: string): MoraWithOffset[] {
  const totalTargetLen = targetRomaji.length;
  const nonPunctuationMoras = moras.filter((m) => !m.isPunctuation);

  if (nonPunctuationMoras.length === 0 || totalTargetLen === 0) {
    return moras.map((m) => ({ ...m, endOffset: totalTargetLen }));
  }

  let rawTotal = 0;
  const rawLens = nonPunctuationMoras.map((m) => {
    const l = getMoraRomajiLength(m.text);
    rawTotal += l;
    return l;
  });

  const result: MoraWithOffset[] = [];
  let currentAccum = 0;
  let nonPunctIdx = 0;

  for (let i = 0; i < moras.length; i++) {
    const m = moras[i];
    if (m.isPunctuation) {
      result.push({ ...m, endOffset: currentAccum });
    } else {
      const frac = rawLens[nonPunctIdx] / rawTotal;
      const moraShare =
        nonPunctIdx === nonPunctuationMoras.length - 1
          ? totalTargetLen - currentAccum
          : Math.round(frac * totalTargetLen);

      currentAccum += Math.max(1, moraShare);
      if (nonPunctIdx < nonPunctuationMoras.length - 1 && currentAccum >= totalTargetLen) {
        currentAccum = totalTargetLen - (nonPunctuationMoras.length - 1 - nonPunctIdx);
      }
      result.push({ ...m, endOffset: currentAccum });
      nonPunctIdx++;
    }
  }

  return result;
}

/**
 * SentenceTypingCard — Komponen layar drill mode Bun
 * Menampilkan kalimat utuh dalam Aksara Kana dengan umpan balik visual per-karakter langsung pada Kana.
 * Teks romaji acuan dihilangkan sesuai permintaan UI modern typing.
 */
export const SentenceTypingCard: React.FC<SentenceTypingCardProps> = React.memo(
  ({ token, currentInput, isShaking }) => {
    const isAnswered = token.userAnswer !== undefined;
    const isCorrect = token.isCorrect;

    // Target romaji dalam lowercase tanpa spasi ekstra
    const targetRomaji = useMemo(
      () => (token.expectedRomaji[0] ?? '').toLowerCase().trim(),
      [token.expectedRomaji]
    );

    // Hitung karakter romaji yang sudah benar (prefix match)
    const matchedLength = useMemo(() => {
      const input = currentInput.toLowerCase();
      let count = 0;
      while (count < input.length && count < targetRomaji.length) {
        if (input[count] === targetRomaji[count]) {
          count++;
        } else {
          break;
        }
      }
      return count;
    }, [currentInput, targetRomaji]);

    // Parse kanaText ke dalam moras dan hitung offset romaji
    const moraOffsets = useMemo(() => {
      const parsed = parseKanaMoras(token.kanaText);
      return calculateMoraOffsets(parsed, targetRomaji);
    }, [token.kanaText, targetRomaji]);

    // Indeks mora yang sedang aktif diketik
    const activeMoraIndex = useMemo(() => {
      if (isAnswered || matchedLength >= targetRomaji.length) return -1;
      return moraOffsets.findIndex((m) => !m.isPunctuation && m.endOffset > matchedLength);
    }, [moraOffsets, matchedLength, targetRomaji.length, isAnswered]);

    // Progress mengetik (0-100)
    const progress =
      targetRomaji.length > 0
        ? Math.min(100, Math.round((matchedLength / targetRomaji.length) * 100))
        : 0;

    return (
      <div
        className={cn(
          'relative w-full rounded-2xl border p-6 sm:p-8 transition-all duration-200 select-none',
          'bg-white dark:bg-zinc-900/80 border-zinc-200/90 dark:border-zinc-800/80 shadow-sm',
          isShaking && 'animate-shake border-rose-500 bg-rose-50/40 dark:bg-rose-950/20',
          isAnswered && isCorrect && 'border-emerald-500/70 bg-emerald-50/60 dark:border-emerald-700/80 dark:bg-emerald-950/30',
          isAnswered && !isCorrect && 'border-rose-500/70 bg-rose-50/60 dark:border-rose-800/80 dark:bg-rose-950/30'
        )}
      >
        {/* Status badge */}
        {isAnswered && (
          <div className="absolute top-4 right-4 animate-pop-in">
            {isCorrect ? (
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </span>
            ) : (
              <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center shadow-sm">
                <X className="w-4 h-4 stroke-[2.5]" />
              </span>
            )}
          </div>
        )}

        {/* Japanese sentence with character-by-character typed highlight directly on Kana */}
        <div className="mb-6 text-center">
          <div className="font-japanese text-3xl sm:text-4xl font-bold tracking-wide leading-relaxed drop-shadow-sm flex flex-wrap justify-center items-center gap-x-0.5">
            {moraOffsets.map((mora, i) => {
              let isMoraCompleted = false;

              if (isAnswered && isCorrect) {
                isMoraCompleted = true;
              } else if (mora.isPunctuation) {
                // Punctuation is completed if previous mora is completed or full sentence matched
                const prevMora = moraOffsets[i - 1];
                isMoraCompleted = matchedLength >= targetRomaji.length || (prevMora ? prevMora.endOffset <= matchedLength : false);
              } else {
                isMoraCompleted = matchedLength >= mora.endOffset;
              }

              const isActive = !isAnswered && i === activeMoraIndex;

              let colorClass = 'text-zinc-400/80 dark:text-zinc-500/80'; // belum diketik
              if (isMoraCompleted) {
                colorClass = 'text-emerald-600 dark:text-emerald-400 font-bold'; // sudah diketik / benar
              } else if (isActive) {
                colorClass = 'text-zinc-900 dark:text-zinc-100 font-bold underline decoration-emerald-500 decoration-2 underline-offset-4 animate-pulse'; // posisi aktif diketik
              }

              return (
                <span key={i} className={cn('transition-colors duration-150', colorClass)}>
                  {mora.text}
                </span>
              );
            })}
          </div>

          {token.meaning && (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 italic font-normal">
              {token.meaning}
            </p>
          )}
        </div>

        {/* Typing progress bar */}
        {!isAnswered && (
          <div className="mt-4">
            <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-150',
                  progress === 100 ? 'bg-emerald-500' : 'bg-zinc-900 dark:bg-white'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 text-center text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
              {matchedLength} / {targetRomaji.length} karakter
            </div>
          </div>
        )}

        {/* Post-answer display */}
        {isAnswered && (
          <div className="mt-4 text-center">
            {isCorrect ? (
              <p className="font-mono text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
                ✓ {token.userAnswer}
              </p>
            ) : (
              <div>
                <p className="font-mono text-sm text-rose-600 dark:text-rose-400 line-through mb-1">
                  {token.userAnswer || '—'}
                </p>
                <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                  ✓ {targetRomaji}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

SentenceTypingCard.displayName = 'SentenceTypingCard';
