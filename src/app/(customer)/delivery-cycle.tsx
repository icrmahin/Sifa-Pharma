import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColors } from '../../providers/ThemeProvider';
import Header from '../../components/common/Header';
import StatusBadge from '../../components/common/StatusBadge';
import spacing from '../../constants/spacing';
import typography from '../../constants/typography';
import type { DeliveryCycle } from '../../types/deliveryCycle';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';

const mockDeliveryCycle: DeliveryCycle = {
  id: "placeholder-cycle",
  customerId: "placeholder-customer",
  status: "PENDING",
  startedAt: new Date().toISOString(),
  closesAt: new Date().toISOString(),
  estimatedTotal: 0,
  products: [],
  createdAt: new Date().toISOString(),
};

export default function DeliveryCycleScreen() {
  const colors = useThemeColors();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Delivery cycle" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Active order cycle</Text>
          <StatusBadge label={mockDeliveryCycle.status} tone={mockDeliveryCycle.status === 'PENDING' ? 'warning' : 'info'} />
          <Text style={[styles.meta, { color: colors.textMuted }]}>Start: {formatDateTime(mockDeliveryCycle.startedAt)}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Closes: {formatDateTime(mockDeliveryCycle.closesAt)}</Text>
          <Text style={[styles.total, { color: colors.text }]}>Estimated total: {formatCurrency(mockDeliveryCycle.estimatedTotal)}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Products in cycle</Text>
          {mockDeliveryCycle.products.map((product) => (
            <View key={product.id} style={styles.row}><Text style={[styles.itemName, { color: colors.text }]}>{product.name}</Text><Text style={[styles.itemPrice, { color: colors.text }]}>{formatCurrency(product.price)}</Text></View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  card: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  title: { fontSize: 20, fontWeight: '700', marginBottom: spacing.md },
  meta: { fontSize: 12, marginTop: spacing.sm },
  total: { marginTop: spacing.md, fontWeight: '700' },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  itemName: { flex: 1 },
  itemPrice: { color: '#3D4A46' },
});