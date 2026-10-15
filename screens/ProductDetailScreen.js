import { useState, useLayoutEffect } from 'react';
import { View, Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { products } from '../data/products';
import { Text, Chip, IconButton, Button, Snackbar, useTheme } from 'react-native-paper';
import useBreakpoint, { BREAKPOINTS } from '../hooks/useBreakpoint';
import { formatPrice } from '../utils/format';
import { colors, spacing, radius } from '../theme';

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 10;

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const index = products.findIndex((item) => item.id === productId);
  const product = products[index];
  const nextProduct = products[(index + 1) % products.length];
  const theme = useTheme();
  const { width } = useBreakpoint();
  const insets = useSafeAreaInsets();
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const [message, setMessage] = useState('');
  const [favorite, setFavorite] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: product ? product.name : 'Product',
      headerRight: () => (
        <IconButton
          icon={favorite ? 'heart' : 'heart-outline'}
          accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
          onPress={() => setFavorite((value) => !value)}
        />
      ),
    });
  }, [navigation, product, favorite]);

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text variant="titleMedium">Product not found</Text>
      </View>
    );
  }

  const isWide = width >= BREAKPOINTS.tablet;
  const outOfStock = !product.inStock;

  const handleAddToCart = () => {
    setMessage(`${quantity} x ${product.name} added to cart`);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.body} edges={['left', 'right']}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          <View style={[styles.layout, isWide && styles.layoutWide]}>
            <Image
              source={{ uri: product.imageUrl }}
              style={[styles.image, isWide && styles.imageWide]}
            />

            <View style={styles.details}>
              <Text variant="headlineSmall">{product.name}</Text>
              <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                {formatPrice(product.price)}
              </Text>

              <View style={styles.chips}>
                <Chip>{product.category}</Chip>
                <Chip icon={outOfStock ? 'close' : 'check'}>
                  {outOfStock ? 'Out of stock' : 'In stock'}
                </Chip>
              </View>

              <Text variant="bodyLarge">{product.description}</Text>

              <View style={styles.stepper}>
                <IconButton
                  icon="minus"
                  mode="outlined"
                  accessibilityLabel="Decrease quantity"
                  disabled={outOfStock || quantity <= MIN_QUANTITY}
                  onPress={() => setQuantity((value) => Math.max(MIN_QUANTITY, value - 1))}
                />
                <Text variant="titleMedium" style={styles.quantity}>
                  {quantity}
                </Text>
                <IconButton
                  icon="plus"
                  mode="outlined"
                  accessibilityLabel="Increase quantity"
                  disabled={outOfStock || quantity >= MAX_QUANTITY}
                  onPress={() => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))}
                />
              </View>

              <Button mode="contained" disabled={outOfStock} onPress={handleAddToCart}>
                Add to cart
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.push('ProductDetail', { productId: nextProduct.id })}
              >
                See next product
              </Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Snackbar visible={message !== ''} onDismiss={() => setMessage('')} duration={2000}>
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  layout: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    gap: spacing.lg,
  },
  layoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
  },
  imageWide: {
    width: '45%',
  },
  details: {
    flex: 1,
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    minWidth: 32,
    textAlign: 'center',
  },
});
