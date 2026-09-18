/* eslint-disable react-hooks/immutability -- Reanimated shared values are mutable by design */
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, useReducedMotion } from "react-native-reanimated";
import { useThemeColors } from "../../../providers/ThemeProvider";
import AppLogo from "../../../components/common/AppLogo";
import ErrorState from "../../../components/common/ErrorState";
import LoadingState from "../../../components/common/LoadingState";
import SearchBar from "../../../components/common/SearchBar";
import Icon from "../../../components/common/Icon";
import ResponsiveContainer from "../../../components/common/ResponsiveContainer";
import ProductCard from "../../../components/products/ProductCard";
import ProductHeroSlider from "../../../components/products/ProductHeroSlider";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import { radius, layout } from "../../../constants/sizes";
import { springConfigs } from "../../../lib/motion";
import { useResponsive } from "../../../hooks/useResponsive";
import type { Product } from "../../../types/product";
import type { Category } from "../../../types/category";
import type { Manufacturer } from "../../../types/manufacturer";
import { useCart } from "../../../providers/CartProvider";
import { useProducts, useCategories, useManufacturers } from "../../../hooks/useProducts";

type DiscoveryTab = "all" | "trending" | "discount" | "new";

export default function CustomerHomeScreen() {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<DiscoveryTab>("all");
  const [showFilter, setShowFilter] = useState(false);
  const { itemCount } = useCart();
  const { isMobile, isTablet, columns } = useResponsive();

  const { data: products, loading: productsLoading, error: productsError, reload: reloadProducts } = useProducts();
  const { data: categories, loading: categoriesLoading } = useCategories();
  const { data: manufacturers, loading: manufacturersLoading } = useManufacturers();

  useEffect(() => {
    const timer = setTimeout(() => { setLoading(false); }, 350);
    return () => clearTimeout(timer);
  }, []);

  const featured = useMemo(() => products.filter((p) => p.isFeatured), [products]);
  const newProducts = useMemo(() => [...products].slice(0, 3), [products]);
  const discounted = useMemo(() => products.filter((p) => p.discountPercent && p.discountPercent > 0), [products]);
  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return products.slice(0, 4);
    return products.filter((p) =>
      [p.name, p.brand, p.genericName, p.description].join(" ").toLowerCase().includes(normalizedQuery)
    ).slice(0, 5);
  }, [query, products]);

  const activeProducts = useMemo(() => {
    if (activeTab === "all") return products;
    switch (activeTab) {
      case "trending": return featured;
      case "discount": return discounted;
      case "new": return newProducts;
      default: return products;
    }
  }, [activeTab, featured, discounted, newProducts, products]);

  const openProduct = (product: Product) => {
    setSearchFocused(false);
    router.push({ pathname: "/(customer)/products/[productId]", params: { productId: product.id } });
  };

  if (loading) return <LoadingState label="Loading your pharmacy" />;
  if (error) return <ErrorState message={error} />;

  const gridColumns = isMobile ? 1 : isTablet ? 2 : columns;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <ResponsiveContainer>
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <AppLogo size={38} />
              <Text style={[styles.brandName, { color: colors.text }]}>Sifa-Pharma</Text>
            </View>
          </View>

          <View style={styles.searchArea}>
            <SearchBar value={query} onChangeText={setQuery} onFocus={() => setSearchFocused(true)} placeholder="Search medicines, health products..." />
            {searchFocused ? (
              <View style={[styles.searchPanel, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                <Text style={[styles.searchPanelTitle, { color: colors.textMuted }]}>
                  {query ? "Recommended matches" : "Popular medicines"}
                </Text>
                <FlatList
                  data={searchResults}
                  keyboardShouldPersistTaps="handled"
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable style={styles.searchResult} onPress={() => openProduct(item)}>
                      <Text style={[styles.searchResultName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.searchResultMeta, { color: colors.textMuted }]} numberOfLines={1}>{item.brand} · {item.genericName}</Text>
                    </Pressable>
                  )}
                  ListEmptyComponent={<Text style={[styles.noResults, { color: colors.textMuted }]}>No medicines found</Text>}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.heroSection}>
            <ProductHeroSlider products={products.length > 0 ? products.slice(0, 4) : []} onProductPress={openProduct} />
          </View>

          <View style={styles.discoverySection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.discoveryControls}>
              <FilterPill active={showFilter} onPress={() => setShowFilter(!showFilter)} colors={colors} />
              <DiscoveryPill label="All" icon="grid-view" active={activeTab === "all" && !showFilter} onPress={() => { setActiveTab("all"); setShowFilter(false); }} colors={colors} />
              <DiscoveryPill label="Trending" icon="trending-up" active={activeTab === "trending" && !showFilter} onPress={() => { setActiveTab("trending"); setShowFilter(false); }} colors={colors} />
              <DiscoveryPill label="Discount" icon="local-offer" active={activeTab === "discount" && !showFilter} onPress={() => { setActiveTab("discount"); setShowFilter(false); }} colors={colors} />
              <DiscoveryPill label="New" icon="new-releases" active={activeTab === "new" && !showFilter} onPress={() => { setActiveTab("new"); setShowFilter(false); }} colors={colors} />
            </ScrollView>

            {showFilter ? (
              <View style={[styles.filterPanel, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                <Text style={[styles.filterTitle, { color: colors.text }]}>Categories</Text>
                <View style={styles.categoryGrid}>
                  {categories.map((category) => (
                    <Pressable key={category.id} style={[styles.categoryItem, { backgroundColor: colors.primarySoft, borderColor: colors.border }]} onPress={() => { setShowFilter(false); router.push({ pathname: "/(customer)/products/category/[categoryId]", params: { categoryId: category.id } }); }}>
                      <Icon name="category" size={18} color={colors.primary} />
                      <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                    </Pressable>
                  ))}
                  {categories.length === 0 ? <Text style={[styles.noResults, { color: colors.textMuted }]}>No categories available</Text> : null}
                </View>
              </View>
            ) : null}

            <View style={[styles.productsGrid, gridColumns > 1 && styles.productsGridMulti]}>
              {activeProducts.length > 0 ? (
                activeProducts.map((product) => (
                  <View key={product.id} style={[styles.productGridItem, gridColumns > 1 && { flexBasis: `${100 / gridColumns - 1}%` }]}>
                    <ProductCard product={product} compact onPress={openProduct} />
                  </View>
                ))
              ) : (
                <View style={styles.emptyProducts}>
                  <Icon name="inventory-2" size={32} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>No products to display</Text>
                </View>
              )}
            </View>
          </View>
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

function IconButtonCart({ itemCount, onPress }: { itemCount: number; onPress: () => void }) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const colors = useThemeColors();

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => { if (reducedMotion) return; scale.value = withSpring(0.9, springConfigs.press); };
  const handlePressOut = () => { if (reducedMotion) return; scale.value = withSpring(1, springConfigs.press); };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} accessibilityLabel={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}>
      <Animated.View style={[styles.cartButton, animatedStyle, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}>
        <Icon name="shopping-cart" size={22} color={colors.primary} />
        {itemCount > 0 ? <View style={[styles.cartBadge, { backgroundColor: colors.gold }]}><Text style={[styles.cartBadgeText, { color: colors.white }]}>{itemCount > 99 ? "99+" : itemCount}</Text></View> : null}
      </Animated.View>
    </Pressable>
  );
}

function FilterPill({ active, onPress, colors }: { active: boolean; onPress: () => void; colors: { white: string; textMuted: string; primary: string; backgroundAlt: string; border: string } }) {
  return (
    <Pressable onPress={onPress} style={[styles.discoveryPill, active && styles.discoveryPillActive, { backgroundColor: active ? colors.primary : colors.backgroundAlt, borderColor: colors.border }]}>
      <Icon name="filter-list" size={16} color={active ? colors.white : colors.textMuted} />
      <Text style={[styles.discoveryPillText, active && styles.discoveryPillTextActive, { color: active ? colors.white : colors.textMuted }]}>Filter</Text>
    </Pressable>
  );
}

function DiscoveryPill({ label, icon, active, onPress, colors }: { label: string; icon: string; active: boolean; onPress: () => void; colors: { white: string; textMuted: string; primary: string; backgroundAlt: string; border: string } }) {
  return (
    <Pressable onPress={onPress} style={[styles.discoveryPill, active && styles.discoveryPillActive, { backgroundColor: active ? colors.primary : colors.backgroundAlt, borderColor: colors.border }]}>
      <Icon name={icon as any} size={16} color={active ? colors.white : colors.textMuted} />
      <Text style={[styles.discoveryPillText, active && styles.discoveryPillTextActive, { color: active ? colors.white : colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingBottom: spacing.xxl },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: spacing.md, marginBottom: spacing.md },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  brandName: { fontWeight: "600" },
  cartButton: { width: layout.iconButtonSize, height: layout.iconButtonSize, borderRadius: layout.iconButtonSize / 2, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  cartBadge: { position: "absolute", top: -2, right: -4, minWidth: 16, height: 16, paddingHorizontal: 3, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cartBadgeText: { fontWeight: "700", fontSize: 9 },
  searchArea: { position: "relative", zIndex: 10, marginBottom: spacing.lg },
  searchPanel: { position: "absolute", top: layout.inputHeight + spacing.xs, left: 0, right: 0, maxHeight: 290, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, zIndex: 20, elevation: 5 },
  searchPanelTitle: { fontWeight: "700", marginBottom: spacing.xs, fontSize: 12 },
  searchResult: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: "#253029" },
  searchResultName: { fontWeight: "700", fontSize: 12 },
  searchResultMeta: { fontSize: 12, marginTop: spacing.xs },
  noResults: { paddingVertical: spacing.md },
  heroSection: { marginBottom: spacing.lg },
  discoverySection: {},
  discoveryControls: { gap: spacing.sm, paddingVertical: spacing.sm },
  discoveryPill: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.lg, height: layout.controlHeight, borderRadius: radius.pill, borderWidth: 1 },
  discoveryPillActive: {},
  discoveryPillText: { fontWeight: "600", fontSize: 12 },
  discoveryPillTextActive: { fontWeight: "700" },
  filterPanel: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, marginTop: spacing.sm, marginBottom: spacing.md },
  filterTitle: { fontWeight: "700", fontSize: 12, marginBottom: spacing.sm },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  categoryItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1 },
  categoryName: { fontWeight: "600", fontSize: 12 },
  productsGrid: { marginTop: spacing.sm },
  productsGridMulti: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  productGridItem: { marginBottom: spacing.md },
  emptyProducts: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyText: { fontSize: 12 },
});