// Local theme re-export for easier imports
export const theme = {
  colors: {
    primary: "#7C3AED",
    primaryLight: "#A78BFA",
    primaryDark: "#5B21B6",
    rex: {
      body: "#8B5CF6",
      glow: "#A78BFA",
      happy: "#10B981",
      celebrate: "#F59E0B",
      support: "#3B82F6",
      neutral: "#6B7280",
      sleeping: "#6366F1",
    },
    gamification: {
      xp: "#F59E0B",
      xpLight: "#FCD34D",
      streak: "#F97316",
      achievement: "#10B981",
      levelUp: "#8B5CF6",
      rare: "#A855F7",
      epic: "#EC4899",
      legendary: "#F59E0B",
    },
    background: {
      light: {
        primary: "#FAFAFA",
        secondary: "#F3F4F6",
        card: "#FFFFFF",
      },
      dark: {
        primary: "#111827",
        secondary: "#1F2937",
        card: "#1F2937",
      },
    },
    text: {
      primary: {
        light: "#111827",
        dark: "#F9FAFB",
      },
      secondary: {
        light: "#6B7280",
        dark: "#9CA3AF",
      },
      disabled: {
        light: "#9CA3AF",
        dark: "#6B7280",
      },
    },
    states: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    },
    glucose: {
      low: "#FCD34D",
      normal: "#10B981",
      high: "#F59E0B",
    },
  },
  typography: {
    fontFamily: {
      heading: "Inter_700Bold",
      body: "Inter_400Regular",
      mono: "JetBrainsMono_400Regular",
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    "2xl": 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    soft: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    rex: {
      shadowColor: "#8B5CF6",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 8,
    },
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 3,
    },
  },
};

export type Theme = typeof theme;
