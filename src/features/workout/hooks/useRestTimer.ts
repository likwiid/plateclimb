// SPDX-License-Identifier: GPL-3.0-or-later
import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { triggerTimerDone, triggerLight, triggerTick } from '@shared/utils/haptics';
import {
  showRestCompleteNotification,
  updateRestCountdownNotification,
  cancelRestNotification,
  scheduleRestDoneNotification,
} from '@shared/utils/restNotification';
import { playTimerDone } from '@shared/utils/sound';

type UseRestTimerOptions = {
  onTimerDone?: () => void;
};

export function useRestTimer(options: UseRestTimerOptions = {}) {
  const [restTimerEnd, setRestTimerEnd] = useState<number | null>(null);
  const [restRemaining, setRestRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimerDoneRef = useRef(options.onTimerDone);
  onTimerDoneRef.current = options.onTimerDone;

  useEffect(() => {
    if (restTimerEnd === null) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((restTimerEnd - Date.now()) / 1000)
      );
      setRestRemaining(remaining);

      if (remaining <= 0) {
        setRestTimerEnd(null);
        showRestCompleteNotification();
        triggerTimerDone();
        playTimerDone();
        onTimerDoneRef.current?.();
      }
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restTimerEnd]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && restTimerEnd !== null) {
        const remaining = Math.max(0, Math.ceil((restTimerEnd - Date.now()) / 1000));
        setRestRemaining(remaining);
        if (remaining <= 0) {
          setRestTimerEnd(null);
          cancelRestNotification();
          triggerTimerDone();
          playTimerDone();
          onTimerDoneRef.current?.();
        }
      }
    });
    return () => sub.remove();
  }, [restTimerEnd]);

  function skipRestTimer() {
    triggerLight();
    setRestTimerEnd(null);
    cancelRestNotification();
  }

  function addRestTime(ms: number) {
    triggerTick();
    setRestTimerEnd((prev) => {
      if (!prev) return null;
      const newEnd = prev + ms;
      const newRemaining = Math.max(1, Math.ceil((newEnd - Date.now()) / 1000));
      updateRestCountdownNotification(newRemaining);
      scheduleRestDoneNotification(newRemaining);
      return newEnd;
    });
  }

  return {
    restTimerEnd,
    setRestTimerEnd,
    restRemaining,
    skipRestTimer,
    addRestTime,
  };
}
