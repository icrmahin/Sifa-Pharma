import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColors } from '../../../providers/ThemeProvider';
import Header from '../../../components/common/Header';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import type { Manufacturer } from '../../../types/manufacturer';

const mockManufacturers: Manufacturer[] = [];

export default function CustomerManufacturersScreen() {
  const colors = useThemeColors();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Manufacturers" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        {mockManufacturers.map((manufacturer) => (
          <Text key={manufacturer.id} style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border, color: colors.text }]} onPress={() => router.push({ pathname: '/(customer)/products/manufacturer/[manufacturerId]', params: { manufacturerId: manufacturer.id } })}>{manufacturer.name}</Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.md },
  card: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
});