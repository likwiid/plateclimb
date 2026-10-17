// SPDX-License-Identifier: GPL-3.0-or-later
import { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerTick } from '@shared/utils/haptics';
import { colors } from '@shared/theme';
import { useRepCountTimer } from '../hooks/useRepCountTimer';
import { getRepTempo, TEMPO_OPTIONS } from '../utils/repTempo';
import { styles } from './setInputStyles';

// ─── Types ────────────────────────────────────────────────────────────────

interface RepCounterProps {
  exerciseName: string;
  exerciseEquipment: string;
  onRepCount: (count: number) => void;
  onStop: () => void;
  isRunningRef: React.MutableRefObject<boolean>;
}

// ─── Component ────────────────────────────────────────────────────────────

export function RepCounter({
  exerciseName,
  exerciseEquipment,
  onRepCount,
  onStop,
  isRunningRef,
}: RepCounterProps) {
  const autoTempo = getRepTempo(exerciseName, exerciseEquipment);
  const [tempoOverride, setTempoOverride] = useState<number | null>(null);
  const activeTempo = tempoOverride ?? autoTempo;

  useEffect(() => {
    setTempoOverride(null);
  }, [exerciseName]);

  const { isRunning, count, start, stop, reset } = useRepCountTimer({
    tempo: activeTempo,
    onCount: onRepCount,
  });

  // Expose running state to parent
  isRunningRef.current = isRunning;

  useEffect(() => {
    return () => { stop(); };
  }, []);

  function handleStop() {
    stop();
    onStop();
  }

  return (
    <View className="items-center mb-5">
      {/* Count display */}
      <View style={[styles.counterCircle, isRunning && styles.counterCircleActive]}>
        <Text style={styles.counterCount}>{count}</Text>
        <Text style={[styles.counterLabel, isRunning && styles.counterLabelActive]}>
          {isRunning ? 'COUNTING' : 'READY'}
        </Text>
      </View>

      {/* Start / Stop button */}
      <View className="flex-row items-center gap-3 mt-3">
        {!isRunning ? (
          <Pressable
            onPress={start}
            style={({ pressed }: { pressed: boolean }) => [
              styles.counterActionButton,
              styles.counterStartButton,
              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
            ]}
          >
            <Ionicons name="play" size={16} color={colors.text.white} />
            <Text style={styles.counterActionText}>Start</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleStop}
            style={({ pressed }: { pressed: boolean }) => [
              styles.counterActionButton,
              styles.counterStopButton,
              pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
            ]}
          >
            <Ionicons name="stop" size={16} color={colors.text.white} />
            <Text style={styles.counterActionText}>Stop</Text>
          </Pressable>
        )}
        {count > 0 && !isRunning && (
          <Pressable
            onPress={reset}
            style={({ pressed }: { pressed: boolean }) => [
              styles.counterResetButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="refresh" size={14} color={colors.text.muted} />
            <Text style={{ color: colors.text.muted, fontSize: 12, fontWeight: '600' }}>Reset</Text>
          </Pressable>
        )}
      </View>

      {/* Tempo selector */}
      <View className="flex-row items-center mt-3 gap-1">
        <Text style={{ color: colors.text.muted, fontSize: 10, marginRight: 4 }}>TEMPO</Text>
        {TEMPO_OPTIONS.map((t) => (
          <Pressable
            key={t}
            onPress={() => {
              triggerTick();
              setTempoOverride(t === autoTempo ? null : t);
            }}
            style={[
              styles.tempoChip,
              activeTempo === t && styles.tempoChipActive,
            ]}
          >
            <Text style={[
              styles.tempoChipText,
              activeTempo === t && styles.tempoChipTextActive,
            ]}>
              {t}s
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
