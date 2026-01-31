# Rex Character Design

> Especificaciones visuales y de comportamiento del companion character de RangeXp

## 🎯 Esencia de Rex

**Rex es una gota amigable** que representa la comprensión y el apoyo en el viaje de manejo de la diabetes.

### Valores Core

- **Nunca juzga**: No hay "malos" días, solo días con más aprendizaje
- **Celebra lo pequeño**: Cada registro es un victoria
- **Reencuadra errores**: "Ups, veamos qué pasó" > "Fallaste"
- **Reduce ansiedad**: Presencia calmante, no alarmista

### Personalidad

| Aspecto | Descripción |
|---------|-------------|
| Tono | Amigable, cálido, ligeramente juguetón |
| Energía | Tranquila pero entusiasta |
| Humor | Sutil, nunca sarcástico |
| Voz | Segunda persona, animadora |

---

## 🎨 Especificaciones Visuales

### Forma Base

```
        ╭─────╮
       ╱   ▼   ╲     ← Highlight superior (luz)
      │        │
      │        │
      │   👁   │     ← Ojos grandes, expresivos
      │        │
      │        │
       ╲   ▼   ╱     ← Highlight inferior
        ╰──┬──╯
           ▼
      ~~~~~~~~~~     ← Ondas inferiores (forma de gota)
```

### Proporciones

| Elemento | Proporción |
|----------|------------|
| Altura total | 100% |
| Anchura máxima | 60% de altura |
| Radio cabeza | 40% del ancho |
| Cuerpo (después de cabeza) | 60% del alto |
| Ojos | 15% del alto cada uno |

### Colores

```typescript
const rexColors = {
  body: "#8B5CF6",        // Púrpura suave (principal)
  bodyGradient: ["#8B5CF6", "#A78BFA"],  // Gradiente cuerpo
  glow: "#A78BFA",        // Brillo/halo
  highlight: "rgba(255,255,255,0.3)",    // Brillo luz
  shadow: "rgba(139, 92, 246, 0.3)",     // Sombra suave
  
  // Ojos
  eyeWhite: "#FFFFFF",
  eyePupil: "#1F2937",
  eyeHighlight: "rgba(255,255,255,0.8)",
  
  // Mejillas (rosa sutil)
  cheeks: "rgba(236, 72, 153, 0.3)",
};
```

### Estados de Ánimo

#### 1. 🟢 Happy (Default)
**Cuándo**: Pantalla principal, registros normales, inicio de app

```
Expresión: Sonrisa suave, ojos ligeramente cerrados (^ ^)
Movimiento: Flotación gentle, pequeño bounce
Color: Brillo normal
```

```
        ╭─────╮
       ╱  ◠ ◠  ╲     ← Ojos felices
      │   ───   │
      │   ﹏ ﹏  │     ← Sonrisa
       ╲   ◡   ╱
        ╰──┬──╯
     ~~~~~~~~~~~~
```

#### 2. 🟡 Celebrate (Logro/Nivel)
**Cuándo**: Nivel completado, rachas, logros

```
Expresión: Ojos cerrados radiantes, gran sonrisa
Movimiento: Saltos pequeños, rotación 360° total
Color: Brillo intensificado + partículas doradas
Sonido: "Tada" suave
```

```
        ╭─────╮
       ╱  ◠ ◠  ╲     ← Ojos cerrados brilhantes
      │   ∧ ∧   │     ← Gran sonrisa
       ╲   ▽   ╱
        ╰──┬──╯
       ↑  ↑  ↑
    Saltitos
```

#### 3. 🔵 Support (Ayuda/Encouragement)
**Cuándo**: Registro fuera de rango, día difícil

```
Expresión: Ojos grandes y preocupados pero cálidos, sonrisa pequeña reconfortante
Movimiento: Aproximación suave, flotación pausada
Color: Brillo calmante (azulado suave)
Sonido: "Mmm" reconfortante
```

```
        ╭─────╮
       ╱  ◠ ◠  ╲     ← Ojos grandes, comprensivos
      │   • •   │
      │   ───   │     ← Sonrisa pequeña
       ╲   ﹏   ╱
        ╰──┬──╯
      ≈≈≈≈≈≈≈≈
    Ondas suaves (consuelo)
```

