/* eslint-disable react-hooks/immutability -- Reanimated shared values are mutable by design */
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { colors } from "../../constants/colors";
import { radius, layout } from "../../constants/sizes";
import { spacing } from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";
import { springConfigs } from "../../lib/motion";
import type { Product } from "../../types/product";
import { formatCurrency } from "../../utils/currency";

const SLIDE_INTERVAL = 2000;

type ProductHeroSliderProps = {
  products: Product[];
  onProductPress?: (product: Product) => void;
};

const placeholder = require("@/assets/images/placeholders/product-placeholder.png");

export default function ProductHeroSlider({
  products,
  onProductPress,
}: ProductHeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const flatListRef = useRef<any>(null);
  const reducedMotion = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (products.length <= 1 || reducedMotion) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % products.length;
        flatListRef.current?.scrollToOffset({ offset: next * (layout.productImage + spacing.lg * 2 + spacing.md), animated: true });
        return next;
      });
    }, SLIDE_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [products.length, reducedMotion]);

  if (products.length === 0) return null;

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={products}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={layout.productImage + spacing.lg * 2 + spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems.length > 0 && viewableItems[0].index != null) {
            setCurrentIndex(viewableItems[0].index);
          }
        }}
        renderItem={({ item, index }) => (
          <HeroSlide
            product={item}
            isActive={index === currentIndex}
            onPress={() => onProductPress?.(item)}
          />
        )}
      />
      {products.length > 1 ? (
        <View style={styles.dots}>
          {products.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function HeroSlide({
  product,
  isActive,
  onPress,
}: {
  product: Product;
  isActive: boolean;
  onPress?: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, springConfigs.press);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfigs.press);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.discountPercent ? `${product.discountPercent}% off, ` : ""}${formatCurrency(product.price)}`}
    >
      <Animated.View style={[styles.slide, animatedStyle]}>
        <Image
          source={product.image || product.primaryImage ? { uri: product.image || product.primaryImage } : placeholder}
          placeholder={placeholder}
          cachePolicy="memory-disk"
          contentFit="cover"
          transition={200}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            {product.originalPrice && product.originalPrice > product.price ? (
              <Text style={styles.originalPrice}>{formatCurrency(product.originalPrice)}</Text>
            ) : null}
            {product.discountPercent ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discountPercent}% OFF</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const slideWidth = layout.productImage + spacing.lg * 2 + spacing.md;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  slide: {
    width: slideWidth,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    marginRight: spacing.md,
  },
  image: {
    width: "100%",
    height: layout.productImage,
    backgroundColor: colors.background,
  },
  info: {
    padding: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.bodySmall,
    fontFamily: fontFamily.semiBold,
    lineHeight: fontSize.bodySmall * lineHeight.normal,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  price: {
    color: colors.primary,
    fontSize: fontSize.body,
    fontFamily: fontFamily.bold,
  },
  originalPrice: {
    color: colors.textMuted,
    fontSize: fontSize.caption,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: colors.goldSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  discountText: {
    color: colors.goldDark,
    fontSize: fontSize.micro,
    fontFamily: fontFamily.semiBold,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },
});
