import { Redirect } from "expo-router";

// frontend-only dev mode — no auth gating, directly redirect to customer tabs
export default function AppIndex() {
  return <Redirect href="/(customer)/(tabs)" />;
}
