import type { NotificationItem } from "../types/notification";

// Placeholder: backend not yet implemented.
export function useNotifications() {
  const items: NotificationItem[] = [];
  const loading = false;
  const reload = async () => {};
  return { items, loading, reload };
}