#### 4. ⚪ Neutral (Idle)
**Cuándo**: Inactividad, esperando input

```
Expresión: Ojos semi-abiertos, expresión relajada
Movimiento: Flotación muy sutil, casi inmóvil
Color: Brillo base
Sonido: Silencio (solo respiración visual)
```

```
        ╭─────╮
       ╱  ◠ ◠  ╲     ← Ojos medio cerrados
      │   ───   │
       ╲   ─   ╱      ← Boca neutral
        ╰──┬──╯
      ~~~~~~~~~~
    Flotación mínima
```

#### 5. 😴 Sleeping (Inactivo)
**Cuándo**: App en background por tiempo prolongado

```
Expresión: Ojos cerrados con "Zzz" flotando
Movimiento: Ninguno (dormido)
Color: Brillo muy sutil (modo noche)
Sonido: Respiración suave (opcional)
```

```
        ╭─────╮
       ╱  ∧ ∧  ╲     ← Ojos cerrados
      │  ~~~  │      ← Boca dormida
       ╲     ╱
        ╰──┬──╯
           │
      z   Z   z      ← Zzz flotando
```

---

## 🎬 Animaciones

### Transiciones de Estado

| De → A | Duración | Curva | Efecto |
|--------|----------|-------|--------|
| Neutral → Happy | 300ms | ease-out | Bounce pequeño |
| Happy → Celebrate | 500ms | spring | Rotación + partículas |
| Happy → Support | 400ms | ease-in-out | Aproximación |
| Any → Sleeping | 600ms | ease-in-out | Fade + Zzz |
| Sleeping → Happy | 400ms | spring | Despertar animado |

### Animaciones de Entrada

```typescript
const rexEntryAnimations = {
  // Aparece en home
  fadeInScale: {
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
    duration: 400,
    easing: "ease-out",
  },
  
  // Saludo inicial
  greeting: {
    keyframes: [
      { translateY: 0 },
      { translateY: -10 },
      { translateY: 0 },
      { translateY: -5 },
      { translateY: 0 },
    ],
    duration: 1500,
  },
};
```

### Animaciones de Interacción

```typescript
const rexInteractions = {
  // Tocar a Rex
  onPress: {
    scale: [
      { value: 1, duration: 100 },
      { value: 1.1, duration: 150 },
      { value: 1, duration: 150 },
    ],
    triggerFeedback: "medium",
  },
  
  // Rex habla (burbuja de texto)
  speechBubble: {
    opacity: { from: 0, to: 1, duration: 300 },
    translateY: { from: 10, to: 0, duration: 300 },
  },
  
  // Celebración de logro
  celebration: {
    scale: [1, 1.2, 1.1, 1.2, 1],
    rotate: "1full",
    duration: 800,
    spring: { tension: 200, friction: 10 },
  },
};
```

### Partículas de Efecto

```typescript
const particleEffects = {
  celebrate: {
    colors: ["#F59E0B", "#FCD34D", "#A78BFA", "#10B981"],
    count: 12,
    size: [8, 16],
    duration: 2000,
    spread: 100,
  },
  
  levelUp: {
    colors: ["#8B5CF6", "#A78BFA", "#F59E0B"],
    count: 24,
    size: [12, 24],
    duration: 3000,
    spread: 150,
  },
  
  support: {
    colors: ["#3B82F6", "#8B5CF6"],
    count: 6,
    size: [6, 12],
    duration: 1500,
    spread: 50,
    floating: true,  // Flotan hacia arriba
  },
};
```

---

## 🔊 Feedback Auditivo (Opcional)

### Sonidos de Estado

| Evento | Sonido | Volumen | Intensidad |
|--------|--------|---------|------------|
| Saludo inicial | "Hmm hello" suave | 0.3 | Bajo |
| Registro exitoso | "Pop" brillante | 0.4 | Medio |
| Celebración | "Ta-da" suave | 0.5 | Medio |
| Nivel completado | "Fanfare" corto | 0.6 | Alto |
| Fuera de rango | "Mmm" reconfortante | 0.3 | Bajo |
| Racha nueva | "Whoosh" + campana | 0.5 | Medio |
| Inactividad | Suspiro muy sutil | 0.2 | Muy bajo |

### Configuración de Audio

