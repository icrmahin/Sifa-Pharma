import { router } from "expo-router";
import { goBack } from '@/utils/navigation';
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../providers/ThemeProvider";
import Header from "../../components/common/Header";
import SearchBar from "../../components/common/SearchBar";
import ProductCard from "../../components/products/ProductCard";
import spacing from "../../constants/spacing";
import type { Product } from "../../types/product";

const mockProducts: Product[] = [];

export default function CustomerSearchScreen() {
  const colors = useThemeColors();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return mockProducts;
    const q = query.toLowerCase();
    return mockProducts.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.genericName.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }, [query]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Search" onBack={() => goBack()} />
      <FlatList
        data={results}
        contentContainerStyle={styles.container}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} onPress={(product) => router.push({ pathname: "/(customer)/products/[productId]", params: { productId: product.id } })} />}
        ListHeaderComponent={<SearchBar value={query} onChangeText={setQuery} placeholder="Search by medicine, brand or generic" />}
        ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyText, { color: colors.textMuted }]}>No products matched your search.</Text></View>}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  empty: { alignItems: "center", paddingVertical: spacing.xxl },
  emptyText: { fontSize: 12 },
});
