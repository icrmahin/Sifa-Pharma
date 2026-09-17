import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../../providers/ThemeProvider";
import sizes from "../../constants/sizes";
import spacing from "../../constants/spacing";
import typography from "../../constants/typography";
import type { Order } from "../../types/order";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import OrderStatus from "./OrderStatus";

type OrderCardProps = {
  order: Order;
  onPress?: (order: Order) => void;
};

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundAlt,
          borderColor: colors.borderLight,
        },
      ]}
      onPress={() => onPress?.(order)}
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.orderNumber}, ${order.status}, ${formatCurrency(order.total)}`}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.orderNumber, { color: colors.text }]}>{order.orderNumber}</Text>
        <OrderStatus status={order.status} />
      </View>
      <Text style={[styles.date, { color: colors.textMuted }]}>{formatDate(order.createdAt)}</Text>
      <Text style={[styles.items, { color: colors.textMuted }]}>{order.items.length} item(s)</Text>
      <View style={styles.footer}>
        <Text style={[styles.total, { color: colors.text }]}>{formatCurrency(order.total)}</Text>
        <Text style={[styles.more, { color: colors.primary }]}>View details</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: sizes.borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  orderNumber: {
    fontSize: typography.subhead,
    fontWeight: "700",
  },
  date: {
    fontSize: typography.footnote,
    marginTop: spacing.sm,
  },
  items: {
    fontSize: typography.footnote,
    marginTop: spacing.xxs,
  },
  footer: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: {
    fontSize: typography.headline,
    fontWeight: "700",
  },
  more: {
    fontSize: typography.footnote,
    fontWeight: "600",
  },
});