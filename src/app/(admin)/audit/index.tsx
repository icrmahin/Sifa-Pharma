import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import { useThemeColors } from '../../../providers/ThemeProvider';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import type { AuditEntry } from '../../../types/audit';
import { formatDateTime } from '../../../utils/date';

export default function AuditLogScreen() {
  const colors = useThemeColors();
  const entries: AuditEntry[] = [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader title="Audit log" subtitle="Recent operational activity" />
      <ScrollView contentContainerStyle={styles.container}>
        {entries.length === 0 ? (
          <EmptyState title="No audit entries" message="Operational activity will appear here." />
        ) : (
          entries.map((entry) => (
            <View
              key={entry.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <Text style={[styles.action, { color: colors.text }]}>{entry.action}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{entry.actor}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{formatDateTime(entry.timestamp)}</Text>
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
  action: { fontSize: typography.body, fontWeight: '700' },
  meta: { fontSize: typography.bodySmall, marginTop: spacing.xs },
});
