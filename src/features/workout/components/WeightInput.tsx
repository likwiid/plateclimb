// SPDX-License-Identifier: GPL-3.0-or-later
import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { triggerTick, triggerSelection } from '@shared/utils/haptics';
import { colors } from '@shared/theme';
import type { SetState } from '../types';
import { StepButton } from './StepButton';
import { styles } from './setInputStyles';

// ─── Types ────────────────────────────────────────────────────────────────

interface WeightInputProps {
  currentSet: SetState;
  displayUnit: string;
  defaultIncrement: number;
  isSupported?: boolean;
  onUpdateWeight: (value: number) => void;
  onToggleUnit?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────

export function WeightInput({
  currentSet,
  displayUnit,
  defaultIncrement,
  isSupported,
  onUpdateWeight,
  onToggleUnit,
}: WeightInputProps) {
  const [editingWeight, setEditingWeight] = useState(false);
  const [weightText, setWeightText] = useState('');
  const weightInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (editingWeight) {
      setTimeout(() => weightInputRef.current?.focus(), 50);
    }
  }, [editingWeight]);

  function handleWeightTap() {
    triggerSelection();
    setWeightText(String(currentSet.weight));
    setEditingWeight(true);
  }

  function handleWeightChange(text: string) {
    setWeightText(text);
    const parsed = parseFloat(text);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateWeight(parsed);
    }
  }

  function handleWeightBlur() {
    const parsed = parseFloat(weightText);
    if (isNaN(parsed) || parsed < 0) {
      setWeightText(String(currentSet.weight));
    }
    setEditingWeight(false);
  }

  const weightLabel = isSupported
    ? `Assist Weight (${displayUnit})`
    : `Weight (${displayUnit})`;

  return (
    <>
      <View className="flex-row items-center mb-2">
        <Text className="text-text-muted text-xs uppercase tracking-wider">
          {weightLabel}
        </Text>
        {onToggleUnit && (
          <Pressable
            onPress={() => {
              triggerSelection();
              onToggleUnit();
            }}
            style={styles.unitToggle}
          >
            <Ionicons name="swap-horizontal" size={12} color={colors.indigoLight} />
            <Text style={styles.unitToggleText}>
              {displayUnit === 'kg' ? 'lb' : 'kg'}
            </Text>
          </Pressable>
        )}
      </View>
      <View className="flex-row items-center justify-between mb-5">
        <StepButton
          label={`-${defaultIncrement * 2}`}
          onPress={() => {
            triggerTick();
            onUpdateWeight(Math.max(0, currentSet.weight - defaultIncrement * 2));
          }}
        />
        <StepButton
          label={`-${defaultIncrement}`}
          onPress={() => {
            triggerTick();
            onUpdateWeight(Math.max(0, currentSet.weight - defaultIncrement));
          }}
        />
        <Pressable className="flex-1 mx-2 items-center" onPress={handleWeightTap}>
          {editingWeight ? (
            <TextInput
              ref={weightInputRef}
              value={weightText}
              onChangeText={handleWeightChange}
              onBlur={handleWeightBlur}
              onSubmitEditing={handleWeightBlur}
              keyboardType="decimal-pad"
              selectTextOnFocus
              style={styles.weightInput}
            />
          ) : (
            <View className="flex-row items-center">
              <Text
                className="text-text-primary text-5xl font-bold"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                {currentSet.weight}
              </Text>
            </View>
          )}
        </Pressable>
        <StepButton
          label={`+${defaultIncrement}`}
          onPress={() => {
            triggerTick();
            onUpdateWeight(currentSet.weight + defaultIncrement);
          }}
        />
        <StepButton
          label={`+${defaultIncrement * 2}`}
          onPress={() => {
            triggerTick();
            onUpdateWeight(currentSet.weight + defaultIncrement * 2);
          }}
        />
      </View>
    </>
  );
}
