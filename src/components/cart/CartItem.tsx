import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../../providers/ThemeProvider";
import sizes from "../../constants/sizes";
import spacing from "../../constants/spacing";
import typography from "../../constants/typography";
import type { CartItem } from "../../types/cart";
import { formatCurrency } from "../../utils/currency";
import ProductImage from "../products/ProductImage";
import QuantitySelector from "./QuantitySelector";

export default function CartItemRow({
  item,
  onQuantity,
  onRemove,
}: {
  item: CartItem;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const colors = useThemeColors();
  return (
    <View style={[styles.row, { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight }]}>
      <ProductImage
        uri={item.product.image}
        recyclingKey={item.id}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{item.product.name}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>{formatCurrency(item.product.price)}</Text>
        <QuantitySelector
          value={item.quantity}
          onChange={onQuantity}
          max={item.product.stock}
        />
      </View>
      <View style={styles.aside}>
        <Text style={[styles.price, { color: colors.text }]}>
          {formatCurrency(item.product.price * item.quantity)}
        </Text>
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.product.name} from cart`}
        >
          <Text style={[styles.remove, { color: colors.danger }]}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: sizes.borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  image: { width: sizes.thumbnail, height: sizes.thumbnail, borderRadius: sizes.borderRadius.md },
  info: { flex: 1, gap: spacing.xxs },
  name: { fontSize: typography.subhead, fontWeight: "600" },
  meta: { fontSize: typography.caption1 },
  aside: { alignItems: "flex-end", justifyContent: "space-between" },
  price: { fontSize: typography.subhead, fontWeight: "600" },
  remove: {
    fontSize: typography.caption2,
    fontWeight: "600",
  },
});