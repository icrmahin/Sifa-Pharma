import { router, useLocalSearchParams } from "expo-router";
import { goBack } from '@/utils/navigation';
import { useMemo } from "react";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../../../providers/ThemeProvider";
import Header from "../../../../components/common/Header";
import ProductCard from "../../../../components/products/ProductCard";
import spacing from "../../../../constants/spacing";
import type { Product } from "../../../../types/product";
import type { Manufacturer } from "../../../../types/manufacturer";

const mockManufacturers: Manufacturer[] = [];
const mockProducts: Product[] = [];

export default function ManufacturerProductsScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ manufacturerId: string }>();
  const manufacturer: Manufacturer = mockManufacturers.find((item) => item.id === params.manufacturerId) ?? mockManufacturers[0] ?? { id: params.manufacturerId ?? "placeholder", name: "Manufacturer" };
  const products = useMemo(() => mockProducts.filter((product) => product.manufacturerId === manufacturer.id), [manufacturer.id]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title={manufacturer.name} onBack={() => goBack()} />
      <FlatList data={products} contentContainerStyle={styles.container} keyExtractor={(item) => item.id} renderItem={({ item }) => <ProductCard product={item} onPress={(product) => router.push({ pathname: "/(customer)/products/[productId]", params: { productId: product.id } })} />} initialNumToRender={6} maxToRenderPerBatch={6} windowSize={5} removeClippedSubviews />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
});
