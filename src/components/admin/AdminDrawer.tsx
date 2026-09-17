import { router } from "expo-router";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "../common/Icon";
import { useThemeColors } from "../../providers/ThemeProvider";
import sizes from "../../constants/sizes";
import spacing from "../../constants/spacing";
import typography from "../../constants/typography";
import type { IconName } from "../common/Icon";

const MENU_ITEMS: { label: string; path: string; icon: IconName }[] = [
  { label: "Inventory", path: "/(admin)/inventory", icon: "inventory" },
  { label: "Customers", path: "/(admin)/customers", icon: "people" },
  { label: "Reports", path: "/(admin)/reports", icon: "bar-chart" },
  { label: "Returns", path: "/(admin)/returns", icon: "assignment-return" },
  { label: "Audit log", path: "/(admin)/audit", icon: "description" },
];

const SHOP_ITEM = { label: "Back to Shop", path: "/(customer)/(tabs)" as const, icon: "store" as IconName };

export default function AdminDrawer({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const colors = useThemeColors();

  const navigate = (path: string) => {
    onClose();
    router.push(path as never);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.drawer, { backgroundColor: colors.backgroundAlt, borderTopColor: colors.borderLight }]}>
          <View style={[styles.drawerHeader, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.drawerTitle, { color: colors.text }]}>Menu</Text>
            <Pressable
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.background }]}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            >
              <Icon name="close" size={18} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.section}>
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { backgroundColor: colors.background },
                ]}
                onPress={() => navigate(item.path)}
                android_ripple={{ color: colors.ripple.primary }}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.label}`}
              >
                <View style={[styles.iconTile, { backgroundColor: colors.primarySoft }]}>
                  <Icon name={item.icon} size={18} color={colors.primary} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                <Icon name="chevron-right" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: colors.background },
            ]}
            onPress={() => navigate(SHOP_ITEM.path)}
            android_ripple={{ color: colors.ripple.primary }}
            accessibilityRole="button"
            accessibilityLabel="Back to shop"
          >
            <View style={[styles.iconTile, { backgroundColor: colors.successSoft }]}>
              <Icon name={SHOP_ITEM.icon} size={18} color={colors.success} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.success }]}>{SHOP_ITEM.label}</Text>
            <Icon name="chevron-right" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    borderTopLeftRadius: sizes.borderRadius.xl,
    borderTopRightRadius: sizes.borderRadius.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  drawerTitle: {
    fontSize: typography.title3,
    fontWeight: "700",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: sizes.borderRadius.md,
    minHeight: 48,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: sizes.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.subhead,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
});
