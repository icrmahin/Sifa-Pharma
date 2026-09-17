import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import SearchBar from '../../../components/common/SearchBar';
import { useThemeColors } from '../../../providers/ThemeProvider';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';

type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  orderCount?: number;
  totalSpent?: number;
};

export default function AdminCustomersScreen() {
  const colors = useThemeColors();
  const customers: CustomerRecord[] = [];
  const [query, setQuery] = useState('');

  const filtered = customers.filter((customer) =>
    customer.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader title="Customers" subtitle="Manage customer records" />
      <ScrollView contentContainerStyle={styles.container}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search customer" />
        {filtered.length === 0 ? (
          <EmptyState
            title="No customers found"
            message={
              customers.length === 0 ? "Customer accounts will appear here." : "Try a different search."
            }
          />
        ) : (
          filtered.map((customer) => (
            <View
              key={customer.id}
              style={[
                styles.row,
                {
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <View>
                <Text style={[styles.name, { color: colors.text }]}>{customer.name}</Text>
                <Text style={[styles.info, { color: colors.textMuted }]}>{customer.phone}</Text>
              </View>
              <Text
                style={[styles.link, { color: colors.primary }]}
                onPress={() =>
                  router.push({
                    pathname: '/(admin)/customers/[customerId]',
                    params: { customerId: customer.id },
                  })
                }
              >
                View
              </Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
  },
  name: { fontSize: typography.body, fontWeight: '700' },
  info: { fontSize: typography.caption },
  link: { fontWeight: '700' },
});
