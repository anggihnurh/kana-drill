import React from 'react';
import { Drill } from './DrillCompound';
import { useDrillStore } from '../../store/useDrillStore';

/**
 * DrillScreen composed with Vercel Composition Patterns
 * Uses compound components (Drill.Root, Drill.Header, Drill.TokenGrid, Drill.InputBar, Drill.PauseOverlay)
 */
export const DrillScreen: React.FC = () => {
  const isPaused = useDrillStore((s) => s.status === 'paused');

  return (
    <Drill.Root>
      <Drill.Header />
      {isPaused ? (
        <Drill.PauseOverlay />
      ) : (
        <>
          <Drill.TokenGrid />
          <Drill.InputBar />
        </>
      )}
    </Drill.Root>
  );
};
