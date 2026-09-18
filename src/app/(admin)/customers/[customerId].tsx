import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/utils/navigation';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import { useThemeColors } from '../../../providers/ThemeProvider';
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
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ customerId: string }>();
  const customerId = params.customerId;

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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <AdminHeader title="Customer" subtitle="Customer overview" />
        <EmptyState
          title="Customer not found"
          message="This account may have been removed."
          actionLabel="Back to customers"
          onAction={() => goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader title={customer?.name ?? "Customer"} subtitle="Customer overview" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight }]}>
          <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
          <Text style={[styles.value, { color: colors.textMuted }]}>{customer.phone}</Text>
          <Text style={[styles.label, { color: colors.text }]}>Orders</Text>
          <Text style={[styles.value, { color: colors.textMuted }]}>{customer.orderCount}</Text>
          <Text style={[styles.label, { color: colors.text }]}>Total spending</Text>
          <Text style={[styles.value, { color: colors.textMuted }]}>{formatCurrency(customer.totalSpent)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
  },
  label: { fontSize: typography.bodySmall, fontWeight: '700', marginTop: spacing.md },
  value: { fontSize: typography.body, marginTop: spacing.xs },
});
