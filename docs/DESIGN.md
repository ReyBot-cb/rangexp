# RangeXp Design System

> Sistema de diseño para RangeXp - Gamified Diabetes Self-Management

## 🎯 Filosofía de Diseño

**"Calm Technology"** - La tecnología debe reducir ansiedad, no aumentarla.

### Principios Fundamentales

1. **Sin Alarmismo**: Nunca usamos rojo puro para glucosa fuera de rango
2. **Calidez Visual**: Colores suaves, bordes redondeados, espacios generosos
3. **Progreso Visible**: El usuario siempre ve su avance
4. **Micro-interacciones**: Feedback positivo en cada acción
5. **Rex Central**: Rex vive en cada pantalla importante

---

## 🎨 Paleta de Colores

### Colores de Marca

```typescript
const brand = {
  primary: "#7C3AED",      // Púrpura cálido - principal
  primaryLight: "#A78BFA", // Lavanda - hover/gradientes
  primaryDark: "#5B21B6",  // Púrpura oscuro - activo
};
```

### Rex - Personaje Companion

```typescript
const rex = {
  body: "#8B5CF6",        // Púrpura suave - cuerpo de Rex
  glow: "#A78BFA",        // Brillo suave - halo/glow
  happy: "#10B981",       // Verde cálido - celebración
  celebrate: "#F59E0B",   // Ámbar - logro mayor
  support: "#3B82F6",     // Azul calmante - ayuda
  neutral: "#6B7280",     // Gris cálido - estado neutral
  sleeping: "#6366F1",    // Indigo - modo inactivo
};
```

### Estados de Glucosa (No Alarmista)

```typescript
const glucose = {
  low: "#FCD34D",      // Amarillo suave - "presta atención"
  normal: "#10B981",   // Verde esmeralda - "en rango"
  high: "#F59E0B",     // Naranja cálido - "nota esto"
  
  // Alternativas para daltonismo
  lowAlt: "#EAB308",   // Amarillo más saturado
  highAlt: "#EA580C",  // Naranja más saturado
};
```

### Gamificación

```typescript
const gamification = {
  xp: "#F59E0B",           // Oro - XP ganado
  xpLight: "#FCD34D",      // Oro claro - borde de progreso
  streak: "#F97316",       // Naranja cálido - rachas (no rojo)
  achievement: "#10B981",  // Verde - logros
  levelUp: "#8B5CF6",      // Púrpura - subida de nivel
  rare: "#A855F7",         // Violeta - logro raro
  epic: "#EC4899",         // Rosa - logro épico
  legendary: "#F59E0B",    // Dorado - logro legendario
};
```

### Fondo y Superficies

```typescript
const backgrounds = {
  light: {
    primary: "#FAFAFA",    // Gris muy claro
    secondary: "#F3F4F6",  // Gris claro
    card: "#FFFFFF",       // Blanco puro
    elevated: "#FFFFFF",   // Card elevado
  },
  dark: {
    primary: "#111827",    // Gris muy oscuro
    secondary: "#1F2937",  // Gris oscuro
    card: "#1F2937",       // Card oscuro
    elevated: "#374151",   // Card elevado oscuro
  },
};
```

### Texto

```typescript
const text = {
  primary: {
    light: "#111827",      // Casi negro - alto contraste
    dark: "#F9FAFB",       // Blanco hueso - alto contraste
  },
  secondary: {
    light: "#6B7280",      // Gris medio
    dark: "#9CA3AF",       // Gris claro
  },
  disabled: {
    light: "#9CA3AF",
    dark: "#6B7280",
  },
  inverted: {
    light: "#FFFFFF",
    dark: "#111827",
  },
};
```

### Estados UI

```typescript
const states = {
  success: "#10B981",   // Verde
  warning: "#F59E0B",   // Ámbar
  error: "#EF4444",     // Rojo (solo para errores del sistema, nunca para glucosa)
  info: "#3B82F6",      // Azul
  disabled: "#D1D5DB",  // Gris deshabilitado
};
```

### Gradientes

```typescript
const gradients = {
  rex: ["#8B5CF6", "#A78BFA", "#C4B5FD"],
  xpBar: ["#F59E0B", "#FCD34D"],
  celebrate: ["#F59E0B", "#EF4444"],
  calm: ["#3B82F6", "#8B5CF6"],
  night: ["#1F2937", "#111827"],
};
```

---

## 🔤 Tipografía

### Familia tipográfica

| Uso | Font | Weight | Size |
|-----|------|--------|------|
| Headlines | Inter | 700 (Bold) | 24-36px |
| Subtitles | Inter | 600 (SemiBold) | 18-20px |
| Body | Inter | 400 (Regular) | 14-16px |
| Caption | Inter | 400 (Regular) | 12px |
| Labels | Inter | 600 (SemiBold) | 14px |
| Code/Glucose | JetBrains Mono | 400 | 14-24px |

### Escala tipográfica

