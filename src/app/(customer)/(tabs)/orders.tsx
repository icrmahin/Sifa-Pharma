import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../../components/common/EmptyState";
import ErrorState from "../../../components/common/ErrorState";
import Header from "../../../components/common/Header";
import LoadingState from "../../../components/common/LoadingState";
import OrderCard from "../../../components/orders/OrderCard";
import colors from "../../../constants/colors";
import spacing from "../../../constants/spacing";
import type { Order } from "../../../types/order";

// frontend-only placeholder — no backend required
const mockOrders: Order[] = [];
const getOrders = async (): Promise<Order[]> => {
  // backend required — return empty placeholder
  return mockOrders;
};

export default function CustomerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setError("Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading your orders" />;
  if (error)
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setLoading(true);
          setError(null);
          getOrders()
            .then(setOrders)
            .catch(() => setError("Please try again."))
            .finally(() => setLoading(false));
        }}
      />
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Orders" subtitle="Track current and previous deliveries" />
      <ScrollView contentContainerStyle={styles.container}>
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            message="Your completed orders will appear here."
            actionLabel="Browse products"
            onAction={() => router.push("/(customer)/(tabs)/products")}
          />
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={(item) =>
                router.push({
                  pathname: "/(customer)/order/[orderId]",
                  params: { orderId: item.id },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
});
