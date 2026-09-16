import type { Product } from "../types/product";

// Placeholder: backend not yet implemented.
export function useProducts(_filters: Record<string, unknown> = {}) {
  const data: Product[] = [];
  const loading = false;
  const error: string | null = null;
  const hasMore = false;
  const reload = async () => {};
  return { data, loading, error, hasMore, reload };
}
