import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, CartSummary } from "../types/cart";

type CartContextValue = {
  items: CartItem[];
  summary: CartSummary;
  loading: boolean;
  itemCount: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

const emptySummary: CartSummary = { subtotal: 0, discount: 0, deliveryFee: 0, total: 0 };

export function CartProvider({ children }: { children: ReactNode }) {
  const [items] = useState<CartItem[]>([]);
  const [summary] = useState<CartSummary>(emptySummary);
  const loading = false;

  const addItem = async (_productId: string, _quantity = 1) => {
    // No backend - frontend-only placeholder.
  };

  const setQuantity = async (_itemId: string, _quantity: number) => {
    // No backend - frontend-only placeholder.
  };

  const removeItem = async (_itemId: string) => {
    // No backend - frontend-only placeholder.
  };

  const value = useMemo(
    () => ({
      items,
      summary,
      loading,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
    }),
    [items, summary, loading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
