import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "../../providers/ThemeProvider";
import spacing from "../../constants/spacing";
import typography from "../../constants/typography";

type AdminHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export default function AdminHeader({ title, subtitle, action }: AdminHeaderProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.backgroundAlt,
          borderBottomColor: colors.borderLight,
        },
      ]}
    >
      <View style={styles.titleArea}>
        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
          Sifa-Pharma · Admin
        </Text>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {action ? <View>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  titleArea: { flex: 1 },
  eyebrow: {
    fontSize: typography.caption2,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: typography.title2,
    fontWeight: "700",
    letterSpacing: typography.letterSpacing.tight,
    marginTop: spacing.xxs,
  },
  subtitle: {
    fontSize: typography.caption1,
    marginTop: spacing.xxs,
  },
});
