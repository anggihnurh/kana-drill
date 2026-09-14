import { create } from 'zustand';
import Peer, { DataConnection } from 'peerjs';
import { Question, QuestionRecord, SessionSummary } from '../types/drill';
import { PlayerProgress, RaceMessage, RaceRole, RaceStatus } from '../types/race';
import { generateSessionQuestions } from '../lib/drillGenerator';
import { isRomajiMatch } from '../lib/romajiValidator';
import { playSound } from '../lib/soundEffects';
import { DEFAULT_CONFIG } from './useDrillStore';

interface RaceState {
  // Network & Room
  peer: Peer | null;
  connection: DataConnection | null;
  roomId: string | null;
  role: RaceRole | null;
  status: RaceStatus;
  errorMessage: string | null;
  isConnecting: boolean;

  // Players
  myName: string;
  opponentName: string | null;
  myProgress: PlayerProgress;
  opponentProgress: PlayerProgress | null;
  mySummary: SessionSummary | null;
  opponentSummary: SessionSummary | null;

  // Drill State in Race
  questions: Question[];
  currentQuestionIndex: number;
  activeTokenIndex: number;
  currentInput: string;
  isInputErrorShake: boolean;
  countdown: number;
  startTime: number;
  totalTokensInRace: number;
  answeredTokensCount: number;

