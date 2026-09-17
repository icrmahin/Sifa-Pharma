import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../../../providers/ThemeProvider";
import Header from "../../../../components/common/Header";
import ProductCard from "../../../../components/products/ProductCard";
import spacing from "../../../../constants/spacing";
import type { Product } from "../../../../types/product";
import type { Category } from "../../../../types/category";

const mockCategories: Category[] = [];
const mockProducts: Product[] = [];

export default function CategoryProductsScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ categoryId: string }>();
  const category: Category = mockCategories.find((item) => item.id === params.categoryId) ?? mockCategories[0] ?? { id: params.categoryId ?? "placeholder", name: "Category", slug: "placeholder" };
  const products = useMemo(() => mockProducts.filter((product) => product.categoryId === category.id), [category.id]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title={category.name} onBack={() => router.back()} />
      <FlatList data={products} contentContainerStyle={styles.container} keyExtractor={(item) => item.id} renderItem={({ item }) => <ProductCard product={item} onPress={(product) => router.push({ pathname: "/(customer)/products/[productId]", params: { productId: product.id } })} />} initialNumToRender={6} maxToRenderPerBatch={6} windowSize={5} removeClippedSubviews />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
});