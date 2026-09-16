import { Question, SessionSummary } from './drill';

export type RaceRole = 'host' | 'guest';
export type RaceStatus = 'idle' | 'lobby' | 'countdown' | 'racing' | 'waiting' | 'finished';

export interface PlayerProgress {
  id: string;
  name: string;
  progressPercent: number;
  currentCpm: number;
  isFinished: boolean;
  finishTimeMs?: number;
}

export type RaceMessage =
  | { type: 'JOIN_LOBBY'; player: PlayerProgress }
  | { type: 'LOBBY_STATE'; players: PlayerProgress[]; expiresAt: number }
  | { type: 'START_COUNTDOWN'; questions: Question[]; startAt: number; players: PlayerProgress[] }
  | { type: 'PROGRESS_UPDATE'; progress: PlayerProgress }
  | { type: 'RACE_FINISHED'; progress: PlayerProgress; summary: SessionSummary }
  | { type: 'SUMMARY_UPDATE'; playerId: string; summary: SessionSummary }
  | { type: 'PLAYER_LEFT'; playerId: string }
  | { type: 'REMATCH_REQUEST' }
  | { type: 'RESET_LOBBY'; players: PlayerProgress[]; expiresAt: number }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'ROOM_ERROR'; message: string }
  | { type: 'LEAVE_ROOM'; playerId: string };
