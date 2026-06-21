// Plus Jakarta Sans — the rounded geometric sans that carries the Foody look.
// React Native cannot synthesize weights from a single family, so each weight
// is registered as its own family and referenced explicitly via `fonts.*`.
export const fonts = {
  regular: "PlusJakartaSans_400",
  medium: "PlusJakartaSans_500",
  semibold: "PlusJakartaSans_600",
  bold: "PlusJakartaSans_700",
  extrabold: "PlusJakartaSans_800"
};

export const fontAssets = {
  PlusJakartaSans_400: require("../../assets/fonts/PlusJakartaSans-400.ttf"),
  PlusJakartaSans_500: require("../../assets/fonts/PlusJakartaSans-500.ttf"),
  PlusJakartaSans_600: require("../../assets/fonts/PlusJakartaSans-600.ttf"),
  PlusJakartaSans_700: require("../../assets/fonts/PlusJakartaSans-700.ttf"),
  PlusJakartaSans_800: require("../../assets/fonts/PlusJakartaSans-800.ttf")
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999
};

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28
};

export const shadow = {
  card: {
    shadowColor: "#1B1206",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4
  },
  float: {
    shadowColor: "#1B1206",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 10
  },
  yellow: {
    shadowColor: "#F0A900",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.36,
    shadowRadius: 24,
    elevation: 8
  }
};
