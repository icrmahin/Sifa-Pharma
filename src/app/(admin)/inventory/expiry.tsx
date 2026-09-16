import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import colors from '../../../constants/colors';
import spacing from '../../../constants/spacing';
import type { InventoryItem } from '../../../types/inventory';
import { formatDate } from '../../../utils/date';

export default function ExpiryManagementScreen() {
  // frontend-only: empty typed array — no backend
  const batches: InventoryItem[] = [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdminHeader title="Expiry" subtitle="Monitor expiring batches" />
      <ScrollView contentContainerStyle={styles.container}>
        {batches.length === 0 ? (
          <EmptyState title="Nothing expiring" message="No batches expire within the next 90 days." />
        ) : (
          batches.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.heading}>{item.productName}</Text>
              <Text style={styles.meta}>Batch: {item.batchNumber}</Text>
              <Text style={styles.meta}>Expiry: {formatDate(item.expiryDate ?? "")}</Text>
              <Text style={styles.meta}>Qty: {item.quantity}</Text>
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
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  heading: { color: colors.text, fontWeight: '700' },
  meta: { color: colors.textMuted, marginTop: spacing.xs },
});
