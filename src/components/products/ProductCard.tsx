import { memo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../../providers/ThemeProvider";
import { useShadows } from "../../constants/shadows";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize } from "../../constants/typography";
import { radius } from "../../constants/sizes";
import type { Product } from "../../types/product";
import ProductImage from "./ProductImage";
import Icon from "../common/Icon";
import { formatCurrency } from "../../utils/currency";
import { useCart } from "../../providers/CartProvider";
import { useFavorites } from "../../providers/FavoritesProvider";

type ProductCardProps = {
  product: Product;
  compact?: boolean;
  onPress?: (product: Product) => void;
};

function ProductCard({ product, compact, onPress }: ProductCardProps) {
  const colors = useThemeColors();
  const shadows = useShadows();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [adding, setAdding] = useState(false);
  const fav = isFavorite(product.id);

  const handleAdd = async () => {
    if (product.stock === 0 || adding) return;
    setAdding(true);
    try {
      await addItem(product.id, 1);
    } catch {
      // silent
    } finally {
      setAdding(false);
    }
  };

  const handleFav = async () => {
    try {
      await toggleFavorite(product.id);
    } catch {}
  };

  const showLowStock = product.stock > 0 && product.stock <= 3;

  return (
    <View
      style={[
        styles.card,
        compact && styles.compact,
        {
          backgroundColor: colors.backgroundAlt,
          ...shadows.sm,
        },
      ]}
    >
      <Pressable
        onPress={() => onPress?.(product)}
        style={styles.mainPressable}
        accessibilityRole="button"
        accessibilityLabel={`View ${product.name} details`}
      >
        <View style={[styles.imageWrap, { backgroundColor: colors.background }]}>
          <ProductImage uri={product.image || product.primaryImage} recyclingKey={product.id} style={styles.image} contentFit="contain" />
        </View>

        <View style={styles.content}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {product.name}
          </Text>

          {product.genericName ? (
            <Text style={[styles.generic, { color: colors.textMuted }]} numberOfLines={1}>
              {product.genericName}
            </Text>
          ) : null}

          <View style={styles.priceRow}>
            <View style={styles.priceBlock}>
              <Text style={[styles.price, { color: colors.text }]} numberOfLines={1}>
                {formatCurrency(product.price)}
              </Text>
              {product.originalPrice && product.originalPrice > product.price ? (
                <Text style={[styles.original, { color: colors.textMuted }]} numberOfLines={1}>
                  {formatCurrency(product.originalPrice)}
                </Text>
              ) : null}
            </View>
          </View>

          {product.stock === 0 ? (
            <Text style={[styles.stock, { color: colors.danger }]}>Out of stock</Text>
          ) : showLowStock ? (
            <Text style={[styles.stock, { color: colors.warning }]}>Only {product.stock} left</Text>
          ) : null}
        </View>
      </Pressable>

      {/* Bottom compact action row: + and heart — no overlap, well defined */}
      <View style={styles.actionsRow}>
        <Pressable
          onPress={handleFav}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={fav ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: fav ? colors.danger + "16" : colors.background,
              borderColor: fav ? colors.danger + "30" : colors.borderLight,
            },
            pressed && styles.pressed,
          ]}
        >
          <Icon name={fav ? "favorite" : "favorite-border"} size={14} color={fav ? colors.danger : colors.textMuted} />
        </Pressable>

        <Pressable
          onPress={handleAdd}
          disabled={product.stock === 0 || adding}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Add ${product.name} to cart`}
          style={({ pressed }) => [
            styles.iconBtn,
            styles.primaryBtn,
            { backgroundColor: product.stock === 0 ? colors.borderLight : colors.primary, borderColor: product.stock === 0 ? colors.borderLight : colors.primary },
            product.stock === 0 && { opacity: 0.45 },
            pressed && product.stock !== 0 && styles.pressed,
          ]}
        >
          <Icon name="add" size={16} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  compact: { marginBottom: 0 },
  mainPressable: { flex: 1 },
  imageWrap: {
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: radius.lg,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 56,
    gap: 2,
  },
  name: {
    fontFamily: fontFamily.pjsMedium,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * 1.35,
    minHeight: 36,
  },
  generic: {
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.micro,
    lineHeight: fontSize.micro * 1.3,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: spacing.xs,
  },
  priceBlock: {
    flex: 1,
    gap: 1,
  },
  price: {
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.callout,
    lineHeight: fontSize.callout * 1.2,
  },
  original: {
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.micro,
    textDecorationLine: "line-through",
  },
  stock: {
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.micro,
    marginTop: 2,
  },
  actionsRow: {
    position: "absolute",
    right: spacing.sm,
    bottom: spacing.sm,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtn: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.96 }] },
});

export default memo(ProductCard);
