import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHeader from "../../../components/admin/AdminHeader";
import ProductForm from "../../../components/admin/ProductForm";
import { useThemeColors } from "../../../providers/ThemeProvider";
import type { Category } from "../../../types/category";
import type { Manufacturer } from "../../../types/manufacturer";

export default function AdminAddProductScreen() {
  const colors = useThemeColors();
  const categories: Category[] = [];
  const manufacturers: Manufacturer[] = [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader title="Add product" subtitle="Create new catalog item" />
      <ProductForm
        categories={categories}
        manufacturers={manufacturers}
        submitLabel="Save product"
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
