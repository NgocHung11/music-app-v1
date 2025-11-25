// Theme constants cho toàn bộ ứng dụng - giữ nguyên style của bạn
export const COLORS = {
  // Primary
  primary: "#4a5fd9",
  primaryLight: "#7c3aed",
  primaryDark: "#3a4fc9",

  // Background
  background: "#0a0a12",
  backgroundLight: "#1a1a2e",
  backgroundLighter: "#2a2a3e",
  surface: "#0d0d15",

  // Text
  text: "#ffffff",
  textSecondary: "#9999b3",
  textMuted: "#666666",

  // Accent
  accent: "#4a5fd9",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#e63946",

  // Border
  border: "#2a2a3e",
  borderLight: "#1a1a2e",

  // Gradient
  gradientStart: "#0a0a12",
  gradientMiddle: "#1a1a2e",
  gradientEnd: "#0a0a12",
}

export const GRADIENTS = {
  background: [COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd] as const,
  header: [COLORS.backgroundLight, COLORS.background] as const,
  primary: [COLORS.primary, COLORS.primaryLight] as const,
  card: [COLORS.backgroundLight, "#16213e"] as const,
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 16,
  xl: 17,
  xxl: 22,
  xxxl: 26,
  title: 28,
  hero: 32,
}

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 9999,
}

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 4,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10,
    elevation: 16,
  },
  primary: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
}
