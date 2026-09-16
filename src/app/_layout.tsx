import { useEffect } from "react";
import { colors } from "@/constants/colors";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "@expo-google-fonts/sora";
import * as SplashScreen from "expo-splash-screen";
import { AppProviders } from "../providers/AppProviders";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_400Regular: require("@expo-google-fonts/sora/400Regular/Sora_400Regular.ttf"),
    Sora_500Medium: require("@expo-google-fonts/sora/500Medium/Sora_500Medium.ttf"),
    Sora_600SemiBold: require("@expo-google-fonts/sora/600SemiBold/Sora_600SemiBold.ttf"),
    Sora_700Bold: require("@expo-google-fonts/sora/700Bold/Sora_700Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AppProviders>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.backgroundAlt}
        />
        <Stack screenOptions={{ headerShown: false }} />
      </AppProviders>
    </SafeAreaProvider>
  );
}
