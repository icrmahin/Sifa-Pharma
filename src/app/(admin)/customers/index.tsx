import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AdminHeader from '../../../components/admin/AdminHeader';
import EmptyState from '../../../components/common/EmptyState';
import SearchBar from '../../../components/common/SearchBar';
import colors from '../../../constants/colors';
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
  // frontend-only: empty typed array — no backend
  const customers: CustomerRecord[] = [];
  const [query, setQuery] = useState('');

  const filtered = customers.filter((customer) =>
    customer.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
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
            <View key={customer.id} style={styles.row}>
              <View>
                <Text style={styles.name}>{customer.name}</Text>
                <Text style={styles.info}>{customer.phone}</Text>
              </View>
              <Text
                style={styles.link}
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
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  name: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  info: { color: colors.textMuted, fontSize: typography.caption },
  link: { color: colors.primary, fontWeight: '700' },
});
