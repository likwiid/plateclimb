// SPDX-License-Identifier: GPL-3.0-or-later
import "../global.css";
import "@shared/theme/nativewindInterop";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";

import { initDatabase } from "@shared/db/client";
import { runMigrations } from "@shared/db/migrate";
import { seedDatabase } from "@shared/db/seed";
import { onAppReset } from "@shared/services/appReset";
import { colors } from '@shared/theme';

const APP_DARK_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg.base,
    card: colors.bg.base,
    border: colors.border.default,
    text: colors.text.primary,
    primary: colors.indigo,
  },
};

SystemUI.setBackgroundColorAsync(colors.bg.base);

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bumped after "Reset All Data" so the database is reopened and every
  // screen remounts against the fresh, seeded data.
  const [generation, setGeneration] = useState(0);

  useEffect(
    () =>
      onAppReset(() => {
        setIsReady(false);
        setError(null);
        setGeneration((g) => g + 1);
      }),
    [],
  );

  useEffect(() => {
    async function init() {
      try {
        const db = await initDatabase();
        await runMigrations(db);
        // Bundled exercise catalog and program: the app is fully usable offline.
        await seedDatabase(db);
        setIsReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    }
    init();
  }, [generation]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-danger text-lg font-bold mb-2">
          Failed to initialize
        </Text>
        <Text className="text-text-secondary text-center">{error}</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.indigo} />
        <Text className="text-text-secondary mt-4">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={APP_DARK_THEME}>
        <StatusBar style="light" />
        <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg.base },
          headerTintColor: colors.text.primary,
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: colors.bg.base },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="program/week/[weekNumber]"
          options={{ title: "Week" }}
        />
        <Stack.Screen
          name="program/day/[dayId]"
          options={{ title: "Day" }}
        />
        <Stack.Screen
          name="workout/[sessionId]"
          options={{
            title: "Workout",
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="workout/summary/[sessionId]"
          options={{ title: "Summary" }}
        />
        <Stack.Screen
          name="exercise/[exerciseId]"
          options={{
            presentation: "modal",
            title: "Exercise",
          }}
        />
      </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
