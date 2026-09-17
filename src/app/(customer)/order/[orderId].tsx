import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useThemeColors } from '../../../providers/ThemeProvider';
import Header from '../../../components/common/Header';
import StatusBadge from '../../../components/common/StatusBadge';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import type { Order } from '../../../types/order';
import { formatCurrency } from '../../../utils/currency';
import { formatDateTime } from '../../../utils/date';

const mockOrders: Order[] = [
  {
    id: "placeholder-order",
    orderNumber: "ORD-PL0001",
    customerId: "placeholder-customer",
    customerName: "Demo customer",
    createdAt: new Date().toISOString(),
    status: "PENDING",
    subtotal: 0, discount: 0, deliveryFee: 0, total: 0,
    paymentMethod: "CASH_ON_DELIVERY",
    address: "Backend required for real order data",
    items: [],
    timeline: [{ label: "Order placed", time: new Date().toISOString(), note: "Backend required" }],
  },
];

export default function CustomerOrderDetailScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ orderId: string }>();
  const order = useMemo(() => mockOrders.find((item) => item.id === params.orderId) ?? mockOrders[0], [params.orderId]);
  const tone = order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : order.status === 'PENDING' ? 'warning' : 'info';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title={order.orderNumber} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Order summary</Text>
          <StatusBadge label={order.status} tone={tone} />
          <Text style={[styles.meta, { color: colors.textMuted }]}>Placed {formatDateTime(order.createdAt)}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Delivery address: {order.address}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Payment: Cash on Delivery</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Products</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.row}><Text style={[styles.itemName, { color: colors.text }]}>{item.productName}</Text><Text style={[styles.itemMeta, { color: colors.textMuted }]}>{item.quantity} × {formatCurrency(item.unitPrice)}</Text></View>
          ))}
        </View>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Timeline</Text>
          {order.timeline.map((step) => (
            <View key={`${step.label}-${step.time}`} style={styles.timelineRow}>
              <Text style={[styles.timelineLabel, { color: colors.text }]}>{step.label}</Text>
              <Text style={[styles.timelineTime, { color: colors.textMuted }]}>{step.time}</Text>
              {step.note ? <Text style={[styles.timelineNote, { color: colors.textMuted }]}>{step.note}</Text> : null}
            </View>
          ))}
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
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  itemName: { flex: 1 },
  itemMeta: { color: '#B8C0BC', fontSize: 12 },
  timelineRow: { marginBottom: spacing.md },
  timelineLabel: { color: '#F0F2F1', fontWeight: '700', fontSize: 12 },
  timelineTime: { color: '#B8C0BC', fontSize: 12 },
  timelineNote: { color: '#B8C0BC', fontSize: 12, marginTop: spacing.xs },
});