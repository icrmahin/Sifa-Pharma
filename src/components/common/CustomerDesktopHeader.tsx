import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../../providers/ThemeProvider";
import { useShadows } from "../../constants/shadows";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize } from "../../constants/typography";
import { useCart } from "../../providers/CartProvider";
import { useAuth } from "../../hooks/useAuth";
import Icon from "./Icon";
import AppLogo from "./AppLogo";
import type { IconName } from "./Icon";

const navLinks: { label: string; path: string; icon: IconName }[] = [
  { label: "Home", path: "/(customer)/(tabs)", icon: "home" },
  { label: "Products", path: "/(customer)/(tabs)/products", icon: "inventory-2" },
  { label: "Orders", path: "/(customer)/(tabs)/orders", icon: "receipt-long" },
  { label: "Account", path: "/(customer)/(tabs)/account", icon: "person" },
];

function getActivePath(pathname: string) {
  if (pathname.includes("/cart")) return "/(customer)/(tabs)/cart";
  if (pathname.includes("/search")) return "/(customer)/search";
  if (pathname.includes("/products") || pathname.includes("/product/"))
    return "/(customer)/(tabs)/products";
  if (pathname.includes("/account") || pathname.includes("/address") || pathname.includes("/settings"))
    return "/(customer)/(tabs)/account";
  if (pathname.includes("/orders") || pathname.includes("/order/"))
    return "/(customer)/(tabs)/orders";
  return "/(customer)/(tabs)";
}

export default function CustomerDesktopHeader() {
  const pathname = usePathname();
  const colors = useThemeColors();
  const shadows = useShadows();
  const { itemCount } = useCart();
  const { isAdmin } = useAuth();
  const activePath = getActivePath(pathname);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundAlt,
          borderBottomColor: colors.borderLight,
          ...shadows.sm,
        },
      ]}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <Pressable
          style={styles.brandRow}
          onPress={() => router.replace("/(customer)/(tabs)" as never)}
        >
          <AppLogo size={32} />
          <Text style={[styles.brandName, { color: colors.text }]}>Sifa-Pharma</Text>
        </Pressable>

        {/* Nav Links */}
        <View style={styles.navLinks}>
          {navLinks.map((item) => {
            const active = item.path === activePath;
            return (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.navItem,
                  active && { backgroundColor: colors.primarySoft },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => router.replace(item.path as never)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: active }}
              >
                <Icon
                  name={item.icon}
                  size={16}
                  color={active ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.navLabel,
                    { color: active ? colors.primary : colors.textMuted },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
          {isAdmin ? (
            <Pressable
              style={({ pressed }) => [
                styles.navItem,
                { backgroundColor: colors.gold + "20" },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => router.replace("/(admin)" as never)}
              accessibilityRole="button"
              accessibilityLabel="Admin Dashboard"
            >
              <Icon name="dashboard" size={16} color={colors.gold} />
              <Text style={[styles.navLabel, { color: colors.gold }]}>Admin</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Right side: Search + Cart */}
        <View style={styles.rightSection}>
          <Pressable
            style={[styles.searchTrigger, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
            onPress={() => router.push("/(customer)/search" as never)}
            accessibilityRole="button"
            accessibilityLabel="Search products"
          >
            <Icon name="search" size={16} color={colors.textMuted} />
            <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>Search medicines...</Text>
          </Pressable>

          <Pressable
            style={[styles.cartButton, { backgroundColor: colors.primarySoft, borderColor: colors.borderLight }]}
            onPress={() => router.push("/(customer)/(tabs)/cart" as never)}
            accessibilityRole="button"
            accessibilityLabel={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
          >
            <Icon name="shopping-cart" size={18} color={colors.primary} />
            {itemCount > 0 ? (
              <View style={[styles.badge, { backgroundColor: colors.gold }]}>
                <Text style={[styles.badgeText, { color: colors.white }]}>
                  {itemCount > 99 ? "99+" : itemCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    width: "100%",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: spacing.xl,
    width: "100%",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginRight: spacing.xxxl,
  },
  brandName: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    lineHeight: fontSize.body * 1.3,
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    minHeight: 36,
  },
  navLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.caption,
    lineHeight: fontSize.caption * 1.3,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
  },
  searchPlaceholder: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    lineHeight: fontSize.caption * 1.3,
  },
  cartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
  },
});
