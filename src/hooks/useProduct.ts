import type { Product } from "../types/product";

// Placeholder: backend not yet implemented.
export function useProduct(_productId?: string) {
  const product: Product | undefined = undefined;
  const loading = false;
  const error: string | null = null;
  const reload = async () => {};
  return { product, loading, error, reload };
}
