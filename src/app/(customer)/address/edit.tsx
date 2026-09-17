import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../../providers/ThemeProvider";
import Header from "../../../components/common/Header";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";

export default function EditAddressScreen() {
  const colors = useThemeColors();
  const [address, setAddress] = useState("");
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Edit Address" onBack={() => {}} />
      <ScrollView contentContainerStyle={styles.container}>
        <Input label="Street Address" value={address} onChangeText={setAddress} placeholder="Enter your street address" />
        <Input label="City" value="" onChangeText={() => {}} placeholder="Enter city" />
        <View style={[styles.box, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Text style={[styles.info, { color: colors.textMuted }]}>Address details will appear here</Text>
        </View>
        <Button title="Save Address" onPress={() => {}} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  box: { borderRadius: 16, borderWidth: 1, padding: spacing.lg },
  info: { fontSize: 12 },
});