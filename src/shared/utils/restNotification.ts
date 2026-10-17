// SPDX-License-Identifier: GPL-3.0-or-later
import { Platform } from 'react-native';
import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';

const REST_NOTIFICATION_ID = 'rest-timer';
const REST_DONE_ID = 'rest-done';
const CHANNEL_TIMER = 'rest-timer-channel';
const CHANNEL_DONE = 'rest-done-channel';
let channelsCreated = false;

async function ensureChannels(): Promise<void> {
  if (channelsCreated || Platform.OS !== 'android') return;
  channelsCreated = true;
  await notifee.createChannel({
    id: CHANNEL_TIMER,
    name: 'Rest Timer',
    importance: AndroidImportance.LOW,
  });
  await notifee.createChannel({
    id: CHANNEL_DONE,
    name: 'Rest Complete',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
}

/**
 * Show a countdown notification using Android's native chronometer.
 * The OS renders the countdown itself - call this ONCE when the timer starts.
 */
export async function showRestCountdownNotification(durationSeconds: number): Promise<void> {
  if (Platform.OS !== 'android') return;
  await ensureChannels();

  try {
    await notifee.displayNotification({
      id: REST_NOTIFICATION_ID,
      title: 'Rest Timer',
      body: 'Resting between sets...',
      android: {
        channelId: CHANNEL_TIMER,
        ongoing: true,
        onlyAlertOnce: true,
        showChronometer: true,
        chronometerDirection: 'down',
        timestamp: Date.now() + durationSeconds * 1000,
        showTimestamp: false,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  } catch {
    // Non-critical
  }
}

/**
 * Update the countdown endpoint (e.g. when user presses +30s).
 */
export async function updateRestCountdownNotification(newRemainingSeconds: number): Promise<void> {
  if (Platform.OS !== 'android') return;
  await ensureChannels();

  try {
    await notifee.displayNotification({
      id: REST_NOTIFICATION_ID,
      title: 'Rest Timer',
      body: 'Resting between sets...',
      android: {
        channelId: CHANNEL_TIMER,
        ongoing: true,
        onlyAlertOnce: true,
        showChronometer: true,
        chronometerDirection: 'down',
        timestamp: Date.now() + newRemainingSeconds * 1000,
        showTimestamp: false,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  } catch {
    // Non-critical
  }
}

/**
 * Schedule a "rest complete" notification to fire after N seconds.
 * Uses a timestamp trigger so it fires even when the app is backgrounded.
 */
export async function scheduleRestDoneNotification(seconds: number): Promise<void> {
  if (Platform.OS !== 'android' || seconds <= 0) return;
  await ensureChannels();

  try {
    await notifee.cancelNotification(REST_DONE_ID);
    await notifee.createTriggerNotification(
      {
        id: REST_DONE_ID,
        title: 'Rest Complete',
        body: 'Time to lift! Get back to your set.',
        android: {
          channelId: CHANNEL_DONE,
          smallIcon: 'ic_launcher',
          pressAction: { id: 'default' },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: Date.now() + seconds * 1000,
      },
    );
  } catch {
    // Non-critical
  }
}

/**
 * Show "rest complete" immediately (timer finished in foreground).
 */
export async function showRestCompleteNotification(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await ensureChannels();

  try {
    // Cancel scheduled done since it finished in foreground
    await notifee.cancelNotification(REST_DONE_ID);

    await notifee.displayNotification({
      id: REST_NOTIFICATION_ID,
      title: 'Rest Complete',
      body: 'Time to lift! Get back to your set.',
      android: {
        channelId: CHANNEL_DONE,
        ongoing: false,
        showChronometer: false,
        smallIcon: 'ic_launcher',
        pressAction: { id: 'default' },
      },
    });
  } catch {
    // Non-critical
  }
}

/**
 * Cancel all rest timer notifications.
 */
export async function cancelRestNotification(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await notifee.cancelNotification(REST_NOTIFICATION_ID);
    await notifee.cancelNotification(REST_DONE_ID);
  } catch {
    // Ignore
  }
}