```typescript
const rexAudio = {
  enabled: true,
  volume: {
    master: 0.5,
    music: 0.2,
    sfx: 0.6,
  },
  muteOnFocusLoss: true,
  systemSoundEnabled: true,
};
```

---

## 📈 Evolución Visual por Niveles

### Sistema de Evolución

```typescript
const rexEvolution = {
  level1: {
    name: "Rex Baby",
    size: "small",
    accessories: [],
    unlockCondition: "Inicio",
  },
  
  level5: {
    name: "Rex Junior",
    size: "medium", 
    accessories: ["Pequeña corona"],
    unlockCondition: "5 días consecutivos",
  },
  
  level10: {
    name: "Rex Adult",
    size: "large",
    accessories: ["Corona completa", " capa"],
    unlockCondition: "Nivel 10 alcanzado",
  },
  
  level25: {
    name: "Rex Master",
    size: "xl",
    accessories: ["Corona dorada", "capa", "estrellas"],
    unlockCondition: "25 días consecutivos",
  },
  
  level50: {
    name: "Rex Legend",
    size: "xl",
    accessories: ["Aurora boreal", "partículas legendarias"],
    unlockCondition: "50 días consecutivos",
  },
};
```

### Progresión Visual

```
Nivel 1-4      → Rex pequeño, simplificado
                └── Accesorios: Ninguno

Nivel 5-9      → Rex mediano
                └── Accesorios: Sombrero de fiesta

Nivel 10-24    → Rex adulto, más expresivo
                └── Accesorios: Corona pequeña

Nivel 25-49    → Rex grande con detalles
                └── Accesorios: Corona completa + capa

Nivel 50+      → Rex legendario
                └── Accesorios: Efectos especiales + partículas
```

---

## 💬 Mensajes de Rex

### Por Contexto

```typescript
const rexMessages = {
  // Home - Saludo
  greeting: [
    "¡Hola! ¿Listo para otro día?",
    "Bienvenido de nuevo 👋",
    "¡Qué gusto verte!",
    "Hola, compañero 🐾",
  ],
  
  // Registro exitoso
  success: [
    "¡Genial! ✓",
    "¡Perfecto! 💫",
    "¡Vamos bien! 🎯",
    "¡Otro paso dado! ⭐",
  ],
  
  // Fuera de rango (no alarmista)
  outOfRange: [
    "¡Ups! Vamos a ver... no pasa nada ☺️",
    "¡Hey! Estas cosas pasan. Aprendemos ✨",
    "¡Tranquilo! Un dato más para conocer tu patrón 📊",
    "¡No te preocupes! Cada registro cuenta 💪",
  ],
  
  // Racha
  streak: [
    "¡Imparable! 🔥",
    "¡Estás en racha! ⚡",
    "¡Woo! ¡Vamos! 🚀",
    "¡Increíble consistencia! 🏆",
  ],
  
  // Nivel completado
  levelUp: [
    "¡Wiii! ¡Subiste de nivel! 🎉",
    "¡Felicidades! ¡Eres increíble! 🌟",
    "¡Nivel nuevo! ¡Esto es para ti! 🏅",
    "¡Merecido! ¡Sigue así! 💪",
  ],
  
  // Logro desbloqueado
  achievement: [
    "¡Logro desbloqueado! 🏆",
    "¡Misión cumplida! ✅",
    "¡Eso es! ¡Lo lograste! 🎯",
    "¡ Otro logro en tu colección! ⭐",
  ],
};
```

---

## 🛠️ Implementación Técnica

### Dimensiones Base (Mobile)

```typescript
const rexDimensions = {
  small: {
    width: 60,
    height: 80,
  },
  medium: {
    width: 80,
    height: 110,
  },
  large: {
    width: 120,
    height: 160,
  },
  xl: {
    width: 160,
    height: 220,
  },
};
```

### Props del Componente Rex

```typescript
interface RexProps {
  // Estado emocional
  mood: 'happy' | 'celebrate' | 'support' | 'neutral' | 'sleeping';
  
  // Tamaño
  size: 'small' | 'medium' | 'large' | 'xl';
  
  // Comportamiento
  interactive?: boolean;
  showParticles?: boolean;
  showSpeechBubble?: boolean;
  
  // Speech bubble
  message?: string;
  
  // Acciones
  onPress?: () => void;
  
  // Animación
  animationState?: 'idle' | 'greeting' | 'celebrating';
}
```

