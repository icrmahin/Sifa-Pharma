import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../../constants/colors";
import spacing from "../../constants/spacing";
import { useCart } from "../../providers/CartProvider";
import Icon from "./Icon";
import type { IconName } from "./Icon";

const navigationItems: {
  label: string;
  path: string;
  icon: IconName;
  activeIcon: IconName;
}[] = [
  {
    label: "Home",
    path: "/(customer)/(tabs)",
    icon: "home",
    activeIcon: "home",
  },
  {
    label: "Search",
    path: "/(customer)/search",
    icon: "search",
    activeIcon: "search",
  },
  {
    label: "Cart",
    path: "/(customer)/(tabs)/cart",
    icon: "shopping-cart",
    activeIcon: "shopping-cart",
  },
  {
    label: "Favorites",
    path: "/(customer)/(tabs)/products",
    icon: "favorite-border",
    activeIcon: "favorite",
  },
  {
    label: "Settings",
    path: "/(customer)/(tabs)/account",
    icon: "settings",
    activeIcon: "settings",
  },
] as const;

function getActivePath(pathname: string) {
  if (pathname.includes("/cart")) return "/(customer)/(tabs)/cart";
  if (pathname.includes("/search")) return "/(customer)/search";
  if (pathname.includes("/products") || pathname.includes("/product/"))
    return "/(customer)/(tabs)/products";
  if (pathname.includes("/account") || pathname.includes("/address") || pathname.includes("/settings"))
    return "/(customer)/(tabs)/account";
  return "/(customer)/(tabs)";
}

export default function CustomerNavigation() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { itemCount } = useCart();
  const activePath = getActivePath(pathname);

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
    >
      {navigationItems.map((item) => {
        const active = item.path === activePath;
        return (
          <Pressable
            key={item.label}
            style={({ pressed }) => [
              styles.item,
              active && styles.activeItem,
              pressed && styles.pressed,
            ]}
            onPress={() => router.replace(item.path as never)}
            android_ripple={{ color: colors.ripple.primary }}
            accessibilityRole="button"
            accessibilityLabel={`${item.label}${item.label === "Cart" && itemCount > 0 ? `, ${itemCount} items` : ""}`}
            accessibilityState={{ selected: active }}
          >
            {active ? <View style={styles.activeIndicator} /> : null}
            <View style={[styles.iconContainer, active && styles.activeIconContainer]}>
              <Icon
                name={active ? item.activeIcon : item.icon}
                size={22}
                color={active ? colors.primary : colors.textMuted}
              />
              {item.label === "Cart" && itemCount > 0 ? (
                <View style={styles.badge} accessibilityLabel={`${itemCount} items in cart`}>
                  <Text style={styles.badgeText}>
                    {itemCount > 99 ? "99+" : itemCount}
                  </Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  item: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingTop: spacing.xs,
  },
  activeItem: {},
  activeIndicator: {
    position: "absolute",
    top: 0,
    width: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeIconContainer: {
    backgroundColor: colors.primarySoft,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "700",
  },
  pressed: { opacity: 0.7 },
});
