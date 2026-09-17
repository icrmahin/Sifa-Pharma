import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../../providers/ThemeProvider";
import Header from "../../../components/common/Header";
import Icon from "../../../components/common/Icon";
import ListItem from "../../../components/common/ListItem";
import Toggle from "../../../components/common/Toggle";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import { radius } from "../../../constants/sizes";

export default function CustomerSettingsScreen() {
  const colors = useThemeColors();
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Settings" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.sectionGroup, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Account</Text>
          <ListItem title="Profile Details" left={<Icon name="person" size={20} color={colors.primary} />} onPress={() => router.push("/(customer)/account/profile")} divider />
          <ListItem title="Password & Security" left={<Icon name="lock" size={20} color={colors.primary} />} onPress={() => {}} divider />
          <ListItem title="Notifications" left={<Icon name="notifications" size={20} color={colors.primary} />} onPress={() => router.push("/(customer)/account/notifications")} divider />
          <ListItem title="Dark Mode" left={<Icon name="dark-mode" size={20} color={colors.primary} />} right={<Toggle value={darkMode} onValueChange={setDarkMode} size="sm" />} />
        </View>
        <View style={[styles.sectionGroup, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Support</Text>
          <ListItem title="Help & FAQ" left={<Icon name="help-outline" size={20} color={colors.primary} />} onPress={() => {}} divider />
          <ListItem title="Contact Us" left={<Icon name="phone" size={20} color={colors.primary} />} onPress={() => {}} />
        </View>
        <View style={[styles.sectionGroup, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>App</Text>
          <ListItem title="About Sifa-Pharma" left={<Icon name="info-outline" size={20} color={colors.primary} />} onPress={() => {}} divider />
          <ListItem title="Terms & Privacy" left={<Icon name="description" size={20} color={colors.primary} />} onPress={() => {}} />
        </View>
        <View style={[styles.sectionGroup, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}>
          <ListItem title="Log Out" left={<Icon name="logout" size={20} color={colors.danger} />} onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxxl },
  sectionTitle: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginLeft: spacing.xs },
  sectionGroup: { borderRadius: radius.lg, borderWidth: 1, overflow: "hidden" },
});