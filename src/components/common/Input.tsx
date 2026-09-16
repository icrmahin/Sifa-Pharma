import { useState } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import { colors, surface } from "../../constants/colors";
import { radius, layout, opacity as opacityToken } from "../../constants/sizes";
import { spacing } from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  /** Optional helper text shown below the input */
  hint?: string;
  /** Prefix element (e.g. currency symbol) */
  prefix?: React.ReactNode;
  /** Suffix element (e.g. unit label) */
  suffix?: React.ReactNode;
  containerStyle?: ViewStyle;
};

export default function Input({
  label,
  error,
  hint,
  prefix,
  suffix,
  containerStyle,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          !!error && styles.inputRowError,
          props.editable === false && styles.inputRowDisabled,
        ]}
      >
        {prefix ? <View style={styles.adornment}>{prefix}</View> : null}
        <TextInput
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            styles.input,
            props.multiline && styles.textArea,
            !!prefix && styles.inputWithPrefix,
            !!suffix && styles.inputWithSuffix,
            props.style,
          ]}
          placeholderTextColor={colors.textMuted}
        />
        {suffix ? <View style={styles.adornment}>{suffix}</View> : null}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.bodySmall,
    lineHeight: fontSize.bodySmall * lineHeight.normal,
    color: colors.text,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: layout.inputHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: surface.DEFAULT,
  },
  inputRowFocused: { borderColor: colors.primary, borderWidth: 2 },
  inputRowError: { borderColor: colors.danger },
  inputRowDisabled: { backgroundColor: surface.disabled, opacity: opacityToken.disabled },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: fontSize.body * lineHeight.normal,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    minHeight: layout.inputHeight,
  },
  inputWithPrefix: { paddingLeft: spacing.xs },
  inputWithSuffix: { paddingRight: spacing.xs },
  textArea: {
    minHeight: 120,
    borderRadius: radius.xl,
    textAlignVertical: "top",
    paddingTop: spacing.lg,
  },
  adornment: {
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    lineHeight: fontSize.caption * lineHeight.normal,
    color: colors.danger,
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    lineHeight: fontSize.caption * lineHeight.normal,
    color: colors.textMuted,
  },
});
