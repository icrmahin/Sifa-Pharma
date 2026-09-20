import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminProductCard from "../../../components/admin/AdminProductCard";
import Icon from "../../../components/common/Icon";
import { Pressable } from "react-native";
import EmptyState from "../../../components/common/EmptyState";
import FilterChip from "../../../components/common/FilterChip";
import ResponsiveContainer from "../../../components/common/ResponsiveContainer";
import SearchBar from "../../../components/common/SearchBar";
import { useThemeColors } from "../../../providers/ThemeProvider";
import { useResponsive } from "../../../hooks/useResponsive";
import { useCategories } from "../../../hooks/useProducts";
import { useAdminProducts } from "../../../hooks/useAdmin";
import LoadingState from "../../../components/common/LoadingState";
import ErrorState from "../../../components/common/ErrorState";
import config from "../../../constants/config";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";

type StatusFilter = "all" | "active" | "inactive";
type StockFilter = "all" | "in_stock" | "low" | "out";

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const STOCK_FILTERS: { label: string; value: StockFilter }[] = [
  { label: "All", value: "all" },
  { label: "In stock", value: "in_stock" },
  { label: "Low stock", value: "low" },
  { label: "Out of stock", value: "out" },
];

export default function AdminProductsScreen() {
  const colors = useThemeColors();
  const { isDesktop } = useResponsive();
  const twoColumns = isDesktop;

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [categoryId, setCategoryId] = useState("all");

  const adminStatus = status === "all" ? undefined : status;
  const adminStock = stockFilter === "all" ? undefined : stockFilter === "in_stock" ? "in_stock" : stockFilter;
  const { data: products, loading, error, reload } = useAdminProducts({
    status: adminStatus,
    stockFilter: adminStock,
    categoryId: categoryId === "all" ? undefined : categoryId,
    query: query || undefined,
    limit: 100,
  });
  const { data: categories } = useCategories();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (status === "active" && !product.isActive) return false;
      if (status === "inactive" && product.isActive) return false;
      if (categoryId !== "all" && product.categoryId !== categoryId) return false;
      if (stockFilter === "in_stock" && product.stock <= 0) return false;
      if (
        stockFilter === "low" &&
        !(product.stock > 0 && product.stock < config.lowStockThreshold)
      ) {
        return false;
      }
      if (stockFilter === "out" && product.stock > 0) return false;
      if (
        q &&
        ![product.name, product.brand, product.genericName]
          .join(" ")
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [products, query, status, stockFilter, categoryId]);

  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <AdminHeader title="Products" subtitle={`${time} · catalog`} />
        <LoadingState label="Loading products" />
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <AdminHeader title="Products" subtitle={`${time} · catalog`} />
        <ErrorState message={error} onRetry={reload} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader
        title="Products"
        subtitle={`${time} · ${filtered.length} items`}
        action={
          <Pressable
            onPress={() => router.push("/(admin)/products/add")}
            style={({ pressed }) => [
              { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, height: 32, borderRadius: 16, borderWidth: 1, backgroundColor: colors.primary, borderColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Icon name="add" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Add</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.container}>
        <ResponsiveContainer sidebarAware>
          <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search products"
        />

        <View style={styles.filters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {STATUS_FILTERS.map((filter) => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                selected={status === filter.value}
                onPress={() => setStatus(filter.value)}
              />
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {STOCK_FILTERS.map((filter) => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                selected={stockFilter === filter.value}
                onPress={() => setStockFilter(filter.value)}
              />
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <FilterChip
              label="All categories"
              selected={categoryId === "all"}
              onPress={() => setCategoryId("all")}
            />
            {categories.map((category) => (
              <FilterChip
                key={category.id}
                label={category.name}
                selected={categoryId === category.id}
                onPress={() => setCategoryId(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        {filtered.length === 0 ? (
          <EmptyState
            title="No products found"
            message={
              products.length === 0
                ? "Add your first medicine to start the catalog."
                : "Try a different search or clear the filters."
            }
            actionLabel="Add product"
            onAction={() => router.push("/(admin)/products/add")}
          />
        ) : (
          <>
            <Text style={[styles.count, { color: colors.textMuted }]}>
              {filtered.length} {filtered.length === 1 ? "product" : "products"}
            </Text>
            <View style={[styles.list, twoColumns && styles.listTwoCol]}>
              {filtered.map((product) => (
                <View key={product.id} style={twoColumns ? styles.listItem : undefined}>
                  <AdminProductCard
                    product={product}
                    onPress={(item) =>
                      router.push({
                        pathname: "/(admin)/products/[productId]",
                        params: { productId: item.id },
                      })
                    }
                  />
                </View>
              ))}
            </View>
          </>
        )}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  filters: { gap: spacing.sm },
  chipRow: { gap: spacing.sm, paddingRight: spacing.sm },
  count: {
    fontSize: typography.caption,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginTop: spacing.xs,
  },
  list: { gap: spacing.md },
  listTwoCol: { flexDirection: "row", flexWrap: "wrap" },
  listItem: { flexGrow: 1, flexBasis: "48%", minWidth: 0 },
});
