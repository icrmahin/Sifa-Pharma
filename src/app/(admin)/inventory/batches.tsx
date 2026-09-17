import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import StatusBadge from '../../../components/common/StatusBadge';
import { useThemeColors } from '../../../providers/ThemeProvider';
import spacing from '../../../constants/spacing';
import type { InventoryItem } from '../../../types/inventory';

export default function InventoryBatchesScreen() {
  const colors = useThemeColors();
  const batches: InventoryItem[] = [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader title="Batches" subtitle="Track each batch independently" />
      <ScrollView contentContainerStyle={styles.container}>
        {batches.length === 0 ? (
          <EmptyState title="No batches" message="Product batches will appear here." />
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
              <Text style={[styles.heading, { color: colors.text }]}>{item.batchNumber}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{item.productName}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>Quantity: {item.quantity}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge
                  label={item.status}
                  tone={item.status === 'out_of_stock' ? 'danger' : item.status === 'low' ? 'warning' : 'success'}
                />
              </View>
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
  badgeRow: { marginTop: spacing.sm },
});
