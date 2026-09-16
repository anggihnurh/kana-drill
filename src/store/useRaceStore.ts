import Peer, { DataConnection } from 'peerjs';
import { create } from 'zustand';
import { generateSessionQuestions } from '../lib/drillGenerator';
import { isRomajiMatch } from '../lib/romajiValidator';
import { playSound } from '../lib/soundEffects';
import { Question, SessionSummary } from '../types/drill';
import { PlayerProgress, RaceMessage, RaceRole, RaceStatus } from '../types/race';
import { DEFAULT_CONFIG } from './useDrillStore';

const SESSION_IDLE_MS = 5 * 60 * 1000;
const COUNTDOWN_MS = 3_200;

interface RaceState {
  peer: Peer | null;
  connections: DataConnection[];
  roomId: string | null;
  role: RaceRole | null;
  status: RaceStatus;
  errorMessage: string | null;
  isConnecting: boolean;
  expiresAt: number | null;

  myName: string;
  myProgress: PlayerProgress;
  players: PlayerProgress[];
  summaries: Record<string, SessionSummary>;

  questions: Question[];
  currentQuestionIndex: number;
  activeTokenIndex: number;
  currentInput: string;
  isInputErrorShake: boolean;
  countdown: number;
  startTime: number;
  totalTokensInRace: number;
  answeredTokensCount: number;

  setMyName: (name: string) => void;
  createRoom: (name: string) => Promise<string>;
  joinRoom: (roomId: string, name: string) => Promise<void>;
  startRaceCountdown: () => void;
  setInput: (value: string) => void;
  submitCurrentToken: (overrideValue?: string) => void;
  selectToken: (index: number) => void;
  nextQuestion: (durationMs: number) => void;
  requestRematch: () => void;
  leaveRace: () => void;
  clearError: () => void;
}

const initialProgress = (id = '', name = ''): PlayerProgress => ({
  id,
  name,
  progressPercent: 0,
  currentCpm: 0,
  isFinished: false,
});

const resetProgress = (player: PlayerProgress): PlayerProgress => ({
  id: player.id,
  name: player.name,
  progressPercent: 0,
  currentCpm: 0,
  isFinished: false,
});

