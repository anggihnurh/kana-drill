import { createContext, useContext } from 'react';
import { DrillMode, InputMode, KanaCategory, KanaScript, SessionConfig, SessionRecord } from '../../types/drill';

export interface SetupState {
  config: SessionConfig;
  records: SessionRecord[];
  bestRecord: SessionRecord | null;
  isHistoryOpen: boolean;
}

export interface SetupActions {
  setConfig: (partial: Partial<SessionConfig>) => void;
  startSession: () => void;
  applyPreset: (presetConfig: Partial<SessionConfig>) => void;
  selectScript: (script: KanaScript) => void;
  selectMode: (mode: DrillMode) => void;
  selectInputMode: (inputMode: InputMode) => void;
  toggleCategory: (category: KanaCategory) => void;
  selectAllCategories: () => void;
  toggleSound: () => void;
  setIsHistoryOpen: (open: boolean) => void;
}

export interface SetupContextValue {
  state: SetupState;
  actions: SetupActions;
}

export const SetupContext = createContext<SetupContextValue | null>(null);

export function useSetupContext(): SetupContextValue {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error('useSetupContext must be used within a Setup.Root / SetupProvider');
  }
  return context;
}
