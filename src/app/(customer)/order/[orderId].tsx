import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '../../../providers/ThemeProvider';
import Header from '../../../components/common/Header';
import StatusBadge from '../../../components/common/StatusBadge';
import LoadingState from '../../../components/common/LoadingState';
import ErrorState from '../../../components/common/ErrorState';
import EmptyState from '../../../components/common/EmptyState';
import spacing from '../../../constants/spacing';
import { useOrder } from '../../../hooks/useOrders';
import { formatCurrency } from '../../../utils/currency';
import { formatDateTime } from '../../../utils/date';

export default function CustomerOrderDetailScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ orderId: string }>();
  const orderId = params.orderId as string;
  const { order, loading, error, reload } = useOrder(orderId);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Order" onBack={() => router.back()} />
        <LoadingState label="Loading order" />
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Order" onBack={() => router.back()} />
        <ErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }
  if (!order) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Order" onBack={() => router.back()} />
        <EmptyState title="Order not found" message="This order may have been removed." actionLabel="Back to orders" onAction={() => router.back()} />
      </SafeAreaView>
    );
  }

  const tone = order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : order.status === 'PENDING' ? 'warning' : 'info';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title={order.orderNumber} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Order summary</Text>
          <StatusBadge label={order.status} tone={tone as any} />
          <Text style={[styles.meta, { color: colors.textMuted }]}>Placed {formatDateTime(order.createdAt)}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Delivery address: {order.address}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Payment: Cash on Delivery</Text>
          <View style={[styles.totals, { borderTopColor: colors.borderLight }]}>
            <View style={styles.row}><Text style={[styles.label, { color: colors.textMuted }]}>Subtotal</Text><Text style={[styles.value, { color: colors.text }]}>{formatCurrency(order.subtotal)}</Text></View>
            <View style={styles.row}><Text style={[styles.label, { color: colors.textMuted }]}>Discount</Text><Text style={[styles.value, { color: colors.text }]}>-{formatCurrency(order.discount)}</Text></View>
            <View style={styles.row}><Text style={[styles.label, { color: colors.textMuted }]}>Delivery</Text><Text style={[styles.value, { color: colors.text }]}>{formatCurrency(order.deliveryFee)}</Text></View>
            <View style={[styles.row, styles.totalRow]}><Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text><Text style={[styles.totalValue, { color: colors.text }]}>{formatCurrency(order.total)}</Text></View>
          </View>
        </View>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Products</Text>
          {order.items.length === 0 ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>No items.</Text>
          ) : (
            order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.productName}</Text>
                  <Text style={[styles.itemMeta, { color: colors.textMuted }]}>{item.quantity} × {formatCurrency(item.unitPrice)} {item.discountPercent ? `· ${item.discountPercent}% off` : ''}</Text>
                </View>
                <Text style={[styles.itemTotal, { color: colors.text }]}>{formatCurrency(item.total)}</Text>
              </View>
            ))
          )}
        </View>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Timeline</Text>
          {(order.timeline || []).map((step) => (
            <View key={`${step.label}-${step.time}`} style={styles.timelineRow}>
              <Text style={[styles.timelineLabel, { color: colors.text }]}>{step.label}</Text>
              <Text style={[styles.timelineTime, { color: colors.textMuted }]}>{formatDateTime(step.time)}</Text>
              {step.note ? <Text style={[styles.timelineNote, { color: colors.textMuted }]}>{step.note}</Text> : null}
            </View>
          ))}
          {(!order.timeline || order.timeline.length === 0) ? <Text style={[styles.meta, { color: colors.textMuted }]}>No timeline events yet.</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  card: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  title: { fontSize: 20, fontWeight: '700', marginBottom: spacing.md },
  meta: { fontSize: 12, marginTop: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md, gap: spacing.md },
  itemName: { flex: 1, fontWeight: '600' },
  itemMeta: { fontSize: 12 },
  itemTotal: { fontWeight: '700' },
  timelineRow: { marginBottom: spacing.md },
  timelineLabel: { fontWeight: '700', fontSize: 12 },
  timelineTime: { fontSize: 12 },
  timelineNote: { fontSize: 12, marginTop: spacing.xs },
  totals: { marginTop: spacing.md, borderTopWidth: 1, paddingTop: spacing.md, gap: spacing.xs },
  label: { fontSize: 12 },
  value: { fontSize: 12, fontWeight: '600' },
  totalRow: { marginTop: spacing.sm, borderTopWidth: 1, paddingTop: spacing.sm, borderTopColor: '#eee' },
  totalLabel: { fontWeight: '700' },
  totalValue: { fontWeight: '800', fontSize: 14 },
});
