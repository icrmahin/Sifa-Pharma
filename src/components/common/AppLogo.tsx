import { Image } from "expo-image";
import { StyleSheet, type ImageStyle, type StyleProp } from "react-native";

const logoDark = require("@/assets/images/logo/sifa-logo-dark.png");
const logoWhite = require("@/assets/images/logo/sifa-logo-white.png");

type AppLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
  variant?: "dark" | "white";
};

export default function AppLogo({ size = 40, style, variant = "dark" }: AppLogoProps) {
  return (
    <Image
      source={variant === "white" ? logoWhite : logoDark}
      style={[
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2, // FIX: Makes it perfectly round
        }, 
        style
      ]}
      contentFit="cover" // NOTE: Ensures the image fills the rounded container fully
      priority="high"
      accessibilityLabel="Sifa-Pharma logo"
    />
  );
}
