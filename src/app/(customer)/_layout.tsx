import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import CustomerNavigation from "../../components/common/CustomerNavigation";
import CustomerDesktopHeader from "../../components/common/CustomerDesktopHeader";
import { useResponsive } from "../../hooks/useResponsive";

export default function CustomerLayout() {
  const { isMobile } = useResponsive();

  return (
    <View style={styles.container}>
      {!isMobile && <CustomerDesktopHeader />}
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="search" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="delivery-cycle" />
          <Stack.Screen name="order/[orderId]" />
          <Stack.Screen name="products" />
          <Stack.Screen name="account" />
          <Stack.Screen name="address" />
        </Stack>
      </View>
      {isMobile && <CustomerNavigation />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
