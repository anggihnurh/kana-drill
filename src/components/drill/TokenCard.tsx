import React, { useCallback, useState } from 'react';
import { TokenItem } from '../../types/drill';
import { cn } from '../../lib/utils';
import { Check, X, Volume2 } from 'lucide-react';
import { speakKana } from '../../hooks/useKanaAudio';

interface TokenCardProps {
  index: number;
  token: TokenItem;
  isActive: boolean;
  onClick: () => void;
}

/**
 * High-Performance Tactile Token Card
 * Memoized with React.memo (Vercel Best Practice: rerender-memo)
 * Re-renders only when its specific token status or active flag changes.
 */
export const TokenCard: React.FC<TokenCardProps> = React.memo(
  ({ index, token, isActive, onClick }) => {
    const isAnswered = token.userAnswer !== undefined;
    const isCorrect = token.isCorrect;
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayAudio = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent card click
        setIsPlaying(true);
        speakKana(token.kanaText);
        // Reset visual indicator after short delay
        setTimeout(() => setIsPlaying(false), 700);
      },
      [token.kanaText]
    );

    return (
      <div
        onClick={onClick}
        data-token-active={isActive ? 'true' : 'false'}
        className={cn(
          'relative flex flex-col items-center justify-between min-h-[145px] sm:min-h-[160px] p-4 sm:p-4.5 rounded-2xl cursor-pointer transition-all duration-200 select-none border',
          'active:scale-[0.97]',
          // Default unvisited state
          'bg-white dark:bg-zinc-900/80 border-zinc-200/90 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md',
          // Active state (glowing ring)
          isActive &&
            'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/70 text-indigo-950 dark:bg-indigo-950/40 dark:border-indigo-500 dark:ring-indigo-500 dark:text-indigo-100 scale-[1.03] z-10 shadow-lg shadow-indigo-500/10',
          // Correct state
          isAnswered &&
            isCorrect &&
            'border-emerald-500/70 bg-emerald-50/80 text-emerald-950 dark:border-emerald-700/80 dark:bg-emerald-950/30 dark:text-emerald-100 shadow-emerald-500/5',
          // Mistake state
          isAnswered &&
            !isCorrect &&
            'border-rose-500/70 bg-rose-50/80 text-rose-950 dark:border-rose-800/80 dark:bg-rose-950/30 dark:text-rose-100 shadow-rose-500/5'
        )}
      >
        {/* Top row: index number badge & status icon */}
        <div className="w-full flex items-center justify-between text-xs">
          <span
            className={cn(
              'font-mono font-bold px-1.5 py-0.5 rounded-md text-[11px] transition-colors',
              isActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/90 dark:text-zinc-400'
            )}
          >
            #{index + 1}
          </span>

          {isAnswered ? (
            <div className="animate-pop-in">
              {isCorrect ? (
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center text-xs font-bold shadow-sm">
                  <X className="w-3.5 h-3.5 stroke-[2.8]" />
                </span>
              )}
            </div>
          ) : (
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
              {token.kanaText.length} kana
            </span>
          )}
        </div>

        {/* Japanese Kana Text Display - Uniform Typography & Balanced Whitespace */}
        <div className="my-auto py-2 text-center w-full px-1 overflow-hidden flex flex-col items-center justify-center min-h-[56px] sm:min-h-[64px]">
          <span
            className="font-japanese text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-wide leading-tight block drop-shadow-sm whitespace-nowrap max-w-full truncate"
            title={token.kanaText}
          >
            {token.kanaText}
          </span>
          {token.meaning ? (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 truncate max-w-full italic px-1 font-normal">
              {token.meaning}
            </p>
          ) : (
            <div className="h-[17px]" aria-hidden="true" />
          )}
        </div>

        {/* Bottom row: User answer, romaji hint, or audio button */}
        <div className="w-full text-center min-h-[22px] flex items-center justify-center">
          {isAnswered ? (
            <div className="w-full px-1">
              <span
                className={cn(
                  'font-mono text-xs font-bold truncate max-w-full inline-block',
                  isCorrect
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400 line-through'
                )}
              >
                {token.userAnswer || '—'}
              </span>
              {!isCorrect ? (
                <span className="block font-mono text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  ✓ {token.expectedRomaji[0]}
                </span>
              ) : null}
            </div>
          ) : isActive ? (
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 animate-pulse font-semibold">
              Ketik di sini...
            </span>
          ) : (
            <span className="text-[11px] font-mono text-zinc-300 dark:text-zinc-600">
              •••
            </span>
          )}
        </div>

        {/* Audio Button — absolute bottom-right corner */}
        <button
          type="button"
          onClick={handlePlayAudio}
          aria-label={`Putar bunyi ${token.kanaText}`}
          title={`Putar bunyi: ${token.kanaText}`}
          className={cn(
            'absolute bottom-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer z-10',
            'opacity-40 hover:opacity-100 hover:scale-110 active:scale-95',
            isPlaying && 'opacity-100 scale-110',
            isActive
              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-300'
              : isAnswered && isCorrect
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
                : isAnswered && !isCorrect
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
          )}
        >
          <Volume2
            className={cn(
              'w-3 h-3 transition-transform duration-150',
              isPlaying && 'animate-pulse'
            )}
          />
        </button>
      </div>
    );
  }
);

TokenCard.displayName = 'TokenCard';
