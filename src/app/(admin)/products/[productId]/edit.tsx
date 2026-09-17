import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHeader from "../../../../components/admin/AdminHeader";
import ProductForm from "../../../../components/admin/ProductForm";
import EmptyState from "../../../../components/common/EmptyState";
import { useThemeColors } from "../../../../providers/ThemeProvider";
import type { Category } from "../../../../types/category";
import type { Manufacturer } from "../../../../types/manufacturer";
import type { Product } from "../../../../types/product";

export default function AdminEditProductScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ productId: string }>();
  const productId = params.productId;

  const categories: Category[] = [];
  const manufacturers: Manufacturer[] = [];
  const product: Product | null = productId
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
        createdAt: new Date().toISOString(),
      }
    : null;

  if (!product) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <AdminHeader title="Edit product" subtitle="Update catalog item" />
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader title="Edit product" subtitle="Update catalog item" />
      <ProductForm
        product={product}
        categories={categories}
        manufacturers={manufacturers}
        submitLabel="Save changes"
        onSubmit={async () => {
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
});
