import React from 'react';
import { Setup } from './SetupCompound';

export const SetupScreen: React.FC = () => {
  return (
    <Setup.Root>
      <Setup.Hero />
      <Setup.ResumeBanner />
      <Setup.SessionOverview />
    </Setup.Root>
  );
};
