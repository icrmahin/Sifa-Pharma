import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/common/Header";
import Icon from "../../../components/common/Icon";
import ListItem from "../../../components/common/ListItem";
import Toggle from "../../../components/common/Toggle";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import { radius } from "../../../constants/sizes";

export default function CustomerSettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Settings" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionGroup}>
            <ListItem
              title="Profile Details"
              left={<Icon name="person" size={20} color={colors.primary} />}
              onPress={() => router.push("/(customer)/account/profile")}
              divider
            />
            <ListItem
              title="Password & Security"
              left={<Icon name="lock" size={20} color={colors.primary} />}
              onPress={() => {}}
              divider
            />
            <ListItem
              title="Notifications"
              left={<Icon name="notifications" size={20} color={colors.primary} />}
              onPress={() => router.push("/(customer)/account/notifications")}
              divider
            />
            <ListItem
              title="Dark Mode"
              left={<Icon name="dark-mode" size={20} color={colors.primary} />}
              right={<Toggle value={darkMode} onValueChange={setDarkMode} size="sm" />}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionGroup}>
            <ListItem
              title="Help & FAQ"
              left={<Icon name="help-outline" size={20} color={colors.primary} />}
              onPress={() => {}}
              divider
            />
            <ListItem
              title="Contact Us"
              left={<Icon name="phone" size={20} color={colors.primary} />}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.sectionGroup}>
            <ListItem
              title="About Sifa-Pharma"
              left={<Icon name="info-outline" size={20} color={colors.primary} />}
              onPress={() => {}}
              divider
            />
            <ListItem
              title="Terms & Privacy"
              left={<Icon name="description" size={20} color={colors.primary} />}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Log Out */}
        <View style={styles.section}>
          <View style={styles.sectionGroup}>
            <ListItem
              title="Log Out"
              left={<Icon name="logout" size={20} color={colors.danger} />}
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginLeft: spacing.xs,
  },
  sectionGroup: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
});
