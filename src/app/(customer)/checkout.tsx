import React from "react";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../providers/ThemeProvider";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Header from "../../components/common/Header";
import Input from "../../components/common/Input";
import LoadingState from "../../components/common/LoadingState";
import ResponsiveContainer from "../../components/common/ResponsiveContainer";
import spacing from "../../constants/spacing";
import typography from "../../constants/typography";
import { useResponsive } from "../../hooks/useResponsive";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/currency";
import { normalizeError } from "../../utils/errorHandling";

const submitOrder = async (_payload: { customerId: string; customerName: string; address: string }): Promise<void> => { return; };

export default function CheckoutScreen() {
  const colors = useThemeColors();
  const { items, summary, loading } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState("Nairobi West, Mfangano Street");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { isDesktop } = useResponsive();

  const handleSubmit = async () => {
    if (!items.length || submitting) return;
    setSubmitting(true);
    setError(null);
    try { await submitOrder({ customerId: user?.id ?? "user-001", customerName: user?.name ?? "Demo customer", address: address.trim() }); setSuccess(true); } catch (nextError) { setError(normalizeError(nextError).message); } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingState label="Loading checkout" />;
  if (!items.length) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Checkout" onBack={() => router.back()} />
        <EmptyState title="Your cart is empty" message="Add a medicine before checking out." actionLabel="Browse products" onAction={() => router.replace("/(customer)/(tabs)/products")} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Checkout" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <ResponsiveContainer maxWidth={isDesktop ? 960 : 1320}>
          {isDesktop ? (
            <View style={styles.desktopLayout}>
              <View style={styles.formColumn}>
                <Input label="Customer name" value={user?.name ?? "Demo customer"} editable={false} />
                <Input label="Delivery address" value={address} onChangeText={setAddress} />
              </View>
              <View style={styles.summaryColumn}>
                <View style={[styles.summaryBox, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Order summary</Text>
                  {items.map((item) => (
                    <View key={item.id} style={styles.row}><Text>{item.product.name}</Text><Text>{item.quantity} x {formatCurrency(item.product.price)}</Text></View>
                  ))}
                  <View style={styles.row}><Text>Subtotal</Text><Text>{formatCurrency(summary.subtotal)}</Text></View>
                  <View style={styles.row}><Text>Discount</Text><Text>-{formatCurrency(summary.discount)}</Text></View>
                  <View style={styles.row}><Text>Delivery</Text><Text>{formatCurrency(summary.deliveryFee)}</Text></View>
                  <View style={[styles.row, styles.total, { borderTopColor: colors.border }]}><Text style={[styles.totalText, { color: colors.text }]}>Total</Text><Text style={[styles.totalText, { color: colors.text }]}>{formatCurrency(summary.total)}</Text></View>
                </View>
                <View style={[styles.paymentBox, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment</Text>
                  <Text style={[styles.paymentMethod, { color: colors.textMuted }]}>Cash on Delivery</Text>
                </View>
                {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
                {success ? <Text style={[styles.success, { color: colors.success }]}>Order submitted and added to your delivery cycle.</Text> : null}
                <Button title={success ? "View delivery cycle" : "Submit order"} onPress={success ? () => router.replace("/(customer)/delivery-cycle") : handleSubmit} loading={submitting} disabled={success || !address.trim()} fullWidth />
              </View>
            </View>
          ) : (
            <>
              <Input label="Customer name" value={user?.name ?? "Demo customer"} editable={false} />
              <Input label="Delivery address" value={address} onChangeText={setAddress} />
              <View style={[styles.summaryBox, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Order summary</Text>
                {items.map((item) => (
                  <View key={item.id} style={styles.row}><Text>{item.product.name}</Text><Text>{item.quantity} x {formatCurrency(item.product.price)}</Text></View>
                ))}
                <View style={styles.row}><Text>Subtotal</Text><Text>{formatCurrency(summary.subtotal)}</Text></View>
                <View style={styles.row}><Text>Discount</Text><Text>-{formatCurrency(summary.discount)}</Text></View>
                <View style={styles.row}><Text>Delivery</Text><Text>{formatCurrency(summary.deliveryFee)}</Text></View>
                <View style={[styles.row, styles.total, { borderTopColor: colors.border }]}><Text style={[styles.totalText, { color: colors.text }]}>Total</Text><Text style={[styles.totalText, { color: colors.text }]}>{formatCurrency(summary.total)}</Text></View>
              </View>
              <View style={[styles.paymentBox, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment</Text>
                <Text style={[styles.paymentMethod, { color: colors.textMuted }]}>Cash on Delivery</Text>
              </View>
              {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
              {success ? <Text style={[styles.success, { color: colors.success }]}>Order submitted and added to your delivery cycle.</Text> : null}
              <Button title={success ? "View delivery cycle" : "Submit order"} onPress={success ? () => router.replace("/(customer)/delivery-cycle") : handleSubmit} loading={submitting} disabled={success || !address.trim()} fullWidth />
            </>
          )}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  desktopLayout: { flexDirection: "row", gap: spacing.xl },
  formColumn: { flex: 1, gap: spacing.lg },
  summaryColumn: { flex: 1, gap: spacing.lg },
  summaryBox: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  sectionTitle: { fontWeight: "700", fontSize: 14, marginBottom: spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  total: { borderTopWidth: 1, borderTopColor: "#D0D6D4", paddingTop: spacing.md, marginTop: spacing.md },
  totalText: { fontWeight: "800", fontSize: 14 },
  paymentBox: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  paymentMethod: { fontSize: 12 },
  error: { fontSize: 12, textAlign: "center" },
  success: { fontSize: 12, textAlign: "center" },
});