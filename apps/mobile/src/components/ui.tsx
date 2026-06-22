import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme/colors";
import { fonts, radius, shadow } from "../theme/typography";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/* ------------------------------------------------------------------ Screen */

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  padTop?: boolean;
  overlay?: ReactNode;
};

export function Screen({
  children,
  scroll = false,
  contentStyle,
  style,
  padTop = true,
  overlay
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const top = padTop ? insets.top + 6 : 0;

  return (
    <View style={[styles.screen, style]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[{ paddingTop: top }, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingTop: top }, contentStyle]}>{children}</View>
      )}
      {overlay}
    </View>
  );
}

/* ------------------------------------------------------------------ Text */

export function AppText({
  children,
  style,
  weight = "medium",
  numberOfLines
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  weight?: keyof typeof fonts;
  numberOfLines?: number;
}) {
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontFamily: fonts[weight], color: colors.ink }, style]}>
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ Button */

type ButtonVariant = "primary" | "dark" | "ghost";

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled,
  loading,
  style
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isDisabled = disabled || loading;
  const palette = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary },
    dark: { bg: colors.ink, fg: colors.white, border: colors.ink },
    ghost: { bg: colors.surface, fg: colors.ink, border: colors.lineStrong }
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border },
        variant === "ghost" && styles.buttonGhost,
        variant === "primary" && !isDisabled && shadow.yellow,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.buttonDisabled,
        style
      ]}
    >
      {icon ? (
        <MaterialCommunityIcons
          color={isDisabled ? colors.faint : palette.fg}
          name={icon}
          size={19}
          style={{ marginRight: 8 }}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          { color: isDisabled ? colors.faint : palette.fg }
        ]}
      >
        {loading ? "Please wait…" : label}
      </Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Chip */

export function Chip({
  label,
  active,
  onPress,
  icon
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
    >
      {icon ? (
        <MaterialCommunityIcons
          color={active ? colors.white : colors.inkSoft}
          name={icon}
          size={15}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text style={[styles.chipText, { color: active ? colors.white : colors.inkSoft }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Tag */

export function Tag({
  label,
  tone = "primary"
}: {
  label: string;
  tone?: "primary" | "dark" | "success" | "danger";
}) {
  const map = {
    primary: { bg: colors.primarySoft, fg: colors.primaryDark },
    dark: { bg: colors.ink, fg: colors.white },
    success: { bg: colors.successSoft, fg: colors.success },
    danger: { bg: colors.dangerSoft, fg: colors.danger }
  }[tone];

  return (
    <View style={[styles.tag, { backgroundColor: map.bg }]}>
      <Text style={[styles.tagText, { color: map.fg }]}>{label}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ IconButton */

export function IconButton({
  icon,
  onPress,
  tone = "light"
}: {
  icon: IconName;
  onPress?: () => void;
  tone?: "light" | "dark" | "yellow";
}) {
  const map = {
    light: { bg: colors.surface, fg: colors.ink, border: colors.line },
    dark: { bg: colors.ink, fg: colors.white, border: colors.ink },
    yellow: { bg: colors.primary, fg: colors.onPrimary, border: colors.primary }
  }[tone];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: map.bg, borderColor: map.border },
        pressed && styles.pressed
      ]}
    >
      <MaterialCommunityIcons color={map.fg} name={icon} size={21} />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Stars */

export function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 1 }}>
      {[0, 1, 2, 3, 4].map((index) => (
        <MaterialCommunityIcons
          key={index}
          color={index < Math.round(rating) ? colors.primary : colors.lineStrong}
          name="star"
          size={size}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  button: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: 20
  },
  buttonGhost: {
    borderWidth: 1.5
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.surfaceSunken
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: 15.5,
    letterSpacing: 0.2
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }]
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  chipIdle: {
    backgroundColor: colors.surface,
    borderColor: colors.line
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink
  },
  chipText: {
    fontFamily: fonts.bold,
    fontSize: 13
  },
  tag: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  tagText: {
    fontFamily: fonts.extrabold,
    fontSize: 10.5,
    letterSpacing: 0.4,
    textTransform: "uppercase"
  },
  iconButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1
  }
});
