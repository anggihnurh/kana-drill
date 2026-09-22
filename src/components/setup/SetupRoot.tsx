import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { playSound } from '../../lib/soundEffects';
import { useDrillStore } from '../../store/useDrillStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useRaceStore } from '../../store/useRaceStore';
import { RaceLobbyModal } from '../race/RaceLobbyModal';
import { SetupContext, SetupContextValue } from './SetupContext';

// ==========================================
// 1. Setup Root (Provider)
// ==========================================
export interface SetupRootProps {
  children: React.ReactNode;
}

export const SetupRoot: React.FC<SetupRootProps> = ({ children }) => {
  const config = useDrillStore((s) => s.config);
  const setConfig = useDrillStore((s) => s.setConfig);
  const startSessionStore = useDrillStore((s) => s.startSession);

  const records = useHistoryStore((s) => s.records);
  const getBestRecord = useHistoryStore((s) => s.getBestRecord);
  const raceStatus = useRaceStore((s) => s.status);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRaceLobbyOpen, setIsRaceLobbyOpen] = useState(false);
  const [raceRoomQueryId, setRaceRoomQueryId] = useState<string | null>(null);

  const bestRecord = useMemo(() => getBestRecord(), [records, getBestRecord]);

  // Check ?race=ROOM_ID in URL query params on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const raceParam = params.get('race');
      if (raceParam) {
        setRaceRoomQueryId(raceParam);
        setIsRaceLobbyOpen(true);
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // SetupRoot mounts again after a race screen closes; keep the active room visible for rematch.
  useEffect(() => {
    if (raceStatus === 'lobby') setIsRaceLobbyOpen(true);
  }, [raceStatus]);

  const toggleSound = useCallback(() => {
    const next = !config.soundEnabled;
    setConfig({ soundEnabled: next });
    if (next) {
      playSound('correct', true);
    }
  }, [config.soundEnabled, setConfig]);

  const startSession = useCallback(() => {
    startSessionStore();
  }, [startSessionStore]);

  const contextValue: SetupContextValue = useMemo(
    () => ({
      state: {
        config,
        records,
        bestRecord,
        isHistoryOpen,
        isRaceLobbyOpen,
        raceRoomQueryId,
      },
      actions: {
        setConfig,
        startSession,
        toggleSound,
        setIsHistoryOpen,
        setIsRaceLobbyOpen,
      },
    }),
    [
      config,
      records,
      bestRecord,
      isHistoryOpen,
      isRaceLobbyOpen,
      raceRoomQueryId,
      setConfig,
      startSession,
      toggleSound,
    ]
  );

  return (
    <SetupContext.Provider value={contextValue}>
      <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 animate-pop-in">
        {children}
        <RaceLobbyModal
          isOpen={isRaceLobbyOpen}
          onClose={() => setIsRaceLobbyOpen(false)}
          initialRoomId={raceRoomQueryId}
        />
      </div>
    </SetupContext.Provider>
  );
};
