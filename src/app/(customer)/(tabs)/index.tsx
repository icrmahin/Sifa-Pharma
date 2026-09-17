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
import AppLogo from "../../../components/common/AppLogo";
import ErrorState from "../../../components/common/ErrorState";
import LoadingState from "../../../components/common/LoadingState";
import SearchBar from "../../../components/common/SearchBar";
import Icon from "../../../components/common/Icon";
import ProductCard from "../../../components/products/ProductCard";
import ProductHeroSlider from "../../../components/products/ProductHeroSlider";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import { radius, layout } from "../../../constants/sizes";
import { springConfigs } from "../../../lib/motion";
import type { Product } from "../../../types/product";
import type { Category } from "../../../types/category";
import type { Manufacturer } from "../../../types/manufacturer";
import { useCart } from "../../../providers/CartProvider";

// frontend-only placeholders — no backend required
const mockProducts: Product[] = [];
const mockCategories: Category[] = [];
const mockManufacturers: Manufacturer[] = [];

type DiscoveryTab = "trending" | "discount" | "new";

export default function CustomerHomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<DiscoveryTab>("trending");
  const [showFilter, setShowFilter] = useState(false);
  const { itemCount } = useCart();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const featured = useMemo(
    () => mockProducts.filter((product) => product.isFeatured),
    [],
  );
  const newProducts = useMemo(() => [...mockProducts].slice(0, 3), []);
  const discounted = useMemo(
    () => mockProducts.filter((product) => product.discountPercent),
    [],
  );
  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return mockProducts.slice(0, 4);
    return mockProducts
      .filter((product) =>
        [product.name, product.brand, product.genericName, product.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
      .slice(0, 5);
  }, [query]);

  const activeProducts = useMemo(() => {
    switch (activeTab) {
      case "trending":
        return featured;
      case "discount":
        return discounted;
      case "new":
        return newProducts;
      default:
        return featured;
    }
  }, [activeTab, featured, discounted, newProducts]);

  const openProduct = (product: Product) => {
    setSearchFocused(false);
    router.push({
      pathname: "/(customer)/products/[productId]",
      params: { productId: product.id },
    });
  };

  if (loading) return <LoadingState label="Loading your pharmacy" />;
  if (error) return <ErrorState message={error} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <AppLogo size={38} />
            <Text style={styles.brandName}>Sifa-Pharma</Text>
          </View>
          <IconButtonCart
            itemCount={itemCount}
            onPress={() => router.push("/(customer)/(tabs)/cart")}
          />
        </View>

        {/* Search */}
        <View style={styles.searchArea}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search medicines, health products..."
          />
          {searchFocused ? (
            <View style={styles.searchPanel}>
              <Text style={styles.searchPanelTitle}>
                {query ? "Recommended matches" : "Popular medicines"}
              </Text>
              <FlatList
                data={searchResults}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.searchResult}
                    onPress={() => openProduct(item)}
                  >
                    <Text style={styles.searchResultName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.searchResultMeta} numberOfLines={1}>
                      {item.brand} · {item.genericName}
                    </Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text style={styles.noResults}>No medicines found</Text>
                }
              />
            </View>
          ) : null}
        </View>

        {/* Hero Slider */}
        <View style={styles.heroSection}>
          <ProductHeroSlider
            products={mockProducts.length > 0 ? mockProducts.slice(0, 4) : []}
            onProductPress={openProduct}
          />
        </View>

        {/* Compact Discovery Controls */}
        <View style={styles.discoverySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.discoveryControls}
          >
            <FilterPill
              active={showFilter}
              onPress={() => setShowFilter(!showFilter)}
            />
            <DiscoveryPill
              label="Trending"
              icon="trending-up"
              active={activeTab === "trending" && !showFilter}
              onPress={() => { setActiveTab("trending"); setShowFilter(false); }}
            />
            <DiscoveryPill
              label="Discount"
              icon="local-offer"
              active={activeTab === "discount" && !showFilter}
              onPress={() => { setActiveTab("discount"); setShowFilter(false); }}
            />
            <DiscoveryPill
              label="New Arrivals"
              icon="new-releases"
              active={activeTab === "new" && !showFilter}
              onPress={() => { setActiveTab("new"); setShowFilter(false); }}
            />
          </ScrollView>

          {/* Category Filter Panel */}
          {showFilter ? (
            <View style={styles.filterPanel}>
              <Text style={styles.filterTitle}>Categories</Text>
              <View style={styles.categoryGrid}>
                {mockCategories.map((category) => (
                  <Pressable
                    key={category.id}
                    style={styles.categoryItem}
                    accessibilityRole="button"
                    onPress={() => {
                      setShowFilter(false);
                      router.push({
                        pathname: "/(customer)/products/category/[categoryId]",
                        params: { categoryId: category.id },
                      });
                    }}
                  >
                    <Icon name="category" size={18} color={colors.primary} />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </Pressable>
                ))}
                {mockCategories.length === 0 ? (
                  <Text style={styles.noResults}>No categories available</Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Products Grid */}
          <View style={styles.productsGrid}>
            {activeProducts.length > 0 ? (
              activeProducts.map((product) => (
                <View key={product.id} style={styles.productGridItem}>
                  <ProductCard product={product} compact onPress={openProduct} />
                </View>
              ))
            ) : (
              <View style={styles.emptyProducts}>
                <Icon name="inventory-2" size={32} color={colors.textMuted} />
                <Text style={styles.emptyText}>No products to display</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function IconButtonCart({ itemCount, onPress }: { itemCount: number; onPress: () => void }) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (reducedMotion) return;
    scale.value = withSpring(0.9, springConfigs.press);
  };

  const handlePressOut = () => {
    if (reducedMotion) return;
    scale.value = withSpring(1, springConfigs.press);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
    >
      <Animated.View style={[styles.cartButton, animatedStyle]}>
        <Icon name="shopping-cart" size={22} color={colors.primary} />
        {itemCount > 0 ? (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>
              {itemCount > 99 ? "99+" : itemCount}
            </Text>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

function FilterPill({ active, onPress }: { active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.discoveryPill, active && styles.discoveryPillActive]}
      accessibilityRole="button"
      accessibilityLabel="Filter by category"
      accessibilityState={{ selected: active }}
    >
      <Icon name="filter-list" size={16} color={active ? colors.white : colors.textMuted} />
      <Text style={[styles.discoveryPillText, active && styles.discoveryPillTextActive]}>
        Filter
      </Text>
    </Pressable>
  );
}

function DiscoveryPill({ label, icon, active, onPress }: { label: string; icon: import("../../../components/common/Icon").IconName; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.discoveryPill, active && styles.discoveryPillActive]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Icon name={icon} size={16} color={active ? colors.white : colors.textMuted} />
      <Text style={[styles.discoveryPillText, active && styles.discoveryPillTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: spacing.xxl },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  brandName: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: "600",
  },
  cartButton: {
    width: layout.iconButtonSize,
    height: layout.iconButtonSize,
    borderRadius: layout.iconButtonSize / 2,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "700",
  },

  // Search
  searchArea: {
    paddingHorizontal: spacing.lg,
    position: "relative",
    zIndex: 10,
    marginBottom: spacing.lg,
  },
  searchPanel: {
    position: "absolute",
    top: layout.inputHeight + spacing.xs,
    left: spacing.lg,
    right: spacing.lg,
    maxHeight: 290,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    zIndex: 20,
    elevation: 5,
  },
  searchPanelTitle: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  searchResult: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  searchResultName: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: "700",
  },
  searchResultMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  noResults: { color: colors.textMuted, paddingVertical: spacing.md },

  // Hero
  heroSection: {
    marginBottom: spacing.lg,
  },

  // Discovery
  discoverySection: {
    paddingHorizontal: spacing.lg,
  },
  discoveryControls: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  discoveryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    height: layout.controlHeight,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  discoveryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  discoveryPillText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "600",
  },
  discoveryPillTextActive: {
    color: colors.white,
  },

  // Filter Panel
  filterPanel: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  filterTitle: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryName: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "600",
  },

  // Products
  productsGrid: {
    marginTop: spacing.sm,
  },
  productGridItem: {
    marginBottom: spacing.md,
  },
  emptyProducts: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.bodySmall,
  },
});
