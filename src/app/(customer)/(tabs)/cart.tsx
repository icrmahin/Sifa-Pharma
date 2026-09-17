import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../../providers/ThemeProvider";
import CartItemRow from "../../../components/cart/CartItem";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import Header from "../../../components/common/Header";
import LoadingState from "../../../components/common/LoadingState";
import ResponsiveContainer from "../../../components/common/ResponsiveContainer";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import { useResponsive } from "../../../hooks/useResponsive";
import { useCart } from "../../../hooks/useCart";
import { formatCurrency } from "../../../utils/currency";
import { normalizeError } from "../../../utils/errorHandling";

export default function CustomerCartScreen() {
  const colors = useThemeColors();
  const { items, summary, loading, setQuantity, removeItem } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const { isDesktop } = useResponsive();

  const updateQuantity = async (itemId: string, quantity: number) => {
    setUpdating(true);
    setError(null);
    try { await setQuantity(itemId, quantity); } catch (nextError) { setError(normalizeError(nextError).message); } finally { setUpdating(false); }
  };

  const removeCartItem = async (itemId: string) => {
    setUpdating(true);
    setError(null);
    try { await removeItem(itemId); } catch (nextError) { setError(normalizeError(nextError).message); } finally { setUpdating(false); }
  };

  if (loading) return <LoadingState label="Loading your cart" />;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Cart" subtitle="Review and checkout your items" />
      <ScrollView contentContainerStyle={styles.container}>
        <ResponsiveContainer>
          {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
          {items.length === 0 ? (
            <EmptyState title="Your cart is empty" message="Add medicines from the product catalogue to begin." actionLabel="Browse products" onAction={() => router.push("/(customer)/(tabs)/products")} />
          ) : isDesktop ? (
            <View style={styles.desktopLayout}>
              <View style={styles.itemsColumn}>
                {items.map((item) => <CartItemRow key={item.id} item={item} onQuantity={(q) => updateQuantity(item.id, q)} onRemove={() => removeCartItem(item.id)} />)}
              </View>
              <View style={styles.summaryColumn}>
                <View style={[styles.summaryBox, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                  <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Summary</Text>
                  <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal</Text><Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(summary.subtotal)}</Text></View>
                  <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.text }]}>Discount</Text><Text style={[styles.summaryValue, { color: colors.text }]}>-{formatCurrency(summary.discount)}</Text></View>
                  <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.text }]}>Delivery fee</Text><Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(summary.deliveryFee)}</Text></View>
                  <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}><Text style={[styles.totalText, { color: colors.text }]}>Total</Text><Text style={[styles.totalText, { color: colors.text }]}>{formatCurrency(summary.total)}</Text></View>
                </View>
                <View style={styles.actions}>
                  <Button title="Continue shopping" variant="secondary" onPress={() => router.push("/(customer)/(tabs)/products")} fullWidth />
                  <Button title="Proceed to checkout" onPress={() => router.push("/(customer)/checkout")} disabled={items.length === 0 || updating} fullWidth />
                </View>
              </View>
            </View>
          ) : (
            <>
              {items.map((item) => <CartItemRow key={item.id} item={item} onQuantity={(q) => updateQuantity(item.id, q)} onRemove={() => removeCartItem(item.id)} />)}
              <View style={[styles.summaryBox, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.text }]}>Subtotal</Text><Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(summary.subtotal)}</Text></View>
                <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.text }]}>Discount</Text><Text style={[styles.summaryValue, { color: colors.text }]}>-{formatCurrency(summary.discount)}</Text></View>
                <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.text }]}>Delivery fee</Text><Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(summary.deliveryFee)}</Text></View>
                <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}><Text style={[styles.totalText, { color: colors.text }]}>Total</Text><Text style={[styles.totalText, { color: colors.text }]}>{formatCurrency(summary.total)}</Text></View>
              </View>
              <View style={styles.actions}>
                <Button title="Continue shopping" variant="secondary" onPress={() => router.push("/(customer)/(tabs)/products")} fullWidth />
                <Button title="Proceed to checkout" onPress={() => router.push("/(customer)/checkout")} disabled={items.length === 0 || updating} fullWidth />
              </View>
            </>
          )}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  error: { fontSize: 12 },
  desktopLayout: { flexDirection: "row", gap: spacing.xl },
  itemsColumn: { flex: 2, gap: spacing.md },
  summaryColumn: { flex: 1, gap: spacing.lg },
  summaryTitle: { fontWeight: "700", fontSize: 14, marginBottom: spacing.md },
  summaryBox: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  totalRow: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1 },
  totalText: { fontWeight: "800", fontSize: 14 },
  summaryLabel: { fontSize: 12 },
  summaryValue: { fontSize: 12 },
  actions: { gap: spacing.md },
});