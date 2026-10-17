// SPDX-License-Identifier: GPL-3.0-or-later
import React from 'react';
import { View, ScrollView, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CustomAlert,
  SectionHeader,
  SegmentedControl,
  SettingToggleRow,
} from '@shared/components';
import { useKeyboardVisible, useResponsive } from '@shared/hooks';
import { usePreferencesStore } from '@shared/stores/preferencesStore';

import { WeekSelector } from './WeekSelector';
import { DangerZoneSection } from './DangerZoneSection';
import { AppInfoSection } from './AppInfoSection';
import { useSettingsData } from '../hooks/useSettingsData';

// ─── Settings Screen ──────────────────────────────────────────────────────

export default function SettingsScreen() {
  const weightUnit = usePreferencesStore((s) => s.weightUnit);
  const setWeightUnit = usePreferencesStore((s) => s.setWeightUnit);
  const defaultIncrement = usePreferencesStore((s) => s.defaultIncrement);
  const setDefaultIncrement = usePreferencesStore((s) => s.setDefaultIncrement);
  const hapticsEnabled = usePreferencesStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = usePreferencesStore((s) => s.setHapticsEnabled);
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const setSoundEnabled = usePreferencesStore((s) => s.setSoundEnabled);
  const currentWeek = usePreferencesStore((s) => s.currentWeek);
  const setCurrentWeek = usePreferencesStore((s) => s.setCurrentWeek);
  const repCounterEnabled = usePreferencesStore((s) => s.repCounterEnabled);
  const setRepCounterEnabled = usePreferencesStore((s) => s.setRepCounterEnabled);

  const { cardPadding } = useResponsive();
  const { keyboardVisible } = useKeyboardVisible();
  const insets = useSafeAreaInsets();

  const {
    exerciseCount,
    totalWeeks,
    showResetAlert,
    setShowResetAlert,
    handleResetData,
  } = useSettingsData();

  return (
    <>
      <CustomAlert
        visible={showResetAlert}
        title="Reset All Data"
        message="This will permanently delete all your workouts and history and set the program up fresh. This cannot be undone."
        buttons={[
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete Everything', style: 'destructive', onPress: handleResetData },
        ]}
        onDismiss={() => setShowResetAlert(false)}
      />
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior="padding"
      >
        <ScrollView
          className="flex-1 bg-background"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={{ paddingHorizontal: cardPadding, paddingTop: 24 }}>
            {/* Weight Unit */}
            <View>
              <SectionHeader title="Weight Unit" />
              <SegmentedControl
                options={['kg' as const, 'lb' as const]}
                selected={weightUnit}
                onSelect={setWeightUnit}
                renderLabel={(v) => (v === 'kg' ? 'Kilograms (kg)' : 'Pounds (lb)')}
              />
            </View>

            {/* Default Increment */}
            <View>
              <SectionHeader title="Default Increment" />
              <SegmentedControl
                options={[1, 1.25, 2.5, 5]}
                selected={defaultIncrement}
                onSelect={setDefaultIncrement}
                renderLabel={(v) => `${v} ${weightUnit}`}
              />
            </View>

            {/* Haptics & Sound */}
            <SettingToggleRow
              icon="hand-left-outline"
              label="Haptic Feedback"
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
            />
            <SettingToggleRow
              icon="volume-medium-outline"
              label="Sound Effects"
              value={soundEnabled}
              onValueChange={setSoundEnabled}
            />
            <SettingToggleRow
              icon="fitness-outline"
              label="Rep Counter"
              value={repCounterEnabled}
              onValueChange={setRepCounterEnabled}
              className="mb-6"
            />

            <WeekSelector
              totalWeeks={totalWeeks}
              currentWeek={currentWeek}
              onSelectWeek={setCurrentWeek}
            />

            <DangerZoneSection
              onResetPress={() => setShowResetAlert(true)}
            />

            <AppInfoSection exerciseCount={exerciseCount} />
          </View>

          {/* Spacer to clear floating tab bar */}
          <View style={{ height: keyboardVisible ? 0 : insets.bottom + 90 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
