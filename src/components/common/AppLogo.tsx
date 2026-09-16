import { Image } from "expo-image";
import { StyleSheet, type ImageStyle, type StyleProp } from "react-native";

const logoDark = require("@/assets/images/logo/sifa-logo-dark.png");
const logoWhite = require("@/assets/images/logo/sifa-logo-white.png");

type AppLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
  variant?: "dark" | "white";
};

export default function AppLogo({ size = 88, style, variant = "dark" }: AppLogoProps) {
  return (
    <Image
      source={variant === "white" ? logoWhite : logoDark}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
      priority="high"
      accessibilityLabel="Sifa-Pharma logo"
    />
  );
}
