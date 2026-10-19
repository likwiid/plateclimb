// SPDX-License-Identifier: GPL-3.0-or-later
import { Tabs } from "expo-router";
import { CustomTabBar } from "@shared/components/CustomTabBar";
import { colors } from "@shared/theme";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        sceneStyle: { backgroundColor: colors.bg.base },
        lazy: true,
        headerShown: false,
        animation: "fade",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Program",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
