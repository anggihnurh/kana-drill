import React from 'react';
import { Drill } from './DrillCompound';
import { useDrillStore } from '../../store/useDrillStore';

/**
 * DrillScreen composed with Vercel Composition Patterns
 * Renders different panels based on `config.inputMode`:
 * - 'kotoba': token-grid (9 kata per soal)
 * - 'bun': sentence-panel (1 kalimat utuh per soal, typing-app style)
 */
export const DrillScreen: React.FC = () => {
  const isPaused = useDrillStore((s) => s.status === 'paused');
  const inputMode = useDrillStore((s) => s.config.inputMode ?? 'kotoba');

  return (
    <Drill.Root>
      <Drill.Header />
      {isPaused ? (
        <Drill.PauseOverlay />
      ) : (
        <>
          {inputMode === 'bun' ? (
            <Drill.SentencePanel />
          ) : (
            <Drill.TokenGrid />
          )}
          <Drill.InputBar />
        </>
      )}
    </Drill.Root>
  );
};
