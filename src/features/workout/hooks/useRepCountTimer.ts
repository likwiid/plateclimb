// SPDX-License-Identifier: GPL-3.0-or-later
import { useState, useEffect, useRef, useCallback } from 'react';
import { speakNumber, stopSpeaking } from '@shared/utils/speech';
import { triggerMedium } from '@shared/utils/haptics';

interface UseRepCountTimerOptions {
  tempo: number;
  maxReps?: number;
  onCount?: (count: number) => void;
}

export function useRepCountTimer({ tempo, maxReps = 50, onCount }: UseRepCountTimerOptions) {
  const [isRunning, setIsRunning] = useState(false);
  const [count, setCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextTickRef = useRef(0);
  const countRef = useRef(0);
  const onCountRef = useRef(onCount);
  const tempoRef = useRef(tempo);
  onCountRef.current = onCount;
  tempoRef.current = tempo;

  const tick = useCallback(() => {
    const next = countRef.current + 1;
    countRef.current = next;
    setCount(next);

    triggerMedium();
    speakNumber(next);

    onCountRef.current?.(next);

    if (next >= maxReps) {
      stop();
    }
  }, [maxReps]);

  const start = useCallback(() => {
    countRef.current = 0;
    setCount(0);
    setIsRunning(true);

    nextTickRef.current = Date.now() + tempoRef.current * 1000;

    intervalRef.current = setInterval(() => {
      if (Date.now() >= nextTickRef.current) {
        tick();
        nextTickRef.current = Date.now() + tempoRef.current * 1000;
      }
    }, 100);
  }, [tick]);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopSpeaking();
  }, []);

  const reset = useCallback(() => {
    stop();
    countRef.current = 0;
    setCount(0);
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopSpeaking();
    };
  }, []);

  return { isRunning, count, start, stop, reset };
}
