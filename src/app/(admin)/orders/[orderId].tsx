import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import AdminHeader from '../../../components/admin/AdminHeader';
import Button from '../../../components/common/Button';
import EmptyState from '../../../components/common/EmptyState';
import StatusBadge from '../../../components/common/StatusBadge';
import { useThemeColors } from '../../../providers/ThemeProvider';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import type { Order } from '../../../types/order';
import { formatCurrency } from '../../../utils/currency';

export default function AdminOrderDetailScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ orderId: string }>();
  const orderId = params.orderId;

  const placeholderOrder: Order | null = orderId
    ? {
        id: String(orderId),
        orderNumber: `ORD-${String(orderId).slice(0, 6).toUpperCase()}`,
        customerId: "customer-placeholder",
        customerName: "Placeholder Customer",
        createdAt: new Date().toISOString(),
        status: "PENDING",
        subtotal: 0,
        discount: 0,
        deliveryFee: 0,
        total: 0,
        paymentMethod: "CASH_ON_DELIVERY",
        address: "Frontend-only placeholder address — backend required",
        items: [],
        timeline: [],
      }
    : null;

  const order = placeholderOrder;
  const [actionError] = useState<string | null>(null);

  if (!order) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <AdminHeader title="Order" subtitle="Review order details" />
        <EmptyState
          title="Order not found"
          message="This order may have been removed."
          actionLabel="Back to orders"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader title={order?.orderNumber ?? "Order"} subtitle="Review order details" />

      <>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight }]}>
            <Text style={[styles.customer, { color: colors.text }]}>{order.customerName}</Text>
            <StatusBadge label={order.status} tone={order.status === 'PENDING' ? 'warning' : order.status === 'DELIVERED' ? 'success' : 'info'} />
            <Text style={[styles.meta, { color: colors.textMuted }]}>Total: {formatCurrency(order.total)}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>Address: {order.address}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Products</Text>
            {order.items.length === 0 ? (
              <Text style={[styles.meta, { color: colors.textMuted }]}>No items — frontend-only placeholder.</Text>
            ) : (
              order.items.map((item) => (
                <View key={item.id} style={styles.row}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.productName}</Text>
                  <Text style={[styles.itemMeta, { color: colors.textMuted }]}>{item.quantity} × {formatCurrency(item.unitPrice)}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.borderLight, backgroundColor: colors.background }]}>
          {actionError ? <Text style={[styles.actionError, { color: colors.danger }]}>{actionError}</Text> : null}
          <Button
            title="Confirm order"
            onPress={() => {}}
            disabled={order.status === "DELIVERED" || order.status === "CANCELLED" || order.status === "RETURNED"}
            fullWidth
          />
          <Button
            title="Cancel order"
            variant="secondary"
            onPress={() => {}}
            disabled={order.status === "DELIVERED" || order.status === "CANCELLED" || order.status === "RETURNED"}
            fullWidth
          />
        </View>
      </>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  card: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  customer: { fontSize: typography.h3, fontWeight: '700', marginBottom: spacing.sm },
  meta: { fontSize: typography.bodySmall, marginTop: spacing.sm },
  sectionTitle: { fontSize: typography.h3, fontWeight: '700', marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  itemName: { fontSize: typography.body, flex: 1 },
  itemMeta: { fontSize: typography.bodySmall },
  footer: {
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
  },
  actionError: { fontSize: typography.bodySmall, textAlign: "center" },
});
