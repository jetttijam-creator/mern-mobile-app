import { useCallback, useEffect, useState } from 'react';
import {
  NOT_SUPPORTED,
  ensureNotificationPermission,
  getExpoPushToken,
  onNotificationReceived,
  sendLocalNotification,
} from '../lib/notifications';

// Permission, push token and a local test notification.
// permission: null until we have asked, then { granted, canAskAgain }
// received:   the last notification that arrived while the app was open, or null
export default function useNotifications() {
  const [permission, setPermission] = useState(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [received, setReceived] = useState(null);

  // Listen while the screen is mounted, and remove the listener on the way out.
  useEffect(() => {
    return onNotificationReceived((notification) => setReceived(notification.request.content));
  }, []);

  const enable = useCallback(async () => {
    setError('');
    const answer = await ensureNotificationPermission();
    setPermission(answer);
    if (answer.unsupported) {
      setError(NOT_SUPPORTED);
      return;
    }
    if (!answer.granted) {
      return;
    }
    try {
      const result = await getExpoPushToken();
      setToken(result.token ?? '');
      setError(result.reason);
    } catch (err) {
      setError('Could not get a push token. Check your connection and try again.');
    }
  }, []);

  const sendTest = useCallback(async (seconds = 0) => {
    setError('');
    const answer = await ensureNotificationPermission();
    setPermission(answer);
    if (answer.unsupported) {
      setError(NOT_SUPPORTED);
      return;
    }
    if (!answer.granted) {
      return;
    }
    await sendLocalNotification({
      title: 'Shopfront',
      body: seconds > 0 ? `This arrived ${seconds} seconds later.` : 'Hello from your own phone.',
      seconds,
    });
  }, []);

  return { permission, token, error, received, enable, sendTest };
}
