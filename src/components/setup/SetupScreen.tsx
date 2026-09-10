import React from 'react';
import { Setup } from './SetupCompound';

/**
 * SetupScreen composed with Vercel Composition Patterns
 * Hanya menampilkan: Hero, ResumeBanner, CategoryMatrix, SessionOverview
 */
export const SetupScreen: React.FC = () => {
  return (
    <Setup.Root>
      <Setup.Hero />
      <Setup.ResumeBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Setup.CategoryMatrix />
        </div>

        <div className="space-y-5">
          <Setup.SessionOverview />
        </div>
      </div>
    </Setup.Root>
  );
};
