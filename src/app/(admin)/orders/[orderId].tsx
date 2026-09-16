import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import AdminHeader from '../../../components/admin/AdminHeader';
import Button from '../../../components/common/Button';
import EmptyState from '../../../components/common/EmptyState';
import StatusBadge from '../../../components/common/StatusBadge';
import colors from '../../../constants/colors';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import type { Order } from '../../../types/order';
import { formatCurrency } from '../../../utils/currency';

export default function AdminOrderDetailScreen() {
  const params = useLocalSearchParams<{ orderId: string }>();
  const orderId = params.orderId;

  // frontend-only: placeholder single object — no backend
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
      <SafeAreaView style={styles.safeArea}>
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
    <SafeAreaView style={styles.safeArea}>
      <AdminHeader title={order?.orderNumber ?? "Order"} subtitle="Review order details" />

      <>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.customer}>{order.customerName}</Text>
            <StatusBadge label={order.status} tone={order.status === 'PENDING' ? 'warning' : order.status === 'DELIVERED' ? 'success' : 'info'} />
            <Text style={styles.meta}>Total: {formatCurrency(order.total)}</Text>
            <Text style={styles.meta}>Address: {order.address}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Products</Text>
            {order.items.length === 0 ? (
              <Text style={styles.meta}>No items — frontend-only placeholder.</Text>
            ) : (
              order.items.map((item) => (
                <View key={item.id} style={styles.row}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemMeta}>{item.quantity} × {formatCurrency(item.unitPrice)}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
          <Button
            title="Confirm order"
            onPress={() => {
              // backend required — no-op frontend-only
            }}
            disabled={order.status === "DELIVERED" || order.status === "CANCELLED" || order.status === "RETURNED"}
            fullWidth
          />
          <Button
            title="Cancel order"
            variant="secondary"
            onPress={() => {
              // backend required — no-op frontend-only
            }}
            disabled={order.status === "DELIVERED" || order.status === "CANCELLED" || order.status === "RETURNED"}
            fullWidth
          />
        </View>
      </>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  errorWrap: { padding: spacing.lg },
  card: { backgroundColor: colors.backgroundAlt, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  customer: { color: colors.text, fontSize: typography.h3, fontWeight: '700', marginBottom: spacing.sm },
  meta: { color: colors.textMuted, fontSize: typography.bodySmall, marginTop: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: typography.h3, fontWeight: '700', marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  itemName: { color: colors.text, fontSize: typography.body, flex: 1 },
  itemMeta: { color: colors.textMuted, fontSize: typography.bodySmall },
  footer: {
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  actionError: { color: colors.danger, fontSize: typography.bodySmall, textAlign: "center" },
});
