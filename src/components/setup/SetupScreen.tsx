import React from 'react';
import { SetupHero } from './SetupHero';
import { SetupResumeBanner } from './SetupResumeBanner';
import { SetupRoot } from './SetupRoot';
import { SetupSessionOverview } from './SetupSessionOverview';

export const SetupScreen: React.FC = () => {
  return (
    <SetupRoot>
      <SetupHero />
      <SetupResumeBanner />
      <SetupSessionOverview />
    </SetupRoot>
  );
};
