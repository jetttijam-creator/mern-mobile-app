import { useCallback, useState } from 'react';
import { View, FlatList, Linking, RefreshControl, StyleSheet } from 'react-native';
import { Button, Divider, Snackbar, Text, TextInput } from 'react-native-paper';
import ErrorState from '../components/ErrorState';
import ListSkeleton from '../components/ListSkeleton';
import OfflineBanner from '../components/OfflineBanner';
import ShoppingRow from '../components/ShoppingRow';
import ListSummary from '../components/ListSummary';
import useShoppingList from '../hooks/useShoppingList';
import useLocationTags from '../hooks/useLocationTags';
import useScreenLog from '../hooks/useScreenLog';
import { colors, spacing } from '../theme';

const keyExtractor = (item) => item.id;

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
  const { tags, tagItem, clearTag } = useLocationTags();
  const [needsSettings, setNeedsSettings] = useState(false);
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  const canAdd = name.trim() !== '' && !adding;

  // add, toggle and remove all answer { ok, message }, so one helper shows any failure.
  // Every handler is wrapped in useCallback so the memo'd ShoppingRow sees the same function each render.
  // The state setters never change identity, so they are safe dependencies.
  const showFailure = useCallback((result) => {
    setNeedsSettings(false);
    if (!result.ok) setMessage(result.message);
  }, []);

  const handleToggle = useCallback((item) => toggle(item).then(showFailure), [toggle, showFailure]);
  const handleRemove = useCallback((item) => remove(item).then(showFailure), [remove, showFailure]);

  // One tap tags the item with where you are; another tap removes the tag.
  // The row says whether it already has a tag, so this callback does not depend on `tags`.
  const handleTag = useCallback(
    async (item, hasTag) => {
      if (hasTag) {
        clearTag(item.id);
        return;
      }
      const result = await tagItem(item.id);
      if (!result.ok) {
        setNeedsSettings(Boolean(result.needsSettings));
        setMessage(result.message);
      }
    },
    [tagItem, clearTag]
  );

  // renderItem reads `tags`, so it changes only when a tag changes. Rows whose own tag is unchanged still skip.
  const renderItem = useCallback(
    ({ item }) => (
      <ShoppingRow
        item={item}
        tag={tags[item.id]}
        onToggle={handleToggle}
        onTag={handleTag}
        onRemove={handleRemove}
      />
    ),
    [tags, handleToggle, handleTag, handleRemove]
  );

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

      <ListSummary items={items} />

      <FlatList
        data={items}
        extraData={tags}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
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

      <Snackbar
        visible={message !== ''}
        onDismiss={() => setMessage('')}
        duration={2500}
        action={needsSettings ? { label: 'Settings', onPress: () => Linking.openSettings() } : undefined}
      >
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
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
