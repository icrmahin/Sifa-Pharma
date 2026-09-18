import { router } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "../../../providers/ThemeProvider";
import EmptyState from "../../../components/common/EmptyState";
import ErrorState from "../../../components/common/ErrorState";
import Header from "../../../components/common/Header";
import LoadingState from "../../../components/common/LoadingState";
import ResponsiveContainer from "../../../components/common/ResponsiveContainer";
import OrderCard from "../../../components/orders/OrderCard";
import spacing from "../../../constants/spacing";
import { useResponsive } from "../../../hooks/useResponsive";
import type { Order } from "../../../types/order";
import { useOrders } from "../../../hooks/useOrders";

export default function CustomerOrdersScreen() {
  const colors = useThemeColors();
  const { orders, loading, error, reload } = useOrders();
  const { isMobile, isTablet, columns } = useResponsive();

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) return <LoadingState label="Loading your orders" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const gridColumns = isMobile ? 1 : isTablet ? 2 : Math.min(columns, 3);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Orders" subtitle="Track current and previous deliveries" />
      <ScrollView contentContainerStyle={styles.container}>
        <ResponsiveContainer>
          {orders.length === 0 ? (
            <EmptyState title="No orders yet" message="Your completed orders will appear here." actionLabel="Browse products" onAction={() => router.push("/(customer)/(tabs)/products")} />
          ) : gridColumns > 1 ? (
            <View style={styles.grid}>
              {orders.map((order) => (
                <View key={order.id} style={[styles.gridItem, { flexBasis: `${100 / gridColumns - 1}%` }]}>
                  <OrderCard order={order} onPress={(item) => router.push({ pathname: "/(customer)/order/[orderId]", params: { orderId: item.id } })} />
                </View>
              ))}
            </View>
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} onPress={(item) => router.push({ pathname: "/(customer)/order/[orderId]", params: { orderId: item.id } })} />)
          )}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  gridItem: { marginBottom: spacing.md },
});