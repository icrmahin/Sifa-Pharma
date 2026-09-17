import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../../providers/ThemeProvider";
import Button from "../../../components/common/Button";
import EmptyState from "../../../components/common/EmptyState";
import Header from "../../../components/common/Header";
import ResponsiveContainer from "../../../components/common/ResponsiveContainer";
import StatusBadge from "../../../components/common/StatusBadge";
import ProductImage from "../../../components/products/ProductImage";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import { useResponsive } from "../../../hooks/useResponsive";
import { useCart } from "../../../hooks/useCart";
import type { Product } from "../../../types/product";
import type { Category } from "../../../types/category";
import type { Manufacturer } from "../../../types/manufacturer";
import { formatCurrency } from "../../../utils/currency";
import { formatDate } from "../../../utils/date";
import { normalizeError } from "../../../utils/errorHandling";

const mockProducts: Product[] = [];
const mockCategories: Category[] = [];
const mockManufacturers: Manufacturer[] = [];

export default function ProductDetailScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ productId: string }>();
  const product = useMemo(() => mockProducts.find((item) => item.id === params.productId), [params.productId]);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();
  const { isDesktop } = useResponsive();

  if (!product) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title="Product details" onBack={() => router.back()} />
        <EmptyState title="Product not found" message="This medicine is no longer available." actionLabel="Browse products" onAction={() => router.replace("/(customer)/(tabs)/products")} />
      </SafeAreaView>
    );
  }

  const handleAddToCart = async () => {
    setAdding(true);
    setFeedback(null);
    try { await addItem(product.id, quantity); setFeedback(`${product.name} added to your cart.`); } catch (error) { setFeedback(normalizeError(error).message); } finally { setAdding(false); }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Product details" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <ResponsiveContainer maxWidth={isDesktop ? 960 : 1320}>
          {isDesktop ? (
            <View style={styles.desktopLayout}>
              <View style={styles.imageColumn}>
                <ProductImage uri={product.image} recyclingKey={product.id} style={styles.imageDesktop} />
              </View>
              <View style={styles.detailsColumn}>
                <Text style={[styles.brand, { color: colors.textMuted }]}>{product.brand}</Text>
                <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
                <Text style={[styles.generic, { color: colors.textMuted }]}>{product.genericName}</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: colors.text }]}>{formatCurrency(product.price)}</Text>
                  {product.originalPrice ? <Text style={[styles.original, { color: colors.textMuted }]}>{formatCurrency(product.originalPrice)}</Text> : null}
                </View>
                <View style={styles.metaRow}>
                  <StatusBadge label={product.stock > 0 ? "In stock" : "Out of stock"} tone={product.stock > 0 ? "success" : "danger"} />
                  {product.discountPercent ? <StatusBadge label={`${product.discountPercent}% off`} tone="info" /> : null}
                </View>
                <Text style={[styles.description, { color: colors.textMuted }]}>{product.description}</Text>
                <View style={[styles.infoBlock, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                  <Text style={[styles.infoTitle, { color: colors.text }]}>Product details</Text>
                  <Text style={[styles.infoText, { color: colors.textMuted }]}>Manufacturer: {mockManufacturers.find((item) => item.id === product.manufacturerId)?.name ?? "Not specified"}</Text>
                  <Text style={[styles.infoText, { color: colors.textMuted }]}>Category: {mockCategories.find((item) => item.id === product.categoryId)?.name ?? "Not specified"}</Text>
                  <Text style={[styles.infoText, { color: colors.textMuted }]}>Batch: {product.batchNumber}</Text>
                  <Text style={[styles.infoText, { color: colors.textMuted }]}>Expiry: {formatDate(product.expiryDate ?? new Date())}</Text>
                </View>
                <View style={styles.quantityRow}>
                  <Text style={[styles.qtyLabel, { color: colors.text }]}>Quantity</Text>
                  <View style={[styles.qtySelector, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                    <Text style={[styles.qtyAction, { color: colors.primary }]} onPress={() => setQuantity((v) => Math.max(1, v - 1))}>-</Text>
                    <Text style={[styles.qtyValue, { color: colors.text }]}>{quantity}</Text>
                    <Text style={[styles.qtyAction, { color: colors.primary }]} onPress={() => setQuantity((v) => v + 1)}>+</Text>
                  </View>
                </View>
                {feedback ? <Text style={[styles.feedback, { color: colors.success }]}>{feedback}</Text> : null}
                <Button title={product.stock > 0 ? "Add to cart" : "Out of stock"} onPress={handleAddToCart} loading={adding} disabled={product.stock === 0} fullWidth />
              </View>
            </View>
          ) : (
            <>
              <ProductImage uri={product.image} recyclingKey={product.id} style={styles.image} />
              <Text style={[styles.brand, { color: colors.textMuted }]}>{product.brand}</Text>
              <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
              <Text style={[styles.generic, { color: colors.textMuted }]}>{product.genericName}</Text>
              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: colors.text }]}>{formatCurrency(product.price)}</Text>
                {product.originalPrice ? <Text style={[styles.original, { color: colors.textMuted }]}>{formatCurrency(product.originalPrice)}</Text> : null}
              </View>
              <View style={styles.metaRow}>
                <StatusBadge label={product.stock > 0 ? "In stock" : "Out of stock"} tone={product.stock > 0 ? "success" : "danger"} />
                {product.discountPercent ? <StatusBadge label={`${product.discountPercent}% off`} tone="info" /> : null}
              </View>
              <Text style={[styles.description, { color: colors.textMuted }]}>{product.description}</Text>
              <View style={[styles.infoBlock, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>Product details</Text>
                <Text style={[styles.infoText, { color: colors.textMuted }]}>Manufacturer: {mockManufacturers.find((item) => item.id === product.manufacturerId)?.name ?? "Not specified"}</Text>
                <Text style={[styles.infoText, { color: colors.textMuted }]}>Category: {mockCategories.find((item) => item.id === product.categoryId)?.name ?? "Not specified"}</Text>
                <Text style={[styles.infoText, { color: colors.textMuted }]}>Batch: {product.batchNumber}</Text>
                <Text style={[styles.infoText, { color: colors.textMuted }]}>Expiry: {formatDate(product.expiryDate ?? new Date())}</Text>
              </View>
              <View style={styles.quantityRow}>
                <Text style={[styles.qtyLabel, { color: colors.text }]}>Quantity</Text>
                <View style={[styles.qtySelector, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
                  <Text style={[styles.qtyAction, { color: colors.primary }]} onPress={() => setQuantity((v) => Math.max(1, v - 1))}>-</Text>
                  <Text style={[styles.qtyValue, { color: colors.text }]}>{quantity}</Text>
                  <Text style={[styles.qtyAction, { color: colors.primary }]} onPress={() => setQuantity((v) => v + 1)}>+</Text>
                </View>
              </View>
              {feedback ? <Text style={[styles.feedback, { color: colors.success }]}>{feedback}</Text> : null}
              <Button title={product.stock > 0 ? "Add to cart" : "Out of stock"} onPress={handleAddToCart} loading={adding} disabled={product.stock === 0} fullWidth />
            </>
          )}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  desktopLayout: { flexDirection: "row", gap: spacing.xxxl },
  imageColumn: { flex: 1 },
  detailsColumn: { flex: 1, gap: spacing.md },
  image: { width: "100%", height: 220, backgroundColor: "#1A2420", borderRadius: 18 },
  imageDesktop: { width: "100%", height: 360, backgroundColor: "#1A2420", borderRadius: 18 },
  brand: { color: "#B8C0BC", fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  name: { color: "#F0F2F1", fontSize: 24, fontWeight: "800" },
  generic: { color: "#B8C0BC", fontSize: 12 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm },
  price: { color: "#F0F2F1", fontSize: 24, fontWeight: "800" },
  original: { color: "#B8C0BC", fontSize: 14, textDecorationLine: "line-through" },
  metaRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  description: { color: "#B8C0BC", fontSize: 12, lineHeight: 22 },
  infoBlock: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  infoTitle: { color: "#F0F2F1", fontSize: 14, fontWeight: "700", marginBottom: spacing.sm },
  infoText: { color: "#B8C0BC", fontSize: 12, marginBottom: spacing.xs },
  quantityRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  qtyLabel: { color: "#F0F2F1", fontSize: 14, fontWeight: "700" },
  qtySelector: { flexDirection: "row", alignItems: "center", gap: spacing.md, borderRadius: 12, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  qtyAction: { fontSize: 24, fontWeight: "700" },
  qtyValue: { color: "#F0F2F1", fontSize: 20, fontWeight: "700" },
  feedback: { fontSize: 12, textAlign: "center" },
});