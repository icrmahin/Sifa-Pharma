import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { goBack } from '@/utils/navigation';
import { useThemeColors } from '../../../providers/ThemeProvider';
import Button from '../../../components/common/Button';
import Header from '../../../components/common/Header';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import type { Address } from '../../../types/address';

const mockAddresses: Address[] = [];

export default function CustomerAddressesScreen() {
  const colors = useThemeColors();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Addresses" onBack={() => goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        {mockAddresses.map((address) => (
          <View key={address.id} style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.text }]}>{address.label}</Text>
            <Text style={[styles.text, { color: colors.textMuted }]}>{address.street}</Text>
            <Text style={[styles.text, { color: colors.textMuted }]}>{address.city}</Text>
          </View>
        ))}
        <Button title="Add address" onPress={() => router.push('/(customer)/address/edit')} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  card: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  label: { fontWeight: "700", marginBottom: spacing.xs },
  text: { fontSize: 12 },
});