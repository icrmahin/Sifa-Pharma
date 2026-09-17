import { Tabs } from "expo-router";
import { useThemeColors } from "../../../providers/ThemeProvider";
import Icon from "../../../components/common/Icon";

export default function CustomerTabsLayout() {
  const colors = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { display: "none" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <Icon name="home" size={22} color={color} /> }} />
      <Tabs.Screen name="products" options={{ title: "Products", tabBarIcon: ({ color }) => <Icon name="grid-view" size={22} color={color} /> }} />
      <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: ({ color }) => <Icon name="inventory-2" size={22} color={color} /> }} />
      <Tabs.Screen name="cart" options={{ href: null }} />
      <Tabs.Screen name="account" options={{ title: "Settings", tabBarIcon: ({ color }) => <Icon name="settings" size={22} color={color} /> }} />
    </Tabs>
  );
}