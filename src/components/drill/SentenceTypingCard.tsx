import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TokenItem } from '../../types/drill';

interface SentenceTypingCardProps {
  token: TokenItem;
  currentInput: string;
  isShaking: boolean;
}

/**
 * SentenceTypingCard — Komponen layar drill mode Bun
 * Menampilkan kalimat utuh dan umpan balik visual karakter-per-karakter saat user mengetik.
 * Memoized untuk menghindari rerender yang tidak perlu.
 */
export const SentenceTypingCard: React.FC<SentenceTypingCardProps> = React.memo(
  ({ token, currentInput, isShaking }) => {
    const isAnswered = token.userAnswer !== undefined;
    const isCorrect = token.isCorrect;

    // Ambil romaji target terbaik (validRomaji[0] dalam lowercase tanpa spasi ekstra)
    const targetRomaji = useMemo(
      () => (token.expectedRomaji[0] ?? '').toLowerCase().trim(),
      [token.expectedRomaji]
    );

    // Hitung karakter mana yang sudah benar (prefix match)
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

    // Progress mengetik (0-100)
    const progress = targetRomaji.length > 0
      ? Math.min(100, Math.round((matchedLength / targetRomaji.length) * 100))
      : 0;

    return (
      <div
        className={cn(
          'relative w-full rounded-2xl border p-6 sm:p-8 transition-all duration-200 select-none',
          // Default state
          'bg-white dark:bg-zinc-900/80 border-zinc-200/90 dark:border-zinc-800/80 shadow-sm',
          // Shaking on error
          isShaking && 'animate-shake border-rose-500 bg-rose-50/40 dark:bg-rose-950/20',
          // Answered state
          isAnswered && isCorrect && 'border-emerald-500/70 bg-emerald-50/60 dark:border-emerald-700/80 dark:bg-emerald-950/30',
          isAnswered && !isCorrect && 'border-rose-500/70 bg-rose-50/60 dark:border-rose-800/80 dark:bg-rose-950/30',
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

        {/* Japanese sentence */}
        <div className="mb-4 text-center">
          <p
            className="font-japanese text-3xl sm:text-4xl font-bold tracking-wide leading-snug text-zinc-900 dark:text-zinc-100 drop-shadow-sm"
          >
            {token.kanaText}
          </p>
          {token.meaning && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 italic font-normal">
              {token.meaning}
            </p>
          )}
        </div>

        {/* Typing progress display */}
        {!isAnswered && (
          <div className="mt-4">
            {/* Target romaji dengan highlight karakter yang sudah diketik */}
            <div className="font-mono text-center text-base sm:text-lg leading-relaxed tracking-wider mb-3 overflow-x-auto whitespace-nowrap px-2">
              {targetRomaji.split('').map((char, i) => {
                let colorClass = 'text-zinc-300 dark:text-zinc-600'; // belum diketik
                if (i < matchedLength) {
                  colorClass = 'text-emerald-600 dark:text-emerald-400'; // benar
                } else if (i === matchedLength && currentInput.length > matchedLength) {
                  colorClass = 'text-rose-500 dark:text-rose-400'; // salah
                } else if (i === matchedLength) {
                  colorClass = 'text-zinc-900 dark:text-zinc-100 animate-pulse'; // posisi kursor
                }
                return (
                  <span key={i} className={cn('transition-colors duration-100', colorClass)}>
                    {char}
                  </span>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-150',
                  progress === 100
                    ? 'bg-emerald-500'
                    : 'bg-zinc-900 dark:bg-white'
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
