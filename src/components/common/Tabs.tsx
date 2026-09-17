import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors } from "../../constants/colors";
import { radius, layout } from "../../constants/sizes";
import { spacing } from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";

type Tab = {
  key: string;
  label: string;
};

type TabsProps = {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Full-width tabs evenly distributed. Default: false */
  fullWidth?: boolean;
  style?: ViewStyle;
};

/**
 * Horizontal pill-style tab bar. Scrolls horizontally when tabs overflow.
 */
export default function Tabs({ tabs, activeKey, onChange, fullWidth = false, style }: TabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, fullWidth && styles.fullWidth, style]}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, active && styles.tabActive, fullWidth && styles.tabFull]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: layout.controlHeight,
    alignItems: "center",
  },
  fullWidth: { gap: 0, paddingHorizontal: 0 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    height: layout.controlHeight,
    borderRadius: radius.pill,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  tabFull: { flex: 1 },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * lineHeight.normal,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.white,
    fontFamily: fontFamily.semiBold,
  },
});
