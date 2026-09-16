import type { Order } from "../types/order";

// Placeholder: backend not yet implemented.
export function useOrders() {
  const orders: Order[] = [];
  const loading = false;
  const error: string | null = null;
  const reload = async () => {};
  return { orders, loading, error, reload };
}
