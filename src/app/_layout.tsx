import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "@expo-google-fonts/sora";
import { useFonts as useInterFonts } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { AppProviders } from "../providers/AppProviders";
import { useTheme } from "../providers/ThemeProvider";

SplashScreen.preventAutoHideAsync();

function ThemedStatusBar() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <StatusBar
      barStyle={isDark ? "light-content" : "dark-content"}
      backgroundColor={isDark ? "#111A17" : "#FFFFFF"}
    />
  );
}

export default function RootLayout() {
  const [soraLoaded] = useFonts({
    Sora_400Regular: require("@expo-google-fonts/sora/400Regular/Sora_400Regular.ttf"),
    Sora_500Medium: require("@expo-google-fonts/sora/500Medium/Sora_500Medium.ttf"),
    Sora_600SemiBold: require("@expo-google-fonts/sora/600SemiBold/Sora_600SemiBold.ttf"),
    Sora_700Bold: require("@expo-google-fonts/sora/700Bold/Sora_700Bold.ttf"),
  });

  const [interLoaded] = useInterFonts({
    Inter_400Regular: require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    Inter_500Medium: require("@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf"),
    Inter_600SemiBold: require("@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf"),
    Inter_700Bold: require("@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf"),
  });

  useEffect(() => {
    if (soraLoaded && interLoaded) {
      SplashScreen.hideAsync();
    }
  }, [soraLoaded, interLoaded]);

  if (!soraLoaded || !interLoaded) return null;

  return (
    <SafeAreaProvider>
      <AppProviders>
        <ThemedStatusBar />
        <Stack screenOptions={{ headerShown: false }} />
      </AppProviders>
    </SafeAreaProvider>
  );
}
