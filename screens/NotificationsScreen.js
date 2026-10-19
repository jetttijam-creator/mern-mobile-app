import { Linking, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import useNotifications from '../hooks/useNotifications';
import { colors, spacing } from '../theme';

export default function NotificationsScreen() {
  const { permission, token, error, received, enable, sendTest } = useNotifications();
  const denied = permission && !permission.granted && !permission.unsupported;

  return (
    <View style={styles.screen}>
      <View style={styles.row}>
        <Button mode="contained" icon="bell-ring-outline" onPress={enable}>
          Turn on
        </Button>
        <Button mode="outlined" icon="send" onPress={() => sendTest(0)}>
          Send now
        </Button>
        <Button mode="outlined" icon="timer-outline" onPress={() => sendTest(5)}>
          In 5 s
        </Button>
      </View>

      {denied && (
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium">Notifications are off for Shopfront</Text>
            <Text>
              {permission.canAskAgain
                ? 'Tap Turn on again and choose Allow.'
                : 'You can turn them back on in the Settings app.'}
            </Text>
            {!permission.canAskAgain && (
              <Button mode="outlined" onPress={() => Linking.openSettings()}>
                Open Settings
              </Button>
            )}
          </Card.Content>
        </Card>
      )}

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      {token !== '' && (
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium">Push token</Text>
            <Text selectable>{token}</Text>
          </Card.Content>
        </Card>
      )}

      {received && (
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium">Last received while open</Text>
            <Text>{received.title}</Text>
            <Text style={styles.muted}>{received.body}</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
  },
  cardContent: {
    gap: spacing.sm,
  },
  muted: {
    color: colors.muted,
  },
  error: {
    color: colors.danger,
  },
});
