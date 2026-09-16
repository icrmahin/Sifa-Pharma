import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../../components/admin/AdminHeader';
import colors from '../../../constants/colors';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import { formatCurrency } from '../../../utils/currency';

export default function AdminInventoryReportScreen() {
  // frontend-only: placeholder values — no backend
  const lowStock: number | null = 0;
  const outOfStock: number | null = 0;
  const expired: number | null = 0;
  const value: number | null = 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdminHeader title="Inventory report" subtitle="Stock movement summary" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Low-stock items</Text>
          <Text style={styles.value}>{lowStock !== null ? `${lowStock} products` : "—"}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Out of stock</Text>
          <Text style={styles.value}>{outOfStock !== null ? String(outOfStock) : "—"}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Expired batches</Text>
          <Text style={styles.value}>{expired !== null ? String(expired) : "—"}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Inventory value</Text>
          <Text style={styles.value}>{value !== null ? formatCurrency(value) : "—"}</Text>
        </View>
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
  label: { color: colors.textMuted, fontSize: typography.bodySmall },
  value: { color: colors.text, fontWeight: '700', marginTop: spacing.xs, fontSize: typography.h2 },
});
