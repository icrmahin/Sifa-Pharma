import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../hooks/useAuth";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import { radius, layout } from "../../../constants/sizes";
import Icon from "../../../components/common/Icon";
import type { IconName } from "../../../components/common/Icon";
import Toggle from "../../../components/common/Toggle";

type SettingsSection = {
  title: string;
  items: {
    label: string;
    icon: IconName;
    route?: string;
    destructive?: boolean;
    toggle?: boolean;
  }[];
};

const SECTIONS: SettingsSection[] = [
  {
    title: "Account",
    items: [
      { label: "Profile Details", icon: "person", route: "/(customer)/account/profile" },
      { label: "Password & Security", icon: "lock", route: "/(customer)/account/profile" },
      { label: "Notifications", icon: "notifications", route: "/(customer)/account/notifications" },
      { label: "Dark Mode", icon: "dark-mode", toggle: true },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help & FAQ", icon: "help-outline" },
      { label: "Contact Us", icon: "phone" },
    ],
  },
  {
    title: "App",
    items: [
      { label: "About Sifa-Pharma", icon: "info-outline" },
      { label: "Terms & Privacy", icon: "description" },
      { label: "Log Out", icon: "logout", destructive: true },
    ],
  },
];

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAdmin, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const handleItemPress = (item: SettingsSection["items"][0]) => {
    if (item.destructive) {
      signOut();
      return;
    }
    if (item.route) {
      router.push(item.route as never);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Centered Title */}
      <Text style={styles.title}>Settings</Text>

      {/* Profile Card */}
      <Pressable
        style={({ pressed }) => [styles.profileCard, pressed && styles.pressed]}
        onPress={() => router.push("/(customer)/account/profile")}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>
            {user?.name || "User"}
          </Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {user?.email || ""}
          </Text>
        </View>
        <Icon name="chevron-right" size={20} color={colors.textMuted} />
      </Pressable>

      {/* Admin Dashboard — visible only to admin users */}
      {isAdmin ? (
        <Pressable
          style={({ pressed }) => [styles.adminCard, pressed && styles.pressed]}
          onPress={() => router.push("/(admin)")}
          accessibilityRole="button"
          accessibilityLabel="Open admin dashboard"
        >
          <View style={styles.adminIconContainer}>
            <Icon name="dashboard" size={20} color={colors.primary} />
          </View>
          <View style={styles.adminInfo}>
            <Text style={styles.adminLabel}>Admin Dashboard</Text>
            <Text style={styles.adminHint}>Manage store operations</Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}

      {/* Settings Sections */}
      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionGroup}>
            {section.items.map((item, index) => (
              <View key={item.label}>
                <Pressable
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleItemPress(item)}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <View style={styles.rowIcon}>
                    <Icon
                      name={item.icon}
                      size={20}
                      color={item.destructive ? colors.danger : colors.primary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.rowLabel,
                      item.destructive && styles.destructiveLabel,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.toggle ? (
                    <Toggle
                      value={darkMode}
                      onValueChange={setDarkMode}
                      size="sm"
                    />
                  ) : (
                    <Icon name="chevron-right" size={18} color={colors.textMuted} />
                  )}
                </Pressable>
                {index < section.items.length - 1 ? (
                  <View style={styles.divider} />
                ) : null}
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },

  // Title
  title: {
    fontSize: typography.title2,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xl,
  },

  // Profile Card
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: "700",
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  profileName: {
    fontSize: typography.bodySmall,
    fontWeight: "700",
    color: colors.text,
  },
  profileEmail: {
    fontSize: typography.caption,
    color: colors.textMuted,
  },

  // Admin Card
  adminCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  adminIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  adminInfo: {
    flex: 1,
  },
  adminLabel: {
    fontSize: typography.bodySmall,
    fontWeight: "700",
    color: colors.text,
  },
  adminHint: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },

  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionGroup: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: layout.touch,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: typography.bodySmall,
    fontWeight: "600",
    color: colors.text,
  },
  destructiveLabel: {
    color: colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginLeft: spacing.lg + 32 + spacing.md,
  },

  // Press feedback
  pressed: { opacity: 0.6, transform: [{ scale: 0.99 }] },
});
