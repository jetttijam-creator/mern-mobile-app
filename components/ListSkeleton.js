import { StyleSheet } from 'react-native';
import { SkeletonPulse, SkeletonBlock } from './Skeleton';
import { spacing } from '../theme';

const ROWS = 5;

// Five grey rows in the same place as the real shopping list rows.
export default function ListSkeleton() {
  return (
    <SkeletonPulse accessibilityLabel="Loading your list" style={styles.list}>
      {Array.from({ length: ROWS }, (_, index) => (
        <SkeletonBlock key={index} style={styles.row} />
      ))}
    </SkeletonPulse>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    height: 48,
  },
});