---

## 📐 Wireframes de Pantallas

### 1. Home (Dashboard con Rex)

```
┌─────────────────────────────┐
│      9:41           📱🔋    │
├─────────────────────────────┤
│                             │
│     ╭──────────╮            │
│    ╱    🐾      ╲           │  ← Rex (happy)
│    ╲            ╱           │
│     ╰────┬─────╯            │
│          │                  │
│   ┌──────┴──────┐           │
│   │   Hola,     │           │
│   │   Juan! 👋  │           │
│   └─────────────┘           │
│                             │
│   ┌─────────────────────┐   │
│   │  Tu Racha: 7 días   │   │
│   │  🔥🔥🔥🔥🔥🔥🔥      │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │  Glucosa Ayer      │   │
│   │  📊 120 mg/dL      │   │
│   │  ⬆️ 5% vs semana   │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ XP: 245 / 500       │   │
│   │ ████████░░░░░░░     │   │
│   │ Nivel 3  🏅          │   │
│   └─────────────────────┘   │
│                             │
│   ┌────────────────────────┐│
│   │  [+ ] Registrar        ││
│   └────────────────────────┘│
│                             │
│   ┌────────────────────────┐│
│   │    ┌────┐  ┌────┐     ││
│   │    │🏆  │  │👥  │     ││
│   │    └────┘  └────┘     ││
│   └────────────────────────┘│
│                             │
│   ┌────────────────────┐    │
│   │ 🏠    📊    👥    ⚙️ │    │
│   └────────────────────┘    │
└─────────────────────────────┘
```

### 2. Onboarding (4 pasos)

```
PASO 1: BIENVENIDA
┌─────────────────────────────┐
│                             │
│      ╭──────────╮           │
│     ╱    🐾      ╲          │
│     ╲            ╱          │
│      ╰────┬─────╯           │
│           │                  │
│           │ "¡Hola! Soy Rex" │
│           ▼                  │
│   ┌─────────────────────┐   │
│   │  RangeXp te ayuda   │   │
│   │  a construir       │   │
│   │  hábitos saludables │   │
│   │  sin presión ✨     │   │
│   └─────────────────────┘   │
│                             │
│   ┌────────────────────────┐│
│   │    Continuar →        ││
│   └────────────────────────┘│

PASO 2: PHILOSOPHY  
┌─────────────────────────────┐
│    ╭───╮                    │
│    │💡│ "No necesitas       │
│    ╰───╯ días perfectos,    │
│         consistentes."      │
│                             │
│   ┌─────────────────────┐   │
│   │  • Sin reglas rígidas│   │
│   │  • Sin castigos    │   │
│   │  • Solo tú a tu    │   │
│   │    ritmo 💪         │   │
│   └─────────────────────┘   │
│                             │
│   ┌────────────────────────┐│
│   │    Continuar →        ││
│   └────────────────────────┘│

PASO 3: REX INTRO
┌─────────────────────────────┐
│                             │
│      ╭──────────╮           │
│     ╱    🐾      ╲          │
│     │  👀        │          │
│     ╲            ╱          │
│      ╰────┬─────╯           │
│           │                  │
│   ┌─────────────────────┐   │
│   │  Soy Rex, tu       │   │
│   │  compañero. Estoy  │   │
│   │  aquí para apoyarte │   │
│   │  en cada paso 👋    │   │
│   └─────────────────────┘   │
│                             │
│   ┌────────────────────────┐│
│   │    Continuar →        ││
│   └────────────────────────┘│

PASO 4: PERMISOS
┌─────────────────────────────┐
│                             │
│    ┌───────────────────┐    │
│    │  🔔 Notificaciones │   │
│    │  Recordatorios    │   │
│    │  suaves 📳        │   │
│    └───────────────────┘    │
│                             │
│    ┌───────────────────┐    │
│    │  📊 Glucosa       │   │
│    │  Tus números,     │   │
│    │  tu privacidad 🔒 │   │
│    └───────────────────┘    │
│                             │
│   ┌────────────────────────┐│
│   │  Empezar →            ││
│   └────────────────────────┘│
```

