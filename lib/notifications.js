import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// expo-notifications needs native code that Expo Go on Android does not ship, and importing it there
// throws. Load it on first use instead of at startup, so the rest of the app still opens.
let cached;
function getNotifications() {
  if (cached === undefined) {
    try {
      cached = require('expo-notifications');
    } catch (err) {
      cached = null;
    }
  }
  return cached;
}

export const NOT_SUPPORTED = 'Notifications are not available in this build. Use a development build.';

// Listens for notifications that arrive while the app is open. Returns a function that stops listening.
export function onNotificationReceived(callback) {
  const Notifications = getNotifications();
  if (!Notifications) return () => {};
  const subscription = Notifications.addNotificationReceivedListener(callback);
  return () => subscription.remove();
}

// Show alerts even while the app is open (the default is to stay silent in the foreground).
// Call once at startup, before any notification can arrive.
export function configureNotificationHandler() {
  const Notifications = getNotifications();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// Android 8+ needs a channel before anything can be shown.
async function ensureAndroidChannel(Notifications) {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Shopfront',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// Makes sure we may post notifications. Returns { granted, canAskAgain, status }.
// iOS shows the system prompt only once. After a denial, canAskAgain is false.
export async function ensureNotificationPermission() {
  const Notifications = getNotifications();
  if (!Notifications) {
    return { granted: false, canAskAgain: false, unsupported: true };
  }
  await ensureAndroidChannel(Notifications);
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || !current.canAskAgain) {
    return current;
  }
  return Notifications.requestPermissionsAsync();
}

// Schedules a notification on this device. seconds = 0 shows it right away.
export async function sendLocalNotification({ title, body, seconds = 0 }) {
  const Notifications = getNotifications();
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger:
      seconds > 0
        ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds }
        : null,
  });
}

// The Expo push token that the server will send to (Part 2).
// Needs a real device and an EAS project id; returns null with a reason otherwise.
export async function getExpoPushToken() {
  const Notifications = getNotifications();
  if (!Notifications) {
    return { token: null, reason: NOT_SUPPORTED };
  }
  if (!Device.isDevice) {
    return { token: null, reason: 'Push tokens only work on a real phone, not a simulator.' };
  }
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    return { token: null, reason: 'No EAS project id yet. Run "eas init" to add one to app.json.' };
  }
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return { token: data, reason: '' };
}
