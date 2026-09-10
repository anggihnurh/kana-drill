import { useState, useEffect, useRef, useCallback } from 'react';
import { isVoiceMatch } from '../lib/romajiValidator';
import { TokenItem } from '../types/drill';

interface UseVoiceInputProps {
  currentToken?: TokenItem;
  isActive: boolean;
  onMatch: (spokenText: string) => void;
}

export function useVoiceInput({ currentToken, isActive, onMatch }: UseVoiceInputProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const isManuallyStopped = useRef(false);
  const lastMatchedTokenId = useRef<string | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep latest refs to avoid stale closures in callbacks
  const currentTokenRef = useRef(currentToken);
  currentTokenRef.current = currentToken;
  const onMatchRef = useRef(onMatch);
  onMatchRef.current = onMatch;

  // Clear live transcripts when token shifts to fresh card
  useEffect(() => {
    setTranscript('');
    setInterimTranscript('');
  }, [currentToken?.id]);

  useEffect(() => {
    // Check Web Speech API support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ja-JP'; // Optimized for Japanese kana & words recognition
    recognition.maxAlternatives = 5; // Maximize candidate alternative coverage

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const activeToken = currentTokenRef.current;
      if (!activeToken) return;

      const candidates: string[] = [];
      let latestDisplayFinal = '';
      let latestDisplayInterim = '';

      // Extract all alternatives from the current result segment
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (!result) continue;

        for (let j = 0; j < result.length; ++j) {
          const alt = result[j];
          if (alt && alt.transcript) {
            const tr = alt.transcript.trim();
            if (tr) {
              candidates.push(tr);
            }
          }
        }

        if (result.isFinal) {
          latestDisplayFinal += result[0]?.transcript || '';
        } else {
          latestDisplayInterim += result[0]?.transcript || '';
        }
      }

      if (latestDisplayFinal.trim()) {
        setTranscript(latestDisplayFinal.trim());
      }
      setInterimTranscript(latestDisplayInterim.trim());

      // Evaluate candidates against active target token
      if (lastMatchedTokenId.current !== activeToken.id) {
        for (const candidate of candidates) {
          const matches = isVoiceMatch(
            candidate,
            activeToken.expectedRomaji,
            activeToken.kanaText
          );

          if (matches) {
            lastMatchedTokenId.current = activeToken.id;
            setTranscript(candidate);
            setInterimTranscript('');
            onMatchRef.current(candidate);
            break;
          }
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      // Ignore routine non-fatal aborts or transient silence
      if (event.error === 'aborted' || event.error === 'no-speech') {
        return;
      }
      console.warn('Speech recognition status:', event.error);
      if (event.error === 'not-allowed') {
        setError('Izin mikrofon ditolak. Izinkan akses mikrofon di peramban untuk mode suara.');
        setIsListening(false);
      } else if (event.error !== 'network') {
        setError(`Peringatan suara: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // If still active and not manually stopped, auto-restart with brief debounce
      if (!isManuallyStopped.current && isActive) {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch {
            // safe fallback if already started
          }
        }, 80);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isManuallyStopped.current = true;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, [isActive]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    setError(null);
    isManuallyStopped.current = false;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // already running
      setIsListening(true);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    isManuallyStopped.current = true;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Auto-start when active in voice mode
  useEffect(() => {
    if (isActive && isSupported && !isListening && !isManuallyStopped.current) {
      startListening();
    } else if (!isActive && isListening) {
      stopListening();
    }
  }, [isActive, isSupported, isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}
