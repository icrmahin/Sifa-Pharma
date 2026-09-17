import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemeColors } from '../../../providers/ThemeProvider';
import Header from '../../../components/common/Header';
import spacing from '../../../constants/spacing';
import typography from '../../../constants/typography';
import type { Category } from '../../../types/category';

const mockCategories: Category[] = [];

export default function CustomerCategoriesScreen() {
  const colors = useThemeColors();
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Categories" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        {mockCategories.map((category) => (
          <Text key={category.id} style={[styles.card, { backgroundColor: colors.backgroundAlt, borderColor: colors.border, color: colors.text }]} onPress={() => router.push({ pathname: '/(customer)/products/category/[categoryId]', params: { categoryId: category.id } })}>
            {category.name}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.md },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#D0D6D4', padding: spacing.lg, color: '#18201E', fontSize: 14, fontWeight: '600' },
});