import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../../components/admin/AdminHeader';
import { useThemeColors } from '../../../providers/ThemeProvider';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import { formatCurrency } from '../../../utils/currency';

export default function AdminInventoryReportScreen() {
  const colors = useThemeColors();
  const lowStock: number | null = 0;
  const outOfStock: number | null = 0;
  const expired: number | null = 0;
  const value: number | null = 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader title="Inventory report" subtitle="Stock movement summary" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Low-stock items</Text>
          <Text style={[styles.value, { color: colors.text }]}>{lowStock !== null ? `${lowStock} products` : "—"}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Out of stock</Text>
          <Text style={[styles.value, { color: colors.text }]}>{outOfStock !== null ? String(outOfStock) : "—"}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Expired batches</Text>
          <Text style={[styles.value, { color: colors.text }]}>{expired !== null ? String(expired) : "—"}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Inventory value</Text>
          <Text style={[styles.value, { color: colors.text }]}>{value !== null ? formatCurrency(value) : "—"}</Text>
        </View>
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
  label: { fontSize: typography.bodySmall },
  value: { fontWeight: '700', marginTop: spacing.xs, fontSize: typography.h2 },
});
