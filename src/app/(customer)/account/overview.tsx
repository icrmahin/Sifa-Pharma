import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/common/Header";
import Icon from "../../../components/common/Icon";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import typography from "../../../constants/typography";
import { radius, layout } from "../../../constants/sizes";
import { useAuth } from "../../../hooks/useAuth";

const RIPPLE = "rgba(18, 60, 53, 0.08)";

const SECTIONS: {
  index: string;
  title: string;
  items: {
    label: string;
    meta: string;
    route: string;
    icon: any;
  }[];
}[] = [
  {
    index: "01",
    title: "Account",
    items: [
      {
        label: "Profile",
        meta: "Name and contact",
        route: "/(customer)/account/profile",
        icon: "person",
      },
      {
        label: "Addresses",
        meta: "Delivery locations",
        route: "/(customer)/account/addresses",
        icon: "place",
      },
    ],
  },
  {
    index: "02",
    title: "Activity",
    items: [
      {
        label: "Orders",
        meta: "Track deliveries",
        route: "/(customer)/(tabs)/orders",
        icon: "inventory-2",
      },
      {
        label: "Notifications",
        meta: "Updates and alerts",
        route: "/(customer)/account/notifications",
        icon: "notifications",
      },
    ],
  },
  {
    index: "03",
    title: "Preferences",
    items: [
      {
        label: "Settings",
        meta: "App preferences",
        route: "/(customer)/account/settings",
        icon: "settings",
      },
    ],
  },
];

export default function CustomerAccountDashboard() {
  const { user, signOut } = useAuth();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "H";

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Account"
        subtitle="Sifa-Pharma · Your account"
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Identity block */}
        <View style={styles.identityPanel}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={styles.eyebrow}>Sifa-Pharma · Customer</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name ?? "Welcome"}
            </Text>
            {user?.email ? (
              <Text style={styles.userEmail} numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
          </View>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.index}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionIndex}>{section.index}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionRule} />
            </View>
            <View style={styles.panel}>
              {section.items.map((item, itemIndex) => (
                <View key={item.label}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.row,
                      pressed && styles.pressed,
                    ]}
                    android_ripple={{ color: RIPPLE }}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${item.label}`}
                    onPress={() => router.push(item.route as never)}
                  >
                    <View style={styles.iconTile}>
                      <Icon name={item.icon} size={18} color={colors.primary} />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowLabel}>{item.label}</Text>
                      <Text style={styles.rowMeta}>{item.meta}</Text>
                    </View>
                    <Icon name="chevron-right" size={18} color={colors.textMuted} />
                  </Pressable>
                  {itemIndex < section.items.length - 1 ? (
                    <View style={styles.hairline} />
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
          android_ripple={{ color: RIPPLE }}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          onPress={signOut}
        >
          <Icon name="logout" size={18} color={colors.primary} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  identityPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
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
  identityText: { flex: 1, gap: spacing.xs },
  eyebrow: {
    color: colors.textMuted,
    fontSize: typography.label,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  userName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  userEmail: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  sectionIndex: {
    color: colors.textMuted,
    fontSize: typography.label,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.h3,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  sectionRule: { flex: 1, height: 1, backgroundColor: colors.border },
  panel: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: layout.touch,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, gap: spacing.xs },
  rowLabel: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: "600",
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  hairline: { height: 1, backgroundColor: colors.borderSoft },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.backgroundAlt,
    paddingVertical: spacing.md,
    minHeight: layout.touch,
    marginTop: spacing.sm,
  },
  signOutText: {
    color: colors.primary,
    fontSize: typography.bodySmall,
    fontWeight: "700",
  },
  pressed: { opacity: 0.6, transform: [{ scale: 0.99 }] },
});
