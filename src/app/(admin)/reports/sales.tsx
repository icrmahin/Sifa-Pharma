import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../../components/admin/AdminHeader';
import colors from '../../../constants/colors';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import { formatCurrency } from '../../../utils/currency';

export default function AdminSalesReportScreen() {
  // frontend-only: placeholder values — no backend
  const revenue: number | null = 0;
  const orders: number | null = 0;
  const discounts: number | null = 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdminHeader title="Sales report" subtitle="Revenue overview" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Revenue</Text>
          <Text style={styles.value}>{revenue !== null ? formatCurrency(revenue) : "—"}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Delivered orders</Text>
          <Text style={styles.value}>{orders !== null ? String(orders) : "—"}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Discounts given</Text>
          <Text style={styles.value}>{discounts !== null ? formatCurrency(discounts) : "—"}</Text>
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
