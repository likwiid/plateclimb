// SPDX-License-Identifier: GPL-3.0-or-later
import { useLocalSearchParams, Stack } from 'expo-router';
import { DayDetailScreen, useDayDetail } from '@features/workout';

export default function DayDetailRoute() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { dayInfo } = useDayDetail(dayId!);

  return (
    <>
      <Stack.Screen
        options={{
          title: dayInfo ? `Week ${dayInfo.weekNumber} · Day ${dayInfo.dayNumber}` : 'Day',
        }}
      />
      <DayDetailScreen dayId={dayId!} />
    </>
  );
}
