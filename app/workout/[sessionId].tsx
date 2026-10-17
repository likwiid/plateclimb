// SPDX-License-Identifier: GPL-3.0-or-later
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  ExerciseHeader,
  ExerciseNavigator,
  PRCard,
  RestTimer,
  SetInputControls,
  SetRow,
  SubstitutionModal,
  WorkoutTopBar,
  useActiveWorkout,
  ANIM_FADE_IN,
  isSupportedWeight,
} from '@features/workout';

import { CustomAlert } from '@shared/components';
import { routes } from '@shared/constants';
import { getExtraCategories } from '@shared/db/repositories/programRepo';
import { useKeyboardVisible, useResponsive } from '@shared/hooks';
import { colors } from '@shared/theme';

export default function ActiveWorkoutScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sid = parseInt(sessionId!, 10);
  const { buttonHeight, cardPadding } = useResponsive();
  const { keyboardVisible } = useKeyboardVisible();

  const {
    session,
    prCard,
    dismissPrCard,
    lastCompletedSetIdx,
    setCardPulseStyle,
    restPulseStyle,
    timerProgress,
    onCompleteSet,
    onFinish,
  } = useActiveWorkout(sid);

  const {
    exercises,
    currentExIdx,
    setCurrentSetIdx,
    elapsedSeconds,
    restTimerEnd,
    restRemaining,
    showSubModal,
    setShowSubModal,
    substitutions,
    isLoaded,
    exerciseKey,
    alertConfig,
    dismissAlert,
    currentEx,
    currentSet,
    allDone,
    totalSets,
    completedSets,
    weightUnit,
    defaultIncrement,
    handleSkipSet,
    handleSwap,
    handleSelectSub,
    handleSkipWarmup,
    handleRevertSet,
    handleUndoLastSet,
    handleRestartDay,
    goExercise,
    goToExercise,
    skipRestTimer,
    addRestTime,
    formatElapsedTime,
    updateSet,
    getExerciseUnit,
    toggleExerciseUnit,
    addExtras,
  } = session;

  if (!isLoaded || !currentEx || !currentSet) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-muted">Loading workout...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={dismissAlert}
      />
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior="padding"
      >
        <WorkoutTopBar
          elapsedFormatted={formatElapsedTime(elapsedSeconds)}
          completedSets={completedSets}
          totalSets={totalSets}
          topInset={insets.top}
          onRestart={handleRestartDay}
          onUndo={handleUndoLastSet}
          onFinish={onFinish}
        />

        <ExerciseHeader
          exercise={currentEx}
          currentSetIdx={session.currentSetIdx}
          exerciseKey={exerciseKey}
          onExercisePress={() => router.push(routes.exercise(currentEx.actualExerciseId))}
          onSwapPress={handleSwap}
          onSkipWarmup={handleSkipWarmup}
        />

        {prCard && <PRCard key={prCard.id} card={prCard} onDismiss={dismissPrCard} />}

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <Animated.View
            key={`sets-${exerciseKey}`}
            entering={FadeIn.duration(ANIM_FADE_IN)}
            className="mb-4"
          >
            {currentEx.sets.map((set, idx) => (
              <SetRow
                key={idx}
                set={set}
                index={idx}
                isCurrent={idx === session.currentSetIdx}
                weightUnit={weightUnit}
                pulseStyle={lastCompletedSetIdx.current === idx ? setCardPulseStyle : undefined}
                onSelect={() => setCurrentSetIdx(idx)}
                onRevert={() => handleRevertSet(currentExIdx, idx)}
              />
            ))}
          </Animated.View>

          {!currentSet.completed && !currentSet.skipped && (
            <SetInputControls
              currentSet={currentSet}
              weightUnit={weightUnit}
              defaultIncrement={defaultIncrement}
              buttonHeight={buttonHeight}
              cardPadding={cardPadding}
              onUpdateSet={updateSet}
              onComplete={onCompleteSet}
              onSkip={handleSkipSet}
              exerciseUnit={getExerciseUnit(currentExIdx)}
              onToggleUnit={() => toggleExerciseUnit(currentExIdx)}
              isSupportedWeight={isSupportedWeight(currentEx.actualExerciseName)}
              exerciseName={currentEx.actualExerciseName}
              exerciseEquipment={currentEx.equipment}
            />
          )}

          {allDone && (
            <>
              <View className="mb-4">
                <Text className="text-text-muted text-xs uppercase tracking-wider mb-2">
                  Add extras before finishing?
                </Text>
                <View className="flex-row gap-3">
                  {getExtraCategories().map((cat) => (
                    <Pressable
                      key={cat.key}
                      onPress={() => addExtras(cat.key)}
                      style={({ pressed }: { pressed: boolean }) => [
                        {
                          flex: 1,
                          flexDirection: 'row' as const,
                          alignItems: 'center' as const,
                          justifyContent: 'center' as const,
                          paddingVertical: 12,
                          paddingHorizontal: 10,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: colors.border.light,
                          backgroundColor: colors.bg.surface,
                          gap: 6,
                        },
                        pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
                      ]}
                    >
                      <Ionicons name={cat.icon} size={18} color={colors.text.muted} />
                      <Text style={{ color: colors.text.secondary, fontWeight: '600', fontSize: 13 }}>
                        {cat.label}
                      </Text>
                      <Ionicons name="add-circle-outline" size={18} color={colors.border.light} />
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                onPress={onFinish}
                className="bg-success rounded-xl items-center justify-center mb-4"
                style={({ pressed }: { pressed: boolean }) => [
                  { minHeight: buttonHeight },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                ]}
              >
                <Text className="text-white font-bold text-lg">
                  Finish Workout
                </Text>
              </Pressable>
            </>
          )}

          <View className="h-8" />
        </ScrollView>

        <ExerciseNavigator
          exercises={exercises}
          currentExIdx={currentExIdx}
          bottomInset={insets.bottom}
          keyboardVisible={keyboardVisible}
          onPrev={() => goExercise('prev')}
          onNext={() => goExercise('next')}
          onGoToExercise={goToExercise}
        />

        {restTimerEnd !== null && restRemaining > 0 && (
          <RestTimer
            restRemaining={restRemaining}
            timerProgress={timerProgress}
            pulseStyle={restPulseStyle}
            bottomInset={insets.bottom}
            onSkip={skipRestTimer}
            onAddTime={addRestTime}
          />
        )}

        <SubstitutionModal
          visible={showSubModal}
          substitutions={substitutions}
          bottomInset={insets.bottom}
          onSelect={handleSelectSub}
          onClose={() => setShowSubModal(false)}
        />
      </KeyboardAvoidingView>
    </>
  );
}