export const useRaceStore = create<RaceState>((set, get) => {
  let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  let countdownTimer: ReturnType<typeof setInterval> | null = null;

  const clearTimers = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (countdownTimer) clearInterval(countdownTimer);
    inactivityTimer = null;
    countdownTimer = null;
  };

  const sendToConnection = (connection: DataConnection, message: RaceMessage) => {
    if (connection.open) connection.send(message);
  };

  const broadcast = (message: RaceMessage, exceptPeerId?: string) => {
    get().connections.forEach((connection) => {
      if (connection.peer !== exceptPeerId) sendToConnection(connection, message);
    });
  };

  const sendToHost = (message: RaceMessage) => {
    const connection = get().connections[0];
    if (connection) sendToConnection(connection, message);
  };

  const allPlayers = () => [get().myProgress, ...get().players];

  const maybeShowResults = () => {
    const state = get();
    if (!state.myProgress.isFinished) return;
    if (state.players.every((player) => player.isFinished)) set({ status: 'finished' });
  };

  const expireSession = (remote = false, reason = 'Room ditutup otomatis setelah 5 menit tanpa aktivitas.') => {
    const state = get();
    if (!remote && state.role === 'host') broadcast({ type: 'SESSION_EXPIRED' });
    clearTimers();
    state.connections.forEach((connection) => connection.close());
    state.peer?.destroy();
    set({
      peer: null,
      connections: [],
      roomId: null,
      role: null,
      status: 'idle',
      isConnecting: false,
      expiresAt: null,
      players: [],
      summaries: {},
      questions: [],
      currentQuestionIndex: 0,
      activeTokenIndex: 0,
      currentInput: '',
      errorMessage: reason,
    });
  };

  const scheduleExpiry = (expiresAt: number) => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    set({ expiresAt });
    inactivityTimer = setTimeout(() => expireSession(), Math.max(0, expiresAt - Date.now()));
  };

  const touchSession = () => {
    if (get().role !== 'host') return;
    const expiresAt = Date.now() + SESSION_IDLE_MS;
    scheduleExpiry(expiresAt);
    broadcast({ type: 'LOBBY_STATE', players: allPlayers(), expiresAt });
  };

  const beginCountdown = (startAt: number) => {
    if (countdownTimer) clearInterval(countdownTimer);
    const tick = () => {
      const remainingMs = startAt - Date.now();
      if (remainingMs <= 0) {
        if (countdownTimer) clearInterval(countdownTimer);
        countdownTimer = null;
        set({ status: 'racing', countdown: 0, startTime: startAt });
        playSound('correct', true);
        return;
      }
      const next = Math.ceil(remainingMs / 1000);
      if (next !== get().countdown) playSound('click', true);
      set({ countdown: next });
    };
    tick();
    countdownTimer = setInterval(tick, 100);
  };

  const updateRemotePlayer = (progress: PlayerProgress) => {
    set((state) => ({
      players: state.players.some((player) => player.id === progress.id)
        ? state.players.map((player) => (player.id === progress.id ? progress : player))
        : [...state.players, progress],
    }));
  };

  const resetToLobby = (players: PlayerProgress[], expiresAt: number) => {
    const state = get();
    const me = players.find((player) => player.id === state.myProgress.id) ?? state.myProgress;
    set({
      status: 'lobby',
      myProgress: resetProgress(me),
      players: players
        .filter((player) => player.id !== state.myProgress.id)
        .map(resetProgress),
      summaries: {},
      questions: [],
      currentQuestionIndex: 0,
      activeTokenIndex: 0,
      currentInput: '',
      answeredTokensCount: 0,
      startTime: 0,
    });
    scheduleExpiry(expiresAt);
  };

  const removePlayer = (playerId: string) => {
    set((state) => ({
      players: state.players.filter((player) => player.id !== playerId),
      connections: state.connections.filter((connection) => connection.peer !== playerId),
    }));
    maybeShowResults();
  };

  const handleMessage = (message: RaceMessage, connection: DataConnection) => {
    if (!message?.type) return;
    const state = get();

    switch (message.type) {
      case 'JOIN_LOBBY': {
        if (state.role !== 'host') return;
        if (state.status !== 'lobby') {
          sendToConnection(connection, { type: 'ROOM_ERROR', message: 'Balapan sedang berlangsung.' });
          connection.close();
          return;
        }
        updateRemotePlayer(message.player);
        const expiresAt = Date.now() + SESSION_IDLE_MS;
        scheduleExpiry(expiresAt);
        queueMicrotask(() => broadcast({ type: 'LOBBY_STATE', players: allPlayers(), expiresAt }));
        break;
      }
      case 'LOBBY_STATE':
        if (state.role === 'guest') {
          const me = message.players.find((player) => player.id === state.myProgress.id);
          set({
            players: message.players.filter((player) => player.id !== state.myProgress.id),
            myProgress: me ?? state.myProgress,
          });
          scheduleExpiry(message.expiresAt);
        }
        break;
      case 'START_COUNTDOWN': {
        const totalTokens = message.questions.reduce((sum, question) => sum + question.tokens.length, 0);
        const me = message.players.find((player) => player.id === state.myProgress.id) ?? state.myProgress;
        set({
          questions: message.questions,
          totalTokensInRace: totalTokens,
          status: 'countdown',
          countdown: 4,
          currentQuestionIndex: 0,
          activeTokenIndex: 0,
          currentInput: '',
          answeredTokensCount: 0,
          myProgress: resetProgress(me),
          players: message.players
            .filter((player) => player.id !== state.myProgress.id)
            .map(resetProgress),
          summaries: {},
        });
        beginCountdown(message.startAt);
        break;
      }
      case 'PROGRESS_UPDATE':
        updateRemotePlayer(message.progress);
        if (state.role === 'host') {
          broadcast(message, connection.peer);
          touchSession();
        }
        maybeShowResults();
        break;
      case 'RACE_FINISHED':
        updateRemotePlayer(message.progress);
        set((current) => ({ summaries: { ...current.summaries, [message.progress.id]: message.summary } }));
        if (state.role === 'host') {
          broadcast(message, connection.peer);
          touchSession();
        }
        queueMicrotask(maybeShowResults);
        break;
      case 'SUMMARY_UPDATE':
        set((current) => ({ summaries: { ...current.summaries, [message.playerId]: message.summary } }));
        break;
      case 'REMATCH_REQUEST':
        if (state.role === 'host') {
          const expiresAt = Date.now() + SESSION_IDLE_MS;
          const players = allPlayers().map(resetProgress);
          resetToLobby(players, expiresAt);
          broadcast({ type: 'RESET_LOBBY', players, expiresAt });
        }
        break;
      case 'RESET_LOBBY':
        resetToLobby(message.players, message.expiresAt);
        break;
      case 'LEAVE_ROOM':
        if (state.role === 'host') {
          removePlayer(message.playerId);
          broadcast({ type: 'PLAYER_LEFT', playerId: message.playerId }, connection.peer);
          touchSession();
        }
        break;
      case 'PLAYER_LEFT':
        removePlayer(message.playerId);
        break;
      case 'SESSION_EXPIRED':
        expireSession(true);
        break;
      case 'ROOM_ERROR':
        set({ errorMessage: message.message, isConnecting: false });
        break;
    }
  };

  const setupConnection = (connection: DataConnection) => {
    connection.on('data', (data: unknown) => handleMessage(data as RaceMessage, connection));
    connection.on('close', () => {
      const state = get();
      if (state.role === 'host') {
        removePlayer(connection.peer);
        broadcast({ type: 'PLAYER_LEFT', playerId: connection.peer }, connection.peer);
      } else if (state.status !== 'idle') {
        expireSession(true, 'Koneksi ke host terputus. Room sudah tidak tersedia.');
      }
    });
    connection.on('error', () => set({ errorMessage: 'Terjadi gangguan koneksi realtime.' }));
  };

  return {
    peer: null,
    connections: [],
    roomId: null,
    role: null,
    status: 'idle',
    errorMessage: null,
    isConnecting: false,
    expiresAt: null,
    myName: localStorage.getItem('kana_player_name') || 'Pembalap Kana',
    myProgress: initialProgress(),
    players: [],
    summaries: {},
    questions: [],
    currentQuestionIndex: 0,
    activeTokenIndex: 0,
    currentInput: '',
    isInputErrorShake: false,
    countdown: 3,
    startTime: 0,
    totalTokensInRace: 0,
    answeredTokensCount: 0,

    setMyName: (name) => {
      const trimmed = name.trim() || 'Pembalap Kana';
      localStorage.setItem('kana_player_name', trimmed);
      set({ myName: trimmed });
    },

    createRoom: async (name) => {
      get().leaveRace();
      set({ isConnecting: true, errorMessage: null });
      const peerId = `kd_${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`;

      return new Promise<string>((resolve, reject) => {
        const peer = new Peer(peerId);
        peer.on('open', (id) => {
          const expiresAt = Date.now() + SESSION_IDLE_MS;
          set({
            peer,
            roomId: id,
            role: 'host',
            status: 'lobby',
            myName: name,
            myProgress: initialProgress(id, name),
            players: [],
            summaries: {},
            isConnecting: false,
          });
          scheduleExpiry(expiresAt);
          resolve(id);
        });
        peer.on('connection', (connection) => {
          connection.on('open', () => {
            set((state) => ({ connections: [...state.connections, connection] }));
            setupConnection(connection);
          });
        });
        peer.on('error', (error) => {
          set({ isConnecting: false, errorMessage: `Gagal membuat room: ${error.message}` });
          reject(error);
        });
      });
    },

    joinRoom: async (targetRoomId, name) => {
      get().leaveRace();
      set({ isConnecting: true, errorMessage: null });
      const roomId = targetRoomId.trim();

      return new Promise<void>((resolve, reject) => {
        const peer = new Peer();
        peer.on('open', (myId) => {
          const connection = peer.connect(roomId, { reliable: true });
          connection.on('open', () => {
            const me = initialProgress(myId, name);
            set({
              peer,
              connections: [connection],
              roomId,
              role: 'guest',
              status: 'lobby',
              myName: name,
              myProgress: me,
              players: [],
              summaries: {},
              isConnecting: false,
            });
            setupConnection(connection);
            sendToConnection(connection, { type: 'JOIN_LOBBY', player: me });
            resolve();
          });
          connection.on('error', (error) => {
            set({ isConnecting: false, errorMessage: `Gagal bergabung: ${error.message}` });
            reject(error);
          });
        });
        peer.on('error', (error) => {
          set({ isConnecting: false, errorMessage: `Room tidak ditemukan atau sudah kedaluwarsa.` });
          reject(error);
        });
      });
    },

    startRaceCountdown: () => {
      const state = get();
      if (state.role !== 'host' || state.players.length < 1) return;
      const questions = generateSessionQuestions(DEFAULT_CONFIG);
      const totalTokens = questions.reduce((sum, question) => sum + question.tokens.length, 0);
      const players = allPlayers().map(resetProgress);
      const startAt = Date.now() + COUNTDOWN_MS;
      const message: RaceMessage = { type: 'START_COUNTDOWN', questions, startAt, players };
      broadcast(message);
      set({
        questions,
        totalTokensInRace: totalTokens,
        status: 'countdown',
        countdown: 4,
        currentQuestionIndex: 0,
        activeTokenIndex: 0,
        currentInput: '',
        answeredTokensCount: 0,
        myProgress: resetProgress(state.myProgress),
        players: state.players.map(resetProgress),
        summaries: {},
      });
      touchSession();
      beginCountdown(startAt);
    },

    setInput: (value) => {
      const state = get();
      if (state.status !== 'racing') return;
      const token = state.questions[state.currentQuestionIndex]?.tokens[state.activeTokenIndex];
      if (!token) return;
      const trimmed = value.trim();
      if (trimmed && isRomajiMatch(trimmed, token.expectedRomaji, token.kanaText)) {
        get().submitCurrentToken(trimmed);
      } else {
        set({ currentInput: value, isInputErrorShake: false });
      }
    },

    selectToken: (index) => {
      const state = get();
      const question = state.questions[state.currentQuestionIndex];
      if (state.status !== 'racing' || !question || index < 0 || index >= question.tokens.length) return;
      set({ activeTokenIndex: index, currentInput: question.tokens[index]?.userAnswer || '', isInputErrorShake: false });
    },

    submitCurrentToken: (overrideValue) => {
      const state = get();
      if (state.status !== 'racing') return;
      const question = state.questions[state.currentQuestionIndex];
      const token = question?.tokens[state.activeTokenIndex];
      if (!question || !token) return;
      const input = (overrideValue ?? state.currentInput).trim();
      if (!input) return;
      const isCorrect = isRomajiMatch(input, token.expectedRomaji, token.kanaText);
      playSound(isCorrect ? 'correct' : 'wrong', true);

      const tokens = [...question.tokens];
      tokens[state.activeTokenIndex] = { ...token, userAnswer: input, isCorrect };
      const questions = [...state.questions];
      questions[state.currentQuestionIndex] = { ...question, tokens };

      const flatTokens = questions.flatMap((item) => item.tokens);
      const answered = flatTokens.filter((item) => item.userAnswer !== undefined).length;
      const correctCharacters = flatTokens
        .filter((item) => item.isCorrect)
        .reduce((sum, item) => sum + item.kanaText.length, 0);
      const elapsedMinutes = Math.max(0.05, (Date.now() - state.startTime) / 60_000);
      const progress: PlayerProgress = {
        ...state.myProgress,
        progressPercent: Math.min(100, Math.round((answered / Math.max(1, state.totalTokensInRace)) * 100)),
        currentCpm: Math.round(correctCharacters / elapsedMinutes),
      };
      const message: RaceMessage = { type: 'PROGRESS_UPDATE', progress };
      state.role === 'host' ? broadcast(message) : sendToHost(message);
      if (state.role === 'host') touchSession();

      const nextIndex = tokens.findIndex((item, index) => index > state.activeTokenIndex && item.userAnswer === undefined);
      const wrappedIndex = nextIndex >= 0 ? nextIndex : tokens.findIndex((item) => item.userAnswer === undefined);
      set({
        questions,
        activeTokenIndex: wrappedIndex >= 0 ? wrappedIndex : state.activeTokenIndex,
        currentInput: wrappedIndex >= 0 ? tokens[wrappedIndex]?.userAnswer || '' : '',
        isInputErrorShake: !isCorrect,
        myProgress: progress,
        answeredTokensCount: answered,
      });
    },

    nextQuestion: (durationMs) => {
      const state = get();
      if (state.status !== 'racing') return;
      const question = state.questions[state.currentQuestionIndex];
      if (!question) return;
      const tokens = question.tokens.map((token) => ({
        ...token,
        userAnswer: token.userAnswer ?? '',
        isCorrect: token.isCorrect ?? false,
      }));
      const questions = [...state.questions];
      questions[state.currentQuestionIndex] = {
        ...question,
        tokens,
        durationMs: Math.max(durationMs, 500),
        isCompleted: true,
      };
      const isLast = state.currentQuestionIndex >= questions.length - 1;
      if (!isLast) {
        playSound('next', true);
        const answered = questions
          .flatMap((item) => item.tokens)
          .filter((token) => token.userAnswer !== undefined).length;
        const progress: PlayerProgress = {
          ...state.myProgress,
          progressPercent: Math.min(100, Math.round((answered / Math.max(1, state.totalTokensInRace)) * 100)),
        };
        const message: RaceMessage = { type: 'PROGRESS_UPDATE', progress };
        state.role === 'host' ? broadcast(message) : sendToHost(message);
        if (state.role === 'host') touchSession();
        set({
          questions,
          currentQuestionIndex: state.currentQuestionIndex + 1,
          activeTokenIndex: 0,
          currentInput: '',
          isInputErrorShake: false,
          answeredTokensCount: answered,
          myProgress: progress,
        });
        return;
      }

      playSound('complete', true);
      const totalDurationMs = Date.now() - state.startTime;
      const allTokens = questions.flatMap((item) => item.tokens);
      const correctTokens = allTokens.filter((token) => token.isCorrect).length;
      const totalCharactersRead = allTokens
        .filter((token) => token.isCorrect)
        .reduce((sum, token) => sum + token.kanaText.length, 0);
      const durationMinutes = totalDurationMs / 60_000;
      const summary: SessionSummary = {
        totalDurationMs,
        averageDurationPerQuestionMs: Math.round(totalDurationMs / Math.max(1, questions.length)),
        totalTokens: allTokens.length,
        correctTokens,
        accuracyPercentage: Math.round((correctTokens / Math.max(1, allTokens.length)) * 1000) / 10,
        cpm: Math.round((totalCharactersRead / Math.max(0.05, durationMinutes)) * 10) / 10,
        wpm: Math.round((correctTokens / Math.max(0.05, durationMinutes)) * 10) / 10,
      };
      const progress: PlayerProgress = {
        ...state.myProgress,
        progressPercent: 100,
        currentCpm: summary.cpm,
        isFinished: true,
        finishTimeMs: totalDurationMs,
      };
      const message: RaceMessage = { type: 'RACE_FINISHED', progress, summary };
      state.role === 'host' ? broadcast(message) : sendToHost(message);
      if (state.role === 'host') touchSession();
      set((current) => ({
        questions,
        status: current.players.every((player) => player.isFinished) ? 'finished' : 'waiting',
        myProgress: progress,
        summaries: { ...current.summaries, [progress.id]: summary },
        currentInput: '',
      }));
      import('canvas-confetti')
        .then(({ default: confetti }) => confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } }))
        .catch(() => undefined);
    },

    requestRematch: () => {
      const state = get();
      if (state.role === 'host') {
        const expiresAt = Date.now() + SESSION_IDLE_MS;
        const players = allPlayers().map(resetProgress);
        resetToLobby(players, expiresAt);
        broadcast({ type: 'RESET_LOBBY', players, expiresAt });
      } else {
        sendToHost({ type: 'REMATCH_REQUEST' });
      }
    },

    leaveRace: () => {
      const state = get();
      if (state.role === 'guest') sendToHost({ type: 'LEAVE_ROOM', playerId: state.myProgress.id });
      if (state.role === 'host') broadcast({ type: 'ROOM_ERROR', message: 'Host telah menutup room.' });
      clearTimers();
      state.connections.forEach((connection) => connection.close());
      state.peer?.destroy();
      set({
        peer: null,
        connections: [],
        roomId: null,
        role: null,
        status: 'idle',
        players: [],
        summaries: {},
        questions: [],
        currentQuestionIndex: 0,
        activeTokenIndex: 0,
        currentInput: '',
        errorMessage: null,
        isConnecting: false,
        expiresAt: null,
      });
    },

    clearError: () => set({ errorMessage: null }),
  };
});
