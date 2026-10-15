import { useState } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Button, Divider, IconButton, List, Snackbar, Text, TextInput } from 'react-native-paper';
import ErrorState from '../components/ErrorState';
import ListSkeleton from '../components/ListSkeleton';
import OfflineBanner from '../components/OfflineBanner';
import useShoppingList from '../hooks/useShoppingList';
import useScreenLog from '../hooks/useScreenLog';
import { colors, spacing } from '../theme';

function EmptyList() {
  return (
    <View style={styles.empty}>
      <Text variant="titleMedium">Your list is empty</Text>
      <Text style={styles.hint}>Add your first item above.</Text>
    </View>
  );
}

export default function ShoppingListScreen() {
  useScreenLog();
  const { items, status, error, refreshing, reload, refresh, add, toggle, remove } =
    useShoppingList();
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  const canAdd = name.trim() !== '' && !adding;

  // add, toggle and remove all answer { ok, message }, so one helper shows any failure.
  const showFailure = (result) => {
    if (!result.ok) setMessage(result.message);
  };

  const handleAdd = async () => {
    if (!canAdd) return;
    setAdding(true);
    const result = await add(name.trim());
    setAdding(false);
    // Clear the box only when the add worked, so a failed attempt can be retried.
    if (result.ok) setName('');
    showFailure(result);
  };

  const handleRefresh = async () => {
    const worked = await refresh();
    if (!worked) {
      setMessage('Could not refresh. Showing your list from earlier.');
    }
  };

  // What the list shows when it has no rows: a skeleton, an error with a retry, or a friendly note.
  let emptyComponent = <EmptyList />;
  if (status === 'loading') {
    emptyComponent = <ListSkeleton />;
  } else if (status === 'error') {
    emptyComponent = <ErrorState message={error} onRetry={reload} />;
  }

  return (
    <View style={styles.screen}>
      <OfflineBanner />

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          mode="outlined"
          label="Add an item"
          accessibilityLabel="New item"
          value={name}
          onChangeText={setName}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        <Button mode="contained" onPress={handleAdd} disabled={!canAdd} loading={adding}>
          Add
        </Button>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            titleStyle={item.done ? styles.done : undefined}
            onPress={() => toggle(item).then(showFailure)}
            left={() => (
              <List.Icon
                icon={item.done ? 'checkbox-marked' : 'checkbox-blank-outline'}
                color={item.done ? colors.success : colors.muted}
              />
            )}
            right={() => (
              <IconButton
                icon="delete-outline"
                accessibilityLabel={`Remove ${item.name}`}
                onPress={() => remove(item).then(showFailure)}
              />
            )}
          />
        )}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={emptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      <Snackbar visible={message !== ''} onDismiss={() => setMessage('')} duration={2500}>
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  input: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  done: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  hint: {
    color: colors.muted,
  },
});
