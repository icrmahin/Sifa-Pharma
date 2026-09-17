import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHeader from "../../../components/admin/AdminHeader";
import Button from "../../../components/common/Button";
import { useThemeColors } from "../../../providers/ThemeProvider";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import type { InventoryItem } from "../../../types/inventory";

export default function AdminInventoryScreen() {
  const colors = useThemeColors();
  const items: InventoryItem[] = [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader
        title="Inventory"
        subtitle="Stock overview"
        action={
          <Button
            title="Adjust"
            onPress={() => router.push("/(admin)/inventory/adjustment")}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.container}>
        {items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.row,
              {
                backgroundColor: colors.backgroundAlt,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <View>
              <Text style={[styles.name, { color: colors.text }]}>{item.productName}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{item.batchNumber}</Text>
            </View>
            <Text style={[styles.qty, { color: colors.primary }]}>{item.quantity}</Text>
          </View>
        ))}
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
  },
  name: { fontWeight: "700" },
  meta: { fontSize: typography.caption },
  qty: { fontWeight: "700" },
});
