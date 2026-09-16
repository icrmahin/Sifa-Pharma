import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import colors from '../../../constants/colors';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import { formatCurrency } from '../../../utils/currency';

type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
};

export default function AdminCustomerDetailScreen() {
  const params = useLocalSearchParams<{ customerId: string }>();
  const customerId = params.customerId;

  // frontend-only: placeholder single object — no backend
  const customer: CustomerRecord | null = customerId
    ? {
        id: String(customerId),
        name: "Placeholder Customer",
        phone: "+0000000000",
        orderCount: 0,
        totalSpent: 0,
      }
    : null;

  if (!customer) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AdminHeader title="Customer" subtitle="Customer overview" />
        <EmptyState
          title="Customer not found"
          message="This account may have been removed."
          actionLabel="Back to customers"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdminHeader title={customer?.name ?? "Customer"} subtitle="Customer overview" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{customer.phone}</Text>
          <Text style={styles.label}>Orders</Text>
          <Text style={styles.value}>{customer.orderCount}</Text>
          <Text style={styles.label}>Total spending</Text>
          <Text style={styles.value}>{formatCurrency(customer.totalSpent)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  errorWrap: { padding: spacing.lg },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  label: { color: colors.text, fontSize: typography.bodySmall, fontWeight: '700', marginTop: spacing.md },
  value: { color: colors.textMuted, fontSize: typography.body, marginTop: spacing.xs },
});
