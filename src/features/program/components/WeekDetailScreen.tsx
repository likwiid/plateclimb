// SPDX-License-Identifier: GPL-3.0-or-later
import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedPressable } from "@shared/components";
import { routes } from "@shared/constants";
import { getDaysForWeek, type DayRow } from "@shared/db/repositories/programRepo";
import { markDayComplete } from "@shared/db/repositories/workoutRepo";
import { useResponsive } from "@shared/hooks";
import { colors } from "@shared/theme";
import { DAY_TYPE_COLORS, triggerLight, triggerMedium } from "@shared/utils";

export default function WeekDetailScreen() {
  const { weekNumber } = useLocalSearchParams<{ weekNumber: string }>();
  const router = useRouter();
  const [days, setDays] = useState<DayRow[]>([]);
  const weekNum = parseInt(weekNumber!, 10);
  const { isWide } = useResponsive();
  const insets = useSafeAreaInsets();

  const loadDays = useCallback(async () => {
    setDays(await getDaysForWeek(weekNum));
  }, [weekNum]);

  useFocusEffect(
    useCallback(() => {
      loadDays();
    }, [loadDays])
  );

  const handleDayPress = useCallback(
    (dayId: number) => {
      triggerLight();
      router.push(routes.programDay(dayId));
    },
    [router]
  );

  const handleSkipDay = useCallback(
    async (dayId: number) => {
      triggerMedium();
      await markDayComplete(dayId, weekNum);
      loadDays();
    },
    [weekNum, loadDays]
  );

  return (
    <>
      <Stack.Screen options={{ title: `Week ${weekNumber}` }} />
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
        <View
          className="px-4 pt-4"
          style={
            isWide
              ? {
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }
              : undefined
          }
        >
          {days.map((day, index) => (
            <Animated.View
              key={day.id}
              entering={FadeInDown.delay(index * 80).springify()}
              style={isWide ? { width: "48%" } : undefined}
            >
              <DayCard
                day={day}
                onDayPress={handleDayPress}
                onSkipDay={handleSkipDay}
              />
            </Animated.View>
          ))}
        </View>
        <View style={{ height: insets.bottom + 90 }} />
      </ScrollView>
    </>
  );
}

const DayCard = React.memo(function DayCard({
  day,
  onDayPress,
  onSkipDay,
}: {
  day: DayRow;
  onDayPress: (dayId: number) => void;
  onSkipDay: (dayId: number) => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    onDayPress(day.id);
  }, [onDayPress, day.id]);

  const handleSkip = useCallback(() => {
    onSkipDay(day.id);
  }, [onSkipDay, day.id]);

  const color = DAY_TYPE_COLORS[day.dayType] ?? colors.indigo;

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.97);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
    >
      <View
        className={`mb-3 rounded-xl border overflow-hidden ${
          day.isCompleted
            ? "bg-success/5 border-success/30"
            : "bg-surface border-border"
        }`}
      >
        <View className="flex-row">
          {day.isCompleted && (
            <LinearGradient
              colors={[colors.success + '30', colors.success + '00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: 4, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}
            />
          )}
          <View className="flex-1 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: color + "20",
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                >
                  <Text
                    style={{
                      color: color,
                      fontWeight: "700",
                      fontSize: 18,
                    }}
                  >
                    {day.dayNumber}
                  </Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-text-primary font-semibold text-base">
                    {day.dayName}
                  </Text>
                  {day.focus ? (
                    <Text className="text-text-secondary text-sm mt-0.5">
                      {day.focus}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View className="flex-row items-center" style={{ gap: 4 }}>
                {day.isCompleted ? (
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                ) : (
                  <>
                    <Pressable
                      onPress={handleSkip}
                      hitSlop={8}
                      style={{ padding: 6 }}
                    >
                      <Ionicons name="play-skip-forward" size={18} color={colors.text.muted} />
                    </Pressable>
                    <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
});
