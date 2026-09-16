import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHeader from "../../../../components/admin/AdminHeader";
import Button from "../../../../components/common/Button";
import EmptyState from "../../../../components/common/EmptyState";
import Modal from "../../../../components/common/Modal";
import StatusBadge from "../../../../components/common/StatusBadge";
import ProductImage from "../../../../components/products/ProductImage";
import colors from "../../../../constants/colors";
import config from "../../../../constants/config";
import spacing from "../../../../constants/spacing";
import typography from "../../../../constants/typography";
import type { Product } from "../../../../types/product";
import { formatCurrency } from "../../../../utils/currency";

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export default function AdminProductDetailScreen() {
  const params = useLocalSearchParams<{ productId: string }>();
  const productId = params.productId;

  // frontend-only: placeholder product — no backend
  const placeholderProduct: Product | null = productId
    ? {
        id: String(productId),
        name: "Placeholder Product",
        brand: "Demo Brand",
        genericName: "Demo Generic",
        categoryId: "",
        manufacturerId: "",
        description: "Frontend-only placeholder — backend required for real data.",
        price: 0,
        stock: 0,
        unit: "pack",
        isActive: true,
        isFeatured: false,
        createdAt: new Date().toISOString(),
      }
    : null;

  const product = placeholderProduct;
  const categoryName = "";
  const manufacturerName = "";
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Show EmptyState if no placeholder (e.g. missing param) to keep UI intact
  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AdminHeader title="Product" subtitle="Product overview" />
        <EmptyState
          title="Product not found"
          message="This product may have been removed."
          actionLabel="Back to products"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdminHeader
        title={product?.name ?? "Product"}
        subtitle="Product overview"
      />

      <ScrollView contentContainerStyle={styles.container}>
        <ProductImage
          uri={product.image}
          recyclingKey={product.id}
          style={styles.image}
        />

        <View style={styles.card}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.generic}>{product.genericName}</Text>

          <View style={styles.badges}>
            <StatusBadge
              label={product.isActive ? "Active" : "Inactive"}
              tone={product.isActive ? "info" : "neutral"}
            />
            <StatusBadge
              label={
                product.stock === 0
                  ? "Out of stock"
                  : product.stock < config.lowStockThreshold
                    ? "Low stock"
                    : "In stock"
              }
              tone={
                product.stock === 0
                  ? "danger"
                  : product.stock < config.lowStockThreshold
                    ? "warning"
                    : "success"
              }
            />
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            {product.originalPrice && product.originalPrice > product.price ? (
              <Text style={styles.original}>
                {formatCurrency(product.originalPrice)}
              </Text>
            ) : null}
            {product.discountPercent ? (
              <StatusBadge label={`-${product.discountPercent}%`} tone="warning" />
            ) : null}
          </View>

          <View style={styles.divider} />

          <InfoRow label="Category" value={categoryName} />
          <InfoRow label="Manufacturer" value={manufacturerName} />
          <InfoRow label="Unit" value={product.unit} />
          <InfoRow label="Stock" value={`${product.stock} units`} />
          <InfoRow label="Batch number" value={product.batchNumber ?? ""} />
          <InfoRow
            label="Expiry date"
            value={
              product.expiryDate
                ? new Date(product.expiryDate).toLocaleDateString()
                : ""
            }
          />
          <InfoRow label="Featured" value={product.isFeatured ? "Yes" : "No"} />

          <View style={styles.divider} />

          <Text style={styles.description}>{product.description}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Edit product"
            onPress={() =>
              router.push({
                pathname: "/(admin)/products/[productId]/edit",
                params: { productId: product.id },
              })
            }
            fullWidth
          />
          <Button
            title={product.isActive ? "Deactivate" : "Activate"}
            variant={product.isActive ? "secondary" : "primary"}
            onPress={() => {
              // backend required — no-op frontend-only
            }}
            fullWidth
          />
          <Button
            title="Delete product"
            variant="danger"
            onPress={() => setDeleteConfirm(true)}
            fullWidth
          />
        </View>
      </ScrollView>

      <Modal
        visible={deleteConfirm}
        title="Delete product?"
        message={`"${product?.name ?? "This product"}" will be permanently removed from the catalog.`}
        actionLabel="Delete product"
        onAction={() => {
          // backend required — no-op frontend-only
          setDeleteConfirm(false);
          router.replace("/(admin)/products");
        }}
        onClose={() => setDeleteConfirm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    alignSelf: "center",
    width: "100%",
    maxWidth: 720,
  },
  image: { height: 180, borderRadius: 12 },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  brand: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  name: { color: colors.text, fontSize: typography.h2, fontWeight: "700" },
  generic: { color: colors.textMuted, fontSize: typography.bodySmall },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  price: { color: colors.text, fontSize: typography.h3, fontWeight: "800" },
  original: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textDecorationLine: "line-through",
  },
  divider: { height: 1, backgroundColor: colors.borderSoft, marginVertical: spacing.sm },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  infoLabel: { color: colors.textMuted, fontSize: typography.bodySmall },
  infoValue: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: "600",
    flexShrink: 1,
  },
  description: { color: colors.textMuted, fontSize: typography.bodySmall, lineHeight: 20 },
  actions: { gap: spacing.md, marginTop: spacing.xs },
});
