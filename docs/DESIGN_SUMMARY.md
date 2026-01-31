# RangeXp - Resumen de Decisiones de Diseño

## 🎯 Filosofía Core

**"Calm Technology"** - La app debe reducir ansiedad, no aumentarla.

### Decisión Principal: Sin Rojo Alarmista
- ❌ Nunca usamos rojo para glucosa fuera de rango
- ✅ Amarillo/Naranja suave para "presta atención"
- ✅ Verde cálido para "en rango"
- ✅ Rex siempre responde con apoyo, nunca juzga

---

## 🎨 Sistema de Colores

### Rex Brand
- **Primary**: `#7C3AED` (Púrpura cálido)
- **Rex Body**: `#8B5CF6` (Púrpura suave)
- **Glow**: `#A78BFA` (Halo brillante)

### Estados de Glucosa (No alarmista)
| Estado | Color | Mensaje |
|--------|-------|---------|
| Bajo | `#FCD34D` | Amarillo suave → "Presta atención" |
| Normal | `#10B981` | Verde esmeralda → "En rango" |
| Alto | `#F59E0B` | Naranja cálido → "Nota esto" |

### Gamificación
- **XP**: `#F59E0B` (Dorado)
- **Racha**: `#F97316` (Naranja cálido, NO rojo)
- **Logros**: Colores por rareza (común → legendario)

---

## 🐾 Rex - El Companion

### Personalidad
- **Nunca juzga**: "Ups, veamos qué pasó" > "Fallaste"
- **Celebra lo pequeño**: Cada registro = victoria
- **Tono**: Cálido, ligeramente juguetón, nunca sarcástico

### 5 Estados de Ánimo
| Estado | Contexto | Expresión |
|--------|----------|-----------|
| 🟢 Happy | Pantalla principal | Ojos cerrados, sonrisa suave |
| 🟡 Celebrate | Logros/nivel | Ojos radiantes, gran sonrisa |
| 🔵 Support | Fuera de rango | Ojos grandes, apoyo |
| ⚪ Neutral | Inactividad | Relajado |
| 😴 Sleeping | App inactiva | Ojos cerrados + Zzz |

### Evolución Visual
- **Nivel 1-4**: Rex Baby (pequeño, simple)
- **Nivel 5-9**: Rex Junior (mediano, sombrero fiesta)
- **Nivel 10-24**: Rex Adult (expresivo, corona pequeña)
- **Nivel 25-49**: Rex Master (detalles, capa)
- **Nivel 50+**: Rex Legend (efectos especiales)

---

## 📱 Pantallas Clave

### Home Dashboard
- Rex visible y animado (happy por defecto)
- Racha prominentemente visible (🔥 icon)
- XP progress bar visible
- Registro de glucosa: botón CTA claro
- Footer navegación: Home 📊 Amigos ⚙️

### Onboarding (4 pasos)
1. **Bienvenida**: Rex se presenta
2. **Philosophy**: "Días consistentes, no perfectos"
3. **Rex Intro**: Personalidad y valores
4. **Permisos**: Notificaciones + privacidad

### Registro de Glucose
- Input grande y claro (JetBrains Mono)
- Feedback inmediato: estado + mensaje de Rex
- Sin alarmismo: colores suaves
- +10 XP automático

### Logros
- Grid de badges con rareza visual
- Progreso visible para bloqueados
- Rachas en sección prominente
- Rex celebra desbloqueos

### Social
- Friends list con status (online/última vez)
- Activity feed con reacciones
- Sin competencia directa (apoyo mutuo)
- Privacidad: solo lo que el usuario comparte

---

## 🔧 Componentes Entregados

### 1. Button
- Variantes: primary, secondary, ghost, success
- Tamaños: small, medium, large
- Estados: loading, disabled
- Sombras suaves (no heavy shadows)

### 2. RexComponent
- Props: mood, size, interactive, message, onPress
- Animaciones: bounce, pulse, spin, float
- Speech bubble opcional
- Glow effect configurable

### 3. AchievementBadge
- Rarezas: common, rare, epic, legendary
- Progreso visible para bloqueados
- Iconos emoji + nombre
- Colores por rareza

### 4. XpProgressBar
- Level badge circular
- Progress bar animado
- Details opcionales (XP actual/remaining)
- Colores dorados

### 5. GlucoseCard
- Sin alarmismo visual
- Border-left colored por estado
- Rex reaction integrado
- Trend indicator

### 6. ActivityFeedItem
- Avatar + nombre + contenido
- Likes y comments
- Icono de tipo (glucose/achievement/streak)
- Accesible y touchable

---

## 📐 Principios de Diseño Aplicados

### 1. Calm Tech
- ✅ Sin rojo puro para alertas
- ✅ Sonidos opcionales y suaves
- ✅ Animaciones fluidas, no erráticas
- ✅ Rex como calmante visual

### 2. Warm & Playful
- ✅ Bordes redondeados (8-24px)
- ✅ Gradientes sutiles
- ✅ Micro-interacciones positivas
- ✅ Lenguaje amigable en mensajes

### 3. Micro-interacciones
- ✅ Feedback visual en cada acción
- ✅ Rex reacciona a interacciones
- ✅ Partículas en celebraciones
- ✅ Transiciones suaves entre estados

### 4. Progress Visible
- ✅ XP bar siempre visible
- ✅ Rachas prominentes
- ✅ Logros con progreso
- ✅ Evolución de Rex

### 5. Rex Central
- ✅ Rex en Home
- ✅ Rex en registro
- ✅ Rex en logros
- ✅ Rex en errores (reencuadre)

---

## 🚀 Próximos Pasos Recomendados

### Para Mobile Dev
1. Implementar `packages/theme/src/components.ts`
2. Configurar Reanimated para animaciones de Rex
3. Crear assets de Rex (SVG/Lottie)
4. Integrar sonidos opcionales

### Para Backend
1. Sistema de XP y niveles definido
2. Tipos de logros con rareza
3. Actividad feed estructurada
4. Amigos y privacidad

### Para QA
1. Verificar contraste mínimo 4.5:1
2. Testear daltonismo (colores alternativos)
3. Validar animaciones en devices lentos
4. Accesibilidad con VoiceOver

---

## 📁 Archivos Generados

| Archivo | Propósito |
|---------|-----------|
| `docs/DESIGN.md` | Design system completo |
| `docs/REX_DESIGN.md` | Rex character specs + wireframes |
| `packages/theme/src/components.ts` | Componentes base |

---

## 💡 Notas para el Equipo

1. **Colores**: Usar los tokens de `theme.colors` para consistencia
2. **Rex**: Nunca usar Rex para castigar o alertar negativamente
3. **Accesibilidad**: Todo componente debe pasar WCAG 2.1 AA
4. **Rendimiento**: Animaciones de Rex deben ser performantes (useNativeDriver)
5. **i18n**: Mensajes de Rex deben ser localizables

---

*Diseñado con ❤️ por el UX/UI Designer*
