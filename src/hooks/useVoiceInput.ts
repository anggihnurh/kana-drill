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

  // Keep latest refs to avoid stale closures in callbacks
  const currentTokenRef = useRef(currentToken);
  currentTokenRef.current = currentToken;
  const onMatchRef = useRef(onMatch);
  onMatchRef.current = onMatch;

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
    recognition.maxAlternatives = 3;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalStr += text;
        } else {
          interimStr += text;
        }
      }

      const activeToken = currentTokenRef.current;
      const cleanFinal = finalStr.trim();
      const cleanInterim = interimStr.trim();

      if (cleanFinal) {
        setTranscript(cleanFinal);
      }
      setInterimTranscript(cleanInterim);

      // Check for match against active target token
      const candidate = cleanFinal || cleanInterim;
      if (candidate && activeToken && lastMatchedTokenId.current !== activeToken.id) {
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
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      // Ignore routine aborts when user navigates or stops
      if (event.error === 'aborted' || event.error === 'no-speech') {
        return;
      }
      console.warn('Speech recognition warning/error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Izin mikrofon ditolak. Izinkan mikrofon di peramban untuk mode suara.');
        setIsListening(false);
      } else {
        setError(`Peringatan suara: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // If still active and not manually stopped, auto-restart to keep listening
      if (!isManuallyStopped.current && isActive) {
        try {
          recognition.start();
        } catch {
          // ignore already started
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      isManuallyStopped.current = true;
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
