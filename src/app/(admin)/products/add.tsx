import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHeader from "../../../components/admin/AdminHeader";
import ProductForm from "../../../components/admin/ProductForm";
import colors from "../../../constants/colors";
import type { Category } from "../../../types/category";
import type { Manufacturer } from "../../../types/manufacturer";

export default function AdminAddProductScreen() {
  // frontend-only: empty typed arrays — no backend
  const categories: Category[] = [];
  const manufacturers: Manufacturer[] = [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AdminHeader title="Add product" subtitle="Create new catalog item" />
      <ProductForm
        categories={categories}
        manufacturers={manufacturers}
        submitLabel="Save product"
        onSubmit={async () => {
          // backend required — no-op frontend-only
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
});
