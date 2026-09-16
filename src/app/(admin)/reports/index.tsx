import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../../components/admin/AdminHeader';
import colors from '../../../constants/colors';
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
  // frontend-only: placeholder report — no backend
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
    <SafeAreaView style={styles.safeArea}>
      <AdminHeader title="Reports" subtitle="High-level performance" />
      <ScrollView contentContainerStyle={styles.container}>
        {reports.map((r) => (
          <View key={r.label} style={styles.card}>
            <Text style={styles.label}>{r.label}</Text>
            <Text style={styles.value}>{r.value}</Text>
          </View>
        ))}
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
