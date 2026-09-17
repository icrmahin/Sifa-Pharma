import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminHeader from "../../../components/admin/AdminHeader";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import { useThemeColors } from "../../../providers/ThemeProvider";
import spacing from "../../../constants/spacing";

export default function InventoryAdjustmentScreen() {
  const colors = useThemeColors();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AdminHeader title="Stock adjustment" subtitle="Record stock changes" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.form}>
          <Input label="Product" value="Amoxicillin 250mg" />
          <Input label="Batch number" value="AMX-732" />
          <Input label="Adjustment reason" value="Order fulfillment" />
          <Input label="Quantity" value="-6" keyboardType="numeric" />
        </View>
        <Button
          title="Save adjustment"
          onPress={() => router.back()}
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  form: { gap: spacing.md },
});