### 3. Registro de Glucosa

```
┌─────────────────────────────┐
│  ← Atrás      Registro     │
├─────────────────────────────┤
│                             │
│      ╭──────────╮           │
│     ╱    🐾      ╲          │
│     │  👀        │          │
│     ╲            ╱          │
│      ╰────┬─────╯           │
│           │                  │
│           │ "¡Bien hecho!"   │
│           ▼                  │
│                             │
│   ┌─────────────────────┐   │
│   │                     │   │
│   │       120           │   │  ← Input grande
│   │      mg/dL          │   │
│   │                     │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │  📅 Hoy, 9:41 AM   │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 🟢 En rango ✓       │   │  ← Feedback positivo
│   └─────────────────────┘   │
│                             │
│   ┌────────────────────────┐│
│   │    [+10 XP] Guardar   ││
│   └────────────────────────┘│
│                             │
│   ┌────────────────────┐    │
│   │ ¿Notas? (opcional) │    │
│   │ ┌────────────────┐ │    │
│   │ │                │ │    │
│   │ └────────────────┘ │    │
│   └────────────────────┘    │
└─────────────────────────────┘
```

### 4. Pantalla de Logros

```
┌─────────────────────────────┐
│  ← Atrás      Logros 🏆     │
├─────────────────────────────┤
│                             │
│   ┌─────────────────────┐   │
│   │ Total: 12/30        │   │
│   │ ██████████░░░░░░░░░ │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 🔥 Rachas           │   │
│   ├─────────────────────┤   │
│   │ ┌─────┐ ┌─────┐    │   │
│   │ │7 días│ │30 días│   │   │  ← Medallas
│   │ │ 🔥  │ │ ⚡  │    │   │
│   │ └─────┘ └─────┘    │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 📊 Consistencia     │   │
│   ├─────────────────────┤   │
│   │ ┌─────┐ ┌─────┐    │   │
│   │ │5 días│ │100  │    │   │
│   │ │ 📅  │ │regist│   │   │
│   │ └─────┘ └─────┘    │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 🎯 Especiales       │   │
│   ├─────────────────────┤   │
│   │ ┌─────┐ ┌─────┐    │   │
│   │ │🔵🔵 │ │🟣   │    │   │  ← Logros
│   │ │     │ │     │    │   │     desbloqueados
│   │ │3/5  │ │1/1  │    │   │
│   │ └─────┘ └─────┘    │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 🔒 Bloqueados       │   │
│   │ ┌─────┐ ┌─────┐    │   │
│   │ │  ?  │ │  ?  │    │   │
│   │ │     │ │     │    │   │
│   │ └─────┘ └─────┘    │   │
│   └─────────────────────┘   │
└─────────────────────────────┘
```

### 5. Pantalla Social

```
┌─────────────────────────────┐
│  ← Atrás    Amigos 👥       │
├─────────────────────────────┤
│                             │
│   ┌─────────────────────┐   │
│   │ 🔍 Buscar amigos    │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 👥 Mis Amigos (5)   │   │
│   ├─────────────────────┤   │
│   │ ┌─────────────────┐ │   │
│   │ │ 🐾 Ana        5 │ │   │  ← Amigo online
│   │ │ 🔥 12 días     ✓ │ │   │
│   │ └─────────────────┘ │   │
│   │ ┌─────────────────┐ │   │
│   │ │  Carlos       3 │ │   │
│   │ │ 🔥 3 días      ✓ │ │   │
│   │ └─────────────────┘ │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 📢 Actividad        │   │
│   ├─────────────────────┤   │
│   │ ┌─────────────────┐ │   │
│   │ │ 🐾 Ana registró │ │   │
│   │ │  Glucosa: 115  │ │   │
│   │ │ 💬 "¡Día 13!"  │ │   │
│   │ │ 🕐 hace 2h     │ │   │
│   │ └─────────────────┘ │   │
│   │ ┌─────────────────┐ │   │
│   │ │ 🏆 Carlos       │ │   │
│   │ │ Desbloqueó:    │ │   │
│   │ │ "Rookie"       │ │   │
│   │ │ 🕐 hace 5h     │ │   │
│   │ └─────────────────┘ │   │
│   └─────────────────────┘   │
└─────────────────────────────┘
```
