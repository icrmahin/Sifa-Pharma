import { type ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { CartProvider } from "./CartProvider";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}
