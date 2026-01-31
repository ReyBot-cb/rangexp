// RangeXp Theme Tokens
export const theme = {
  colors: {
    // Primary - Warm Purple (Rex brand)
    primary: "#7C3AED",
    primaryLight: "#A78BFA",
    primaryDark: "#5B21B6",
    
    // Rex Colors
    rex: {
      body: "#8B5CF6",
      glow: "#A78BFA",
      happy: "#10B981",
      celebrate: "#F59E0B",
      support: "#3B82F6",
      neutral: "#6B7280",
    },
    
    // XP & Gamification
    xp: "#F59E0B",
    xpLight: "#FCD34D",
    streak: "#EF4444",
    achievement: "#10B981",
    
    // Backgrounds
    background: {
      light: "#FAFAFA",
      dark: "#111827",
      card: {
        light: "#FFFFFF",
        dark: "#1F2937",
      },
    },
    
    // Text
    text: {
      primary: {
        light: "#111827",
        dark: "#F9FAFB",
      },
      secondary: {
        light: "#6B7280",
        dark: "#9CA3AF",
      },
    },
    
    // States
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    
    // Glucose ranges (non-alarmist colors)
    glucose: {
      low: "#FCD34D",      // Yellow - "pay attention"
      normal: "#10B981",   // Green - "good"
      high: "#F59E0B",     // Orange - "note it"
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
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    rex: {
      shadowColor: "#8B5CF6",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 8,
    },
  },
};

export type ThemeColors = typeof theme.colors;
