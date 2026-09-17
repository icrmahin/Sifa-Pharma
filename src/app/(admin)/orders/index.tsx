import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import SearchBar from '../../../components/common/SearchBar';
import StatusBadge from '../../../components/common/StatusBadge';
import { useThemeColors } from '../../../providers/ThemeProvider';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import type { Order } from '../../../types/order';

export default function AdminOrdersScreen() {
  const colors = useThemeColors();
  const orders: Order[] = [];
  const [query, setQuery] = useState('');

  const filtered = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      order.customerName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
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
            <View
              key={order.id}
              style={[
                styles.row,
                {
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <View>
                <Text style={[styles.orderNumber, { color: colors.text }]}>{order.orderNumber}</Text>
                <Text style={[styles.customer, { color: colors.textMuted }]}>{order.customerName}</Text>
              </View>
              <StatusBadge label={order.status} tone={order.status === 'PENDING' ? 'warning' : order.status === 'DELIVERED' ? 'success' : 'info'} />
              <Text
                style={[styles.link, { color: colors.primary }]}
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
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
  },
  orderNumber: { fontSize: typography.body, fontWeight: '700' },
  customer: { fontSize: typography.caption },
  link: { fontWeight: '700' },
});
