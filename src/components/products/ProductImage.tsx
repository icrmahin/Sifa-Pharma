import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, type ImageStyle, type StyleProp } from "react-native";
import { useThemeColors } from "../../providers/ThemeProvider";

const placeholder = require("@/assets/images/placeholders/product-placeholder.png");

type ProductImageProps = {
  uri?: string | null;
  recyclingKey?: string;
  style?: StyleProp<ImageStyle>;
};

function ProductImage({ uri, recyclingKey, style }: ProductImageProps) {
  const colors = useThemeColors();
  return (
    <Image
      source={uri ? { uri } : placeholder}
      placeholder={placeholder}
      recyclingKey={recyclingKey}
      cachePolicy="memory-disk"
      priority="low"
      contentFit="cover"
      transition={recyclingKey ? 0 : 180}
      style={[styles.image, { backgroundColor: colors.background }, style]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 140,
  },
});

export default memo(ProductImage);