import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../../components/admin/AdminHeader';
import { useThemeColors } from '../../../providers/ThemeProvider';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import { formatCurrency } from '../../../utils/currency';

type ReportState = {
  revenue: number;
  ordersToday: number;
  avgOrderValue: number;
  lowStock: number;
  outOfStock: number;
};

export default function AdminReportsScreen() {
  const colors = useThemeColors();
  const report: ReportState = {
    revenue: 0,
    ordersToday: 0,
    avgOrderValue: 0,
    lowStock: 0,
    outOfStock: 0,
  };

  const reports = [
    { label: "Revenue", value: formatCurrency(report.revenue) },
    { label: "Delivered orders", value: String(report.ordersToday) },
    { label: "Avg order value", value: formatCurrency(report.avgOrderValue) },
    { label: "Low stock", value: String(report.lowStock) },
    { label: "Out of stock", value: String(report.outOfStock) },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader title="Reports" subtitle="High-level performance" />
      <ScrollView contentContainerStyle={styles.container}>
        {reports.map((r) => (
          <View
            key={r.label}
            style={[
              styles.card,
              {
                backgroundColor: colors.backgroundAlt,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <Text style={[styles.label, { color: colors.textMuted }]}>{r.label}</Text>
            <Text style={[styles.value, { color: colors.text }]}>{r.value}</Text>
          </View>
        ))}
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