  // Actions
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

const INITIAL_PROGRESS: PlayerProgress = {
  id: '',
  name: '',
  progressPercent: 0,
  currentCpm: 0,
  isFinished: false,
};

export const useRaceStore = create<RaceState>((set, get) => {
  // Helper to send typed message to peer
  const sendMessage = (msg: RaceMessage) => {
    const conn = get().connection;
    if (conn && conn.open) {
      conn.send(msg);
    }
  };

  // Helper to handle incoming peer messages
  const setupConnectionListeners = (conn: DataConnection) => {
    conn.on('data', (data: unknown) => {
      const msg = data as RaceMessage;
      if (!msg || !msg.type) return;

      const state = get();

      switch (msg.type) {
        case 'JOIN_LOBBY': {
          set({
            opponentName: msg.name,
            opponentProgress: {
              id: conn.peer,
              name: msg.name,
              progressPercent: 0,
              currentCpm: 0,
              isFinished: false,
            },
            status: 'lobby',
          });
          // If host, reply with LOBBY_ACK so guest knows host's name
          if (state.role === 'host') {
            sendMessage({ type: 'LOBBY_ACK', name: state.myName });
          }
          break;
        }

        case 'LOBBY_ACK': {
          set({
            opponentName: msg.name,
            opponentProgress: {
              id: conn.peer,
              name: msg.name,
              progressPercent: 0,
              currentCpm: 0,
              isFinished: false,
            },
            status: 'lobby',
          });
          break;
        }

        case 'START_COUNTDOWN': {
          // Guest receives questions & start time from Host
          const totalTokens = msg.questions.reduce((acc, q) => acc + q.tokens.length, 0);
          set({
            questions: msg.questions,
            totalTokensInRace: totalTokens,
            status: 'countdown',
            countdown: 3,
            currentQuestionIndex: 0,
            activeTokenIndex: 0,
            currentInput: '',
            answeredTokensCount: 0,
            myProgress: {
              ...get().myProgress,
              progressPercent: 0,
              currentCpm: 0,
              isFinished: false,
            },
            opponentProgress: {
              ...get().opponentProgress!,
              progressPercent: 0,
              currentCpm: 0,
              isFinished: false,
            },
            mySummary: null,
            opponentSummary: null,
          });

          // Run 3-second countdown
          let count = 3;
          const interval = setInterval(() => {
            count -= 1;
            if (count > 0) {
              set({ countdown: count });
              playSound('click', true);
            } else {
              clearInterval(interval);
              set({
                status: 'racing',
                countdown: 0,
                startTime: Date.now(),
              });
              playSound('correct', true);
            }
          }, 1000);
          break;
        }

        case 'PROGRESS_UPDATE': {
          set({ opponentProgress: msg.progress });
          break;
        }

        case 'RACE_FINISHED': {
          set({
            opponentSummary: msg.summary,
            opponentProgress: {
              ...get().opponentProgress!,
              isFinished: true,
              progressPercent: 100,
            },
          });
          break;
        }

        case 'REMATCH': {
          set({
            status: 'lobby',
            mySummary: null,
            opponentSummary: null,
          });
          break;
        }

        case 'LEAVE_ROOM': {
          set({
            opponentName: null,
            opponentProgress: null,
            errorMessage: 'Lawan telah meninggalkan sesi balapan.',
          });
          break;
        }
      }
    });

    conn.on('close', () => {
      set({
        opponentName: null,
        opponentProgress: null,
        errorMessage: 'Koneksi dengan lawan terputus.',
      });
    });

    conn.on('error', (err) => {
      console.error('Peer connection error:', err);
      set({ errorMessage: 'Terjadi gangguan koneksi dengan lawan.' });
    });
  };

  return {
    peer: null,
    connection: null,
    roomId: null,
    role: null,
    status: 'idle',
    errorMessage: null,
    isConnecting: false,

    myName: localStorage.getItem('kana_player_name') || 'Pembalap Kana',
    opponentName: null,
    myProgress: INITIAL_PROGRESS,
    opponentProgress: null,
    mySummary: null,
    opponentSummary: null,

    questions: [],
    currentQuestionIndex: 0,
    activeTokenIndex: 0,
    currentInput: '',
    isInputErrorShake: false,
    countdown: 3,
    startTime: 0,
    totalTokensInRace: 0,
    answeredTokensCount: 0,

    setMyName: (name: string) => {
      const trimmed = name.trim() || 'Pembalap Kana';
      localStorage.setItem('kana_player_name', trimmed);
      set({ myName: trimmed });
    },

    createRoom: async (name: string) => {
      get().leaveRace();
      set({ isConnecting: true, errorMessage: null });

      const peerId = `kd_${Math.random().toString(36).substring(2, 8)}`;

      return new Promise<string>((resolve, reject) => {
        try {
          const peer = new Peer(peerId);

          peer.on('open', (id) => {
            set({
              peer,
              roomId: id,
              role: 'host',
              status: 'lobby',
              myName: name,
              isConnecting: false,
              myProgress: {
                id,
                name,
                progressPercent: 0,
                currentCpm: 0,
                isFinished: false,
              },
            });
            resolve(id);
          });

          peer.on('connection', (conn) => {
            conn.on('open', () => {
              set({ connection: conn });
              setupConnectionListeners(conn);
            });
          });

          peer.on('error', (err) => {
            set({ isConnecting: false, errorMessage: `Gagal membuat room: ${err.message}` });
            reject(err);
          });
        } catch (e: unknown) {
          const errorMsg = e instanceof Error ? e.message : 'Gagal menginisialisasi WebRTC';
          set({ isConnecting: false, errorMessage: errorMsg });
          reject(e);
        }
      });
    },

    joinRoom: async (targetRoomId: string, name: string) => {
      get().leaveRace();
      set({ isConnecting: true, errorMessage: null });

      const cleanRoomId = targetRoomId.trim();

      return new Promise<void>((resolve, reject) => {
        try {
          const peer = new Peer();

          peer.on('open', (myId) => {
            const conn = peer.connect(cleanRoomId, { reliable: true });

            conn.on('open', () => {
              set({
                peer,
                connection: conn,
                roomId: cleanRoomId,
                role: 'guest',
                status: 'lobby',
                myName: name,
                isConnecting: false,
                myProgress: {
                  id: myId,
                  name,
                  progressPercent: 0,
                  currentCpm: 0,
                  isFinished: false,
                },
              });
              setupConnectionListeners(conn);
              conn.send({ type: 'JOIN_LOBBY', name });
              resolve();
            });

            conn.on('error', (err) => {
              set({ isConnecting: false, errorMessage: `Gagal terhubung ke room: ${err.message}` });
              reject(err);
            });
          });

          peer.on('error', (err) => {
            set({ isConnecting: false, errorMessage: `Gagal inisialisasi jaringan: ${err.message}` });
            reject(err);
          });
        } catch (e: unknown) {
          const errorMsg = e instanceof Error ? e.message : 'Gagal bergabung ke room';
          set({ isConnecting: false, errorMessage: errorMsg });
          reject(e);
        }
      });
    },

    startRaceCountdown: () => {
      const state = get();
      if (state.role !== 'host') return;

      const questions = generateSessionQuestions(DEFAULT_CONFIG);
      const totalTokens = questions.reduce((acc, q) => acc + q.tokens.length, 0);

      // Broadcast to guest
      sendMessage({
        type: 'START_COUNTDOWN',
        questions,
        startTime: Date.now() + 3000,
      });

      set({
        questions,
        totalTokensInRace: totalTokens,
        status: 'countdown',
        countdown: 3,
        currentQuestionIndex: 0,
        activeTokenIndex: 0,
        currentInput: '',
        answeredTokensCount: 0,
        myProgress: {
          ...state.myProgress,
          progressPercent: 0,
          currentCpm: 0,
          isFinished: false,
        },
        mySummary: null,
        opponentSummary: null,
      });

      // Host runs countdown
      let count = 3;
      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          set({ countdown: count });
          playSound('click', true);
        } else {
          clearInterval(interval);
          set({
            status: 'racing',
            countdown: 0,
            startTime: Date.now(),
          });
          playSound('correct', true);
        }
      }, 1000);
    },

