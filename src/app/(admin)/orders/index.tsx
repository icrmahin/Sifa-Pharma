import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import SearchBar from '../../../components/common/SearchBar';
import StatusBadge from '../../../components/common/StatusBadge';
import colors from '../../../constants/colors';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import type { Order } from '../../../types/order';

export default function AdminOrdersScreen() {
  // frontend-only: empty typed array — no backend
  const orders: Order[] = [];
  const [query, setQuery] = useState('');

  const filtered = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      order.customerName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdminHeader title="Orders" subtitle="Approve and process orders" />
      <ScrollView contentContainerStyle={styles.container}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search order or customer" />
        {filtered.length === 0 ? (
          <EmptyState
            title="No orders found"
            message={
              orders.length === 0
                ? "Customer orders will appear here."
                : "Try a different search."
            }
          />
        ) : (
          filtered.map((order) => (
            <View key={order.id} style={styles.row}>
              <View>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <Text style={styles.customer}>{order.customerName}</Text>
              </View>
              <StatusBadge label={order.status} tone={order.status === 'PENDING' ? 'warning' : order.status === 'DELIVERED' ? 'success' : 'info'} />
              <Text
                style={styles.link}
                onPress={() => router.push({ pathname: '/(admin)/orders/[orderId]', params: { orderId: order.id } })}
              >
                Review
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  orderNumber: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  customer: { color: colors.textMuted, fontSize: typography.caption },
  link: { color: colors.primary, fontWeight: '700' },
});
