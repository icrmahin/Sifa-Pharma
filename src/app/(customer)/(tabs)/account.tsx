import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../hooks/useAuth";
import { useTheme, useThemeColors } from "../../../providers/ThemeProvider";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import { radius, layout } from "../../../constants/sizes";
import Icon from "../../../components/common/Icon";
import ResponsiveContainer from "../../../components/common/ResponsiveContainer";
import { useResponsive } from "../../../hooks/useResponsive";
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
  const colors = useThemeColors();
  const { themeMode, setThemeMode } = useTheme();
  const { isDesktop } = useResponsive();

  const isDark = themeMode === "dark" || (themeMode === "system" && colors.background === "#111A17");
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

  const handleDarkModeToggle = () => {
    setThemeMode(isDark ? "light" : "dark");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <ResponsiveContainer maxWidth={isDesktop ? 800 : 1320}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* Profile Card */}
        <Pressable
          style={({ pressed }) => [
            styles.profileCard,
            { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight },
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/(customer)/account/profile")}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.white }]}>{initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>
              {user?.name || "User"}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textMuted }]} numberOfLines={1}>
              {user?.email || ""}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.textMuted} />
        </Pressable>

        {/* Admin Dashboard */}
        {isAdmin ? (
          <Pressable
            style={({ pressed }) => [
              styles.adminCard,
              { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight },
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/(admin)")}
            accessibilityRole="button"
            accessibilityLabel="Open admin dashboard"
          >
            <View style={[styles.adminIconContainer, { backgroundColor: colors.primarySoft }]}>
              <Icon name="dashboard" size={20} color={colors.primary} />
            </View>
            <View style={styles.adminInfo}>
              <Text style={[styles.adminLabel, { color: colors.text }]}>Admin Dashboard</Text>
              <Text style={[styles.adminHint, { color: colors.textMuted }]}>Manage store operations</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}

        {/* Settings Sections */}
        <View style={[styles.sectionsGrid, isDesktop && styles.sectionsGridDesktop]}>
          {SECTIONS.map((section) => (
            <View key={section.title} style={[styles.section, isDesktop && styles.sectionDesktop]}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                {section.title}
              </Text>
              <View
                style={[styles.sectionGroup, { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight }]}
              >
                {section.items.map((item, index) => (
                  <View key={item.label}>
                    <Pressable
                      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                      onPress={() => {
                        if (item.toggle) {
                          handleDarkModeToggle();
                        } else {
                          handleItemPress(item);
                        }
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                    >
                      <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft }]}>
                        <Icon
                          name={item.icon}
                          size={20}
                          color={item.destructive ? colors.danger : colors.primary}
                        />
                      </View>
                      <Text
                        style={[styles.rowLabel, { color: item.destructive ? colors.danger : colors.text }]}
                      >
                        {item.label}
                      </Text>
                      {item.toggle ? (
                        <Toggle value={isDark} onValueChange={handleDarkModeToggle} size="sm" />
                      ) : (
                        <Icon name="chevron-right" size={18} color={colors.textMuted} />
                      )}
                    </Pressable>
                    {index < section.items.length - 1 ? (
                      <View style={[styles.divider, { backgroundColor: colors.borderSoft, marginLeft: spacing.lg + 32 + spacing.md }]} />
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ResponsiveContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.title2,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: typography.body, fontWeight: "700" },
  profileInfo: { flex: 1, gap: spacing.xxs },
  profileName: { fontSize: typography.bodySmall, fontWeight: "700" },
  profileEmail: { fontSize: typography.caption },
  adminCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  adminIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  adminInfo: { flex: 1 },
  adminLabel: { fontSize: typography.bodySmall, fontWeight: "700" },
  adminHint: { fontSize: typography.caption, marginTop: spacing.xxs },
  sectionsGrid: {},
  sectionsGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  section: { marginBottom: spacing.xl },
  sectionDesktop: { flexBasis: "48%", marginBottom: 0 },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionGroup: {
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
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
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: typography.bodySmall, fontWeight: "600" },
  divider: { height: 1 },
  pressed: { opacity: 0.6, transform: [{ scale: 0.99 }] },
});
