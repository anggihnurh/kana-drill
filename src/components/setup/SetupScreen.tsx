import React from 'react';
import { Setup } from './SetupCompound';

/**
 * SetupScreen composed with Vercel Composition Patterns
 * Uses compound components (Setup.Root, Setup.Hero, Setup.ResumeBanner, Setup.Presets, ...)
 */
export const SetupScreen: React.FC = () => {
  return (
    <Setup.Root>
      <Setup.Hero />
      <Setup.ResumeBanner />
      <Setup.Presets />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Setup.ScriptSelector />
          <Setup.ModeSelector />
          <Setup.CategoryMatrix />
        </div>

        <div className="space-y-5">
          <Setup.SessionOverview />
        </div>
      </div>
    </Setup.Root>
  );
};
