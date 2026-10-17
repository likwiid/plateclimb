// SPDX-License-Identifier: GPL-3.0-or-later
import { useLocalSearchParams, Stack } from 'expo-router';
import { WorkoutSummaryScreen } from '@features/workout';

export default function WorkoutSummaryRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const sid = parseInt(sessionId!, 10);

  return (
    <>
      <Stack.Screen options={{ title: 'Workout Summary' }} />
      <WorkoutSummaryScreen sessionId={sid} />
    </>
  );
}
