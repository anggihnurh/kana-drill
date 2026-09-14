import { Question, SessionSummary } from './drill';

export type RaceRole = 'host' | 'guest';
export type RaceStatus = 'idle' | 'lobby' | 'countdown' | 'racing' | 'finished';

export interface PlayerProgress {
  id: string;
  name: string;
  progressPercent: number; // 0 - 100
  currentCpm: number;
  isFinished: boolean;
  finishTimeMs?: number;
}

export type RaceMessage =
  | { type: 'JOIN_LOBBY'; name: string }
  | { type: 'LOBBY_ACK'; name: string }
  | { type: 'START_COUNTDOWN'; questions: Question[]; startTime: number }
  | { type: 'PROGRESS_UPDATE'; progress: PlayerProgress }
  | { type: 'RACE_FINISHED'; summary: SessionSummary }
  | { type: 'REMATCH' }
  | { type: 'LEAVE_ROOM' };
