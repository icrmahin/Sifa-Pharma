import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../../components/admin/AdminHeader';
import { useThemeColors } from '../../../providers/ThemeProvider';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import { formatCurrency } from '../../../utils/currency';

export default function AdminSalesReportScreen() {
  const colors = useThemeColors();
  const revenue: number | null = 0;
  const orders: number | null = 0;
  const discounts: number | null = 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader title="Sales report" subtitle="Revenue overview" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Revenue</Text>
          <Text style={[styles.value, { color: colors.text }]}>{revenue !== null ? formatCurrency(revenue) : "—"}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Delivered orders</Text>
          <Text style={[styles.value, { color: colors.text }]}>{orders !== null ? String(orders) : "—"}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Discounts given</Text>
          <Text style={[styles.value, { color: colors.text }]}>{discounts !== null ? formatCurrency(discounts) : "—"}</Text>
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
