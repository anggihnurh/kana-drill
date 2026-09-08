import React from 'react';
import { Result } from './ResultCompound';

/**
 * ResultScreen composed with Vercel Composition Patterns
 * Uses compound components (Result.Root, Result.RankBanner, Result.MetricsGrid, Result.TimelineChart, Result.MistakesReview, Result.Actions)
 */
export const ResultScreen: React.FC = () => {
  return (
    <Result.Root>
      <Result.RankBanner />
      <Result.MetricsGrid />
      <Result.TimelineChart />
      <Result.MistakesReview />
      <Result.Actions />
    </Result.Root>
  );
};
