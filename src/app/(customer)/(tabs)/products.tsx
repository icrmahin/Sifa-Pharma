import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/common/Header";
import SearchBar from "../../../components/common/SearchBar";
import ResponsiveContainer from "../../../components/common/ResponsiveContainer";
import ProductCard from "../../../components/products/ProductCard";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import { useResponsive } from "../../../hooks/useResponsive";
import type { Product } from "../../../types/product";
import type { Category } from "../../../types/category";
import type { Manufacturer } from "../../../types/manufacturer";

// frontend-only placeholders — no backend required
const mockProducts: Product[] = [];
const mockCategories: Category[] = [];
const mockManufacturers: Manufacturer[] = [];

export default function CustomerProductsScreen() {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [manufacturerId, setManufacturerId] = useState<string | null>(null);
  const { isMobile, isTablet, columns } = useResponsive();

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesQuery =
        !query ||
        [product.name, product.brand, product.genericName]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchesCategory = !categoryId || product.categoryId === categoryId;
      const matchesManufacturer =
        !manufacturerId || product.manufacturerId === manufacturerId;
      return matchesQuery && matchesCategory && matchesManufacturer;
    });
  }, [categoryId, manufacturerId, query]);

  const gridColumns = isMobile ? 1 : isTablet ? 2 : columns;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Products" subtitle="Browse by category and manufacturer" />
      <FlatList
        data={filteredProducts}
        contentContainerStyle={styles.container}
        keyExtractor={(item) => item.id}
        numColumns={gridColumns}
        columnWrapperStyle={gridColumns > 1 ? styles.gridRow : undefined}
        renderItem={({ item }) => (
          <View style={[styles.gridItem, gridColumns > 1 && { flexBasis: `${100 / gridColumns - 1}%` }]}>
            <ProductCard
              product={item}
              onPress={(product) =>
                router.push({
                  pathname: "/(customer)/products/[productId]",
                  params: { productId: product.id },
                })
              }
            />
          </View>
        )}
        ListHeaderComponent={
          <ResponsiveContainer>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="Search products"
            />

            <Text style={styles.label}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              <Pressable
                style={[styles.chip, !categoryId && styles.chipSelected]}
                accessibilityRole="button"
                onPress={() => setCategoryId(null)}
              >
                <Text style={[styles.chipText, !categoryId && styles.chipSelectedText]}>All</Text>
              </Pressable>
              {mockCategories.map((category) => (
                <Pressable
                  key={category.id}
                  style={[
                    styles.chip,
                    categoryId === category.id && styles.chipSelected,
                  ]}
                  accessibilityRole="button"
                  onPress={() => setCategoryId(category.id)}
                >
                  <Text style={[styles.chipText, categoryId === category.id && styles.chipSelectedText]}>{category.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.label}>Manufacturers</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              <Pressable
                style={[styles.chip, !manufacturerId && styles.chipSelected]}
                accessibilityRole="button"
                onPress={() => setManufacturerId(null)}
              >
                <Text style={[styles.chipText, !manufacturerId && styles.chipSelectedText]}>All</Text>
              </Pressable>
              {mockManufacturers.map((manufacturer) => (
                <Pressable
                  key={manufacturer.id}
                  style={[
                    styles.chip,
                    manufacturerId === manufacturer.id && styles.chipSelected,
                  ]}
                  accessibilityRole="button"
                  onPress={() => setManufacturerId(manufacturer.id)}
                >
                  <Text style={[styles.chipText, manufacturerId === manufacturer.id && styles.chipSelectedText]}>{manufacturer.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.resultText}>
              {filteredProducts.length} products
            </Text>
          </ResponsiveContainer>
        }
        ListEmptyComponent={
          <Text style={styles.resultText}>No products found</Text>
        }
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  gridRow: {
    gap: spacing.md,
  },
  gridItem: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: "700",
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  chipsRow: { paddingVertical: spacing.sm, gap: spacing.sm },
  chip: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  chipText: { color: colors.text, fontSize: typography.bodySmall, fontWeight: "600" },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipSelectedText: { color: colors.primary },
  resultText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
});
