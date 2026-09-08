import { useEffect, useRef, useState, useCallback } from 'react';

interface UseStopwatchProps {
  isRunning: boolean;
  questionIndex: number;
}

/**
 * High-Performance Stopwatch Hook (Vercel React Best Practices)
 * - Eliminates effect teardown loops by removing state dependencies from useEffect.
 * - Utilizes high-precision performance.now() and requestAnimationFrame.
 * - Throttles state updates to ~50ms for smooth 20fps timer badge display without CPU waste.
 * - Provides getCurrentElapsed() for instantaneous 0-latency submission precision.
 */
export function useStopwatch({ isRunning, questionIndex }: UseStopwatchProps) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(isRunning);

  // Sync isRunningRef
  isRunningRef.current = isRunning;

  // Reset timer saat berpindah soal
  useEffect(() => {
    setElapsedMs(0);
    accumulatedRef.current = 0;
    lastUpdateRef.current = 0;
    if (isRunning) {
      startTimeRef.current = performance.now();
    }
  }, [questionIndex]); // Only depend on questionIndex

  useEffect(() => {
    if (!isRunning) {
      if (startTimeRef.current > 0) {
        accumulatedRef.current += performance.now() - startTimeRef.current;
        startTimeRef.current = 0;
      }
      return;
    }

    startTimeRef.current = performance.now();
    let animFrameId: number;

    const updateTimer = (now: number) => {
      if (!isRunningRef.current) return;

      const currentDelta = now - startTimeRef.current;
      const total = accumulatedRef.current + currentDelta;

      // Throttle UI state update to ~50ms (20fps) for display
      if (now - lastUpdateRef.current >= 50) {
        lastUpdateRef.current = now;
        setElapsedMs(total);
      }

      animFrameId = requestAnimationFrame(updateTimer);
    };

    animFrameId = requestAnimationFrame(updateTimer);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isRunning]); // Only depend on isRunning, NOT elapsedMs!

  // Precise instantaneous elapsed time getter (bypassing render throttle)
  const getCurrentElapsed = useCallback(() => {
    if (!isRunningRef.current || startTimeRef.current === 0) {
      return accumulatedRef.current;
    }
    return accumulatedRef.current + (performance.now() - startTimeRef.current);
  }, []);

  return { elapsedMs, getCurrentElapsed };
}