    setInput: (value: string) => {
      const state = get();
      if (state.status !== 'racing') return;

      const currentQ = state.questions[state.currentQuestionIndex];
      if (!currentQ) return;
      const currentToken = currentQ.tokens[state.activeTokenIndex];
      if (!currentToken) return;

      const trimmed = value.trim();
      if (trimmed && isRomajiMatch(trimmed, currentToken.expectedRomaji, currentToken.kanaText)) {
        get().submitCurrentToken(trimmed);
        return;
      }

      set({ currentInput: value, isInputErrorShake: false });
    },

    selectToken: (index: number) => {
      const state = get();
      if (state.status !== 'racing') return;
      const currentQ = state.questions[state.currentQuestionIndex];
      if (!currentQ || index < 0 || index >= currentQ.tokens.length) return;

      set({
        activeTokenIndex: index,
        currentInput: currentQ.tokens[index]?.userAnswer || '',
        isInputErrorShake: false,
      });
    },

    submitCurrentToken: (overrideValue?: string) => {
      const state = get();
      if (state.status !== 'racing') return;

      const currentQ = state.questions[state.currentQuestionIndex];
      if (!currentQ) return;
      const currentToken = currentQ.tokens[state.activeTokenIndex];
      if (!currentToken) return;

      const inputVal = (overrideValue !== undefined ? overrideValue : state.currentInput).trim();
      if (!inputVal) return;

      const isCorrect = isRomajiMatch(inputVal, currentToken.expectedRomaji, currentToken.kanaText);

      if (isCorrect) {
        playSound('correct', true);
      } else {
        playSound('wrong', true);
      }

      // Update token in question
      const updatedTokens = [...currentQ.tokens];
      updatedTokens[state.activeTokenIndex] = {
        ...currentToken,
        userAnswer: inputVal,
        isCorrect,
      };

      const updatedQuestions = [...state.questions];
      updatedQuestions[state.currentQuestionIndex] = {
        ...currentQ,
        tokens: updatedTokens,
      };

      // Calculate new progress percent
      let totalAnswered = 0;
      let totalCorrectChars = 0;
      for (const q of updatedQuestions) {
        for (const t of q.tokens) {
          if (t.userAnswer !== undefined) totalAnswered++;
          if (t.isCorrect) totalCorrectChars += t.kanaText.length;
        }
      }

      const elapsedMinutes = Math.max(0.05, (Date.now() - state.startTime) / 60000);
      const currentCpm = Math.round(totalCorrectChars / elapsedMinutes);
      const progressPercent = Math.min(
        100,
        Math.round((totalAnswered / Math.max(1, state.totalTokensInRace)) * 100)
      );

      const updatedProgress: PlayerProgress = {
        ...state.myProgress,
        progressPercent,
        currentCpm,
      };

      // Broadcast progress update to opponent
      sendMessage({
        type: 'PROGRESS_UPDATE',
        progress: updatedProgress,
      });

      // Find next token in current question
      let nextIndex = -1;
      for (let i = state.activeTokenIndex + 1; i < currentQ.tokens.length; i++) {
        if (updatedTokens[i].userAnswer === undefined) {
          nextIndex = i;
          break;
        }
      }
      if (nextIndex === -1) {
        for (let i = 0; i < state.activeTokenIndex; i++) {
          if (updatedTokens[i].userAnswer === undefined) {
            nextIndex = i;
            break;
          }
        }
      }

      if (nextIndex !== -1) {
        set({
          questions: updatedQuestions,
          activeTokenIndex: nextIndex,
          currentInput: updatedTokens[nextIndex]?.userAnswer || '',
          isInputErrorShake: !isCorrect,
          myProgress: updatedProgress,
          answeredTokensCount: totalAnswered,
        });
      } else {
        set({
          questions: updatedQuestions,
          currentInput: '',
          isInputErrorShake: !isCorrect,
          myProgress: updatedProgress,
          answeredTokensCount: totalAnswered,
        });
      }
    },