```typescript
const typography = {
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
    "5xl": 48,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

### Aplicación por componente

```typescript
const textStyles = {
  h1: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16,
  },
  glucoseValue: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 48,
    lineHeight: 56,
  },
  glucoseUnit: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 20,
    lineHeight: 24,
  },
};
```

---

## 📏 Sistema de Espaciado

### Escala base (4px)

```typescript
const spacing = {
  xs: 4,      // 0.25rem
  sm: 8,      // 0.5rem
  md: 16,     // 1rem
  lg: 24,     // 1.5rem
  xl: 32,     // 2rem
  "2xl": 48,  // 3rem
  "3xl": 64,  // 4rem
  "4xl": 80,  // 5rem
};
```

### Layout

```typescript
const layout = {
  screenPadding: 16,
  cardPadding: 16,
  contentPadding: 24,
  gutter: 16,
  sectionGap: 24,
  itemGap: 12,
};
```

---

## 📐 Radios de Borde

```typescript
const borderRadius = {
  sm: 8,      // Buttons pequeños
  md: 12,     // Cards, inputs
  lg: 16,     // Cards grandes
  xl: 24,     // Modales, onboarding
  "2xl": 32,  // Pantallas completas
  full: 9999, // Pills, avatars
};
```

---

## 🌑 Sombras

```typescript
const shadows = {
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
};
```

---

## 🔘 Componentes Base

### Buttons

```typescript
const buttons = {
  primary: {
    background: "#7C3AED",
    text: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    fontWeight: "600",
    shadow: true,
  },
  secondary: {
    background: "transparent",
    text: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: "#7C3AED",
    fontWeight: "600",
  },
  ghost: {
    background: "transparent",
    text: "#6B7280",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontWeight: "500",
  },
  success: {
    background: "#10B981",
    text: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    fontWeight: "600",
  },
};
```

### Cards

```typescript
const cards = {
  default: {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadow: "soft",
  },
  elevated: {
    background: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadow: "medium",
  },
  glucose: {
    background: "#F3F4F6",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981", // Cambia según estado
  },
  achievement: {
    background: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
    borderRadius: 16,
    padding: 16,
  },
};
```

### Inputs

```typescript
const inputs = {
  default: {
    background: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "transparent",
    fontSize: 16,
  },
  focused: {
    background: "#FFFFFF",
    borderColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    fontSize: 16,
  },
  error: {
    background: "#FEF2F2",
    borderColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    fontSize: 16,
  },
};
```

---

## 🖼️ Iconografía

### Principios

1. **Estilo**: Line icons (2px stroke)
2. **Redondeo**: Todas las esquinas redondeadas (2px)
3. **Tamaños**: 20px, 24px, 32px
4. **Colores**: Semantic, no genéricos

### Iconos por categoría

```typescript
const icons = {
  // Glucose
  glucose: "droplet",
  glucoseLow: "droplet-minus",
  glucoseHigh: "droplet-plus",
  
  // Rex & Emotions
  rex: "smile",
  rexHappy: "smile",
  rexCelebrate: "star",
  rexSupport: "heart",
  
  // Actions
  add: "plus",
  edit: "edit",
  delete: "trash",
  save: "check",
  cancel: "x",
  
  // Navigation
  home: "home",
  profile: "user",
  friends: "users",
  achievements: "award",
  settings: "settings",
  
  // Gamification
  xp: "zap",
  streak: "flame",
  level: "trending-up",
  badge: "shield",
  
  // Social
  like: "heart",
  comment: "message",
  share: "share",
  friendAdd: "user-plus",
};
```

---

## 📱 Breakpoints

```typescript
const breakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};
```

---

## 🌗 Modo Oscuro

Todas las definiciones de color incluyen variantes light/dark. El sistema debe:

1. Detectar preferencia del sistema
2. Permitir override manual
3. Transicionar suavemente entre modos
4. Mantener contraste mínimo de 4.5:1

---

## ♿ Accesibilidad

### Checklist

- [ ] Contraste mínimo 4.5:1 para texto normal
- [ ] Contraste mínimo 3:1 para texto grande
- [ ] Target mínimo 44x44px para touch
- [ ] Etiquetas ARIA en todos los inputs
- [ ] Estados focus visibles
- [ ] Soporte de lectores de pantalla
- [ ] No depender solo del color (usar iconos + color)

### Glucosa y Color

Nunca comunicar estado de glucosa solo con color. Siempre acompañar con:
- Icono (gota形状)
- Texto ("En rango", "Alto", "Bajo")
- Evitar rojo para estados fuera de rango

---

## 🚀 Uso del Theme

### React Native

```typescript
import { theme } from '@rangexp/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.light.primary,
    padding: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
});
```

### Styled Components

```typescript
import { theme } from '@rangexp/theme';

const Button = styled.button`
  background: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md}px;
  padding: ${theme.spacing.sm}px ${theme.spacing.lg}px;
`;
```
