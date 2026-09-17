import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import { useThemeColors } from '../../../providers/ThemeProvider';
import spacing from '../../../constants/spacing';
import type { InventoryItem } from '../../../types/inventory';
import { formatDate } from '../../../utils/date';

export default function ExpiryManagementScreen() {
  const colors = useThemeColors();
  const batches: InventoryItem[] = [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader title="Expiry" subtitle="Monitor expiring batches" />
      <ScrollView contentContainerStyle={styles.container}>
        {batches.length === 0 ? (
          <EmptyState title="Nothing expiring" message="No batches expire within the next 90 days." />
        ) : (
          batches.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <Text style={[styles.heading, { color: colors.text }]}>{item.productName}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>Batch: {item.batchNumber}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>Expiry: {formatDate(item.expiryDate ?? "")}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>Qty: {item.quantity}</Text>
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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
  },
  heading: { fontWeight: '700' },
  meta: { marginTop: spacing.xs },
});
