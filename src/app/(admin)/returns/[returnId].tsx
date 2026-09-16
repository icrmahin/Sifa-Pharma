import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import StatusBadge from '../../../components/common/StatusBadge';
import colors from '../../../constants/colors';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import type { ReturnRequest } from '../../../types/return';

export default function AdminReturnDetailScreen() {
  const params = useLocalSearchParams<{ returnId: string }>();
  const returnId = params.returnId;

  // frontend-only: placeholder single object — no backend
  const item: ReturnRequest | null = returnId
    ? {
        id: String(returnId),
        orderId: "order-placeholder",
        customerId: "customer-placeholder",
        customerName: "Placeholder Customer",
        productName: "Placeholder Product",
        quantity: 1,
        reason: "Frontend-only placeholder — backend required",
        status: "PENDING",
        createdAt: new Date().toISOString(),
      }
    : null;

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AdminHeader title="Return" subtitle="Return request" />
        <EmptyState
          title="Return not found"
          message="This request may have been removed."
          actionLabel="Back to returns"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdminHeader title={item?.id ?? "Return"} subtitle="Return request" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Order</Text>
          <Text style={styles.value}>{item.orderId}</Text>
          <Text style={styles.label}>Product</Text>
          <Text style={styles.value}>{item.productName}</Text>
          <Text style={styles.label}>Reason</Text>
          <Text style={styles.value}>{item.reason}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge
              label={item.status}
              tone={item.status === 'APPROVED' || item.status === 'PROCESSED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'}
            />
          </View>
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
  badgeRow: { marginTop: spacing.md },
});
