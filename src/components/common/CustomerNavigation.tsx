import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../../providers/ThemeProvider";
import { useShadows } from "../../constants/shadows";
import spacing from "../../constants/spacing";
import { useCart } from "../../providers/CartProvider";
import Icon from "./Icon";
import type { IconName } from "./Icon";

const navigationItems: {
  label: string;
  path: string;
  icon: IconName;
  activeIcon: IconName;
  badge?: boolean;
}[] = [
  { label: "Home", path: "/(customer)/(tabs)", icon: "home", activeIcon: "home" },
  { label: "Cart", path: "/(customer)/(tabs)/cart", icon: "shopping-cart", activeIcon: "shopping-cart", badge: true },
  { label: "Favorites", path: "/(customer)/(tabs)/favorites", icon: "favorite-border", activeIcon: "favorite" },
  { label: "Orders", path: "/(customer)/(tabs)/orders", icon: "receipt-long", activeIcon: "receipt-long" },
  { label: "Settings", path: "/(customer)/(tabs)/account", icon: "settings", activeIcon: "settings" },
] as const;

function getActivePath(pathname: string) {
  if (pathname.includes("/favorites")) return "/(customer)/(tabs)/favorites";
  if (pathname.includes("/cart")) return "/(customer)/(tabs)/cart";
  if (pathname.includes("/orders") || pathname.includes("/order/")) return "/(customer)/(tabs)/orders";
  if (pathname.includes("/products") || pathname.includes("/product/")) return "/(customer)/(tabs)/favorites";
  if (pathname.includes("/account") || pathname.includes("/address") || pathname.includes("/settings") || pathname.includes("/notifications") || pathname.includes("/profile")) return "/(customer)/(tabs)/account";
  return "/(customer)/(tabs)";
}

export default function CustomerNavigation() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const shadows = useShadows();
  const { distinctCount } = useCart();
  const activePath = getActivePath(pathname);

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, spacing.xs),
          backgroundColor: colors.backgroundAlt,
          borderTopColor: colors.borderSoft,
          ...shadows.sm,
        },
      ]}
    >
      {navigationItems.map((item) => {
        const active = item.path === activePath;
        return (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            onPress={() => router.replace(item.path as never)}
            android_ripple={{ color: colors.ripple.primary }}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
          >
            <View style={[styles.iconContainer, active && { backgroundColor: colors.primarySoft }]}>
              <Icon name={active ? item.activeIcon : item.icon} size={20} color={active ? colors.primary : colors.textMuted} />
              {item.badge && distinctCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.badgeText, { color: colors.white }]}>{distinctCount > 99 ? "99+" : String(distinctCount)}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, { color: active ? colors.primary : colors.textMuted }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    minHeight: 40,
    paddingHorizontal: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  label: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.1,
    lineHeight: 11,
  },
  badge: {
    position: "absolute",
    top: -1,
    right: -3,
    minWidth: 14,
    height: 14,
    paddingHorizontal: 2,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "700",
  },
  pressed: { opacity: 0.7 },
});