    nextQuestion: (durationMs: number) => {
      const state = get();
      if (state.status !== 'racing') return;

      const currentQ = state.questions[state.currentQuestionIndex];
      if (!currentQ) return;

      // Unanswered tokens marked false
      const updatedTokens = currentQ.tokens.map((t) => ({
        ...t,
        userAnswer: t.userAnswer ?? '',
        isCorrect: t.isCorrect ?? false,
      }));

      const updatedQuestions = [...state.questions];
      updatedQuestions[state.currentQuestionIndex] = {
        ...currentQ,
        tokens: updatedTokens,
        durationMs: Math.max(durationMs, 500),
        isCompleted: true,
      };

      const isLastQuestion = state.currentQuestionIndex >= state.questions.length - 1;

      if (!isLastQuestion) {
        playSound('next', true);
        set({
          questions: updatedQuestions,
          currentQuestionIndex: state.currentQuestionIndex + 1,
          activeTokenIndex: 0,
          currentInput: '',
          isInputErrorShake: false,
        });
      } else {
        // FINISHED THE RACE!
        playSound('complete', true);
        const totalDurationMs = Date.now() - state.startTime;

        let correctTokens = 0;
        let totalTokens = 0;
        let totalCharactersRead = 0;
        const questionRecords: QuestionRecord[] = [];

        for (const q of updatedQuestions) {
          let qCorrect = 0;
          for (const t of q.tokens) {
            if (t.isCorrect) qCorrect++;
            totalCharactersRead += t.kanaText.length;
          }
          correctTokens += qCorrect;
          totalTokens += q.tokens.length;
          questionRecords.push({
            questionNumber: q.questionNumber,
            durationMs: q.durationMs,
            correctCount: qCorrect,
            totalCount: q.tokens.length,
            tokens: q.tokens,
          });
        }

        const durationMinutes = totalDurationMs / 60000;
        const cpm = Math.round((totalCharactersRead / Math.max(0.05, durationMinutes)) * 10) / 10;
        const wpm = Math.round((correctTokens / Math.max(0.05, durationMinutes)) * 10) / 10;
        const accuracyPercentage = Math.round((correctTokens / Math.max(1, totalTokens)) * 1000) / 10;

        const summary: SessionSummary = {
          totalDurationMs,
          averageDurationPerQuestionMs: Math.round(totalDurationMs / updatedQuestions.length),
          totalTokens,
          correctTokens,
          accuracyPercentage,
          cpm,
          wpm,
        };

        const finalProgress: PlayerProgress = {
          ...state.myProgress,
          progressPercent: 100,
          currentCpm: cpm,
          isFinished: true,
          finishTimeMs: totalDurationMs,
        };

        // Notify opponent
        sendMessage({ type: 'RACE_FINISHED', summary });
        sendMessage({ type: 'PROGRESS_UPDATE', progress: finalProgress });

        // Trigger confetti
        import('canvas-confetti')
          .then(({ default: confetti }) => {
            confetti({
              particleCount: 120,
              spread: 90,
              origin: { y: 0.6 },
            });
          })
          .catch(() => {});

        set({
          questions: updatedQuestions,
          status: 'finished',
          mySummary: summary,
          myProgress: finalProgress,
          currentInput: '',
        });
      }
    },

    requestRematch: () => {
      sendMessage({ type: 'REMATCH' });
      set({
        status: 'lobby',
        mySummary: null,
        opponentSummary: null,
        myProgress: {
          ...get().myProgress,
          progressPercent: 0,
          currentCpm: 0,
          isFinished: false,
        },
        opponentProgress: get().opponentProgress
          ? {
              ...get().opponentProgress!,
              progressPercent: 0,
              currentCpm: 0,
              isFinished: false,
            }
          : null,
      });
    },

    leaveRace: () => {
      const state = get();
      if (state.connection) {
        state.connection.send({ type: 'LEAVE_ROOM' });
        state.connection.close();
      }
      if (state.peer) {
        state.peer.destroy();
      }

      set({
        peer: null,
        connection: null,
        roomId: null,
        role: null,
        status: 'idle',
        opponentName: null,
        opponentProgress: null,
        mySummary: null,
        opponentSummary: null,
        questions: [],
        currentQuestionIndex: 0,
        activeTokenIndex: 0,
        currentInput: '',
        errorMessage: null,
        isConnecting: false,
      });
    },

    clearError: () => {
      set({ errorMessage: null });
    },
  };
});
