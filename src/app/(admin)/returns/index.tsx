import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import StatusBadge from '../../../components/common/StatusBadge';
import { useThemeColors } from '../../../providers/ThemeProvider';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import type { ReturnRequest } from '../../../types/return';

export default function AdminReturnsScreen() {
  const colors = useThemeColors();
  const returns: ReturnRequest[] = [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader title="Returns" subtitle="Customer return requests" />
      <ScrollView contentContainerStyle={styles.container}>
        {returns.length === 0 ? (
          <EmptyState title="No returns" message="Return requests will appear here." />
        ) : (
          returns.map((item) => (
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
              <Text style={[styles.order, { color: colors.text }]}>{item.orderId}</Text>
              <Text style={[styles.reason, { color: colors.textMuted }]}>{item.reason}</Text>
              <View style={styles.footer}>
                <StatusBadge
                  label={item.status}
                  tone={item.status === 'APPROVED' || item.status === 'PROCESSED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'warning'}
                />
                <Text
                  style={[styles.link, { color: colors.primary }]}
                  onPress={() =>
                    router.push({
                      pathname: '/(admin)/returns/[returnId]',
                      params: { returnId: item.id },
                    })
                  }
                >
                  Details
                </Text>
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
  order: { fontSize: typography.body, fontWeight: '700' },
  reason: { fontSize: typography.bodySmall, marginTop: spacing.xs, marginBottom: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { fontWeight: '700' },
});
