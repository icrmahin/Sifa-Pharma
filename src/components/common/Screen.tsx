import { StyleSheet, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { surface } from "../../constants/colors";
import { spacing } from "../../constants/spacing";

type ScreenProps = ViewProps & {
  /** Apply safe area padding to the top. Default: true */
  safeTop?: boolean;
  /** Apply safe area padding to the bottom. Default: false */
  safeBottom?: boolean;
  /** Background color override. Default: surface.background */
  backgroundColor?: string;
};

/**
 * Full-screen container with safe-area awareness.
 * Wraps content in a flex:1 View with optional safe-area insets.
 */
export default function Screen({
  safeTop = true,
  safeBottom = false,
  backgroundColor = surface.background,
  style,
  children,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor },
        safeTop && { paddingTop: insets.top },
        safeBottom && { paddingBottom: insets.bottom },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
