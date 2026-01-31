# Rangexp - Documentación del Proyecto

## Agentes de Desarrollo

### 🏗️ Arquitecto (Session: `architect`)
- Define estructura general del monorepo
- Patrones de arquitectura (Clean Architecture, DDD lite)
- Decisiones técnicas fundamentales
- Configuración inicial de cada app

### 🎨 UX/UI & Rex Designer (Session: `rex-designer`)
- Diseño visual de Rex y animaciones
- Sistema de diseño (colores, tipografía, componentes)
- Animaciones con Framer Motion / Reanimated
- Experiencia de onboarding de Rex

### 🔧 Backend Engineer (Session: `backend-dev`)
- API NestJS con Prisma
- Sistema de XP, logros, rachas
- Red social básica (amigos, actividad)
- Auth JWT + OAuth

### 📱 Mobile Developer (Session: `mobile-dev`)
- Expo + React Native
- Integración de Rex (animaciones)
- Pantallas principales (home, logging, perfil)
- Notificaciones push

### 🧪 QA Engineer (Session: `qa-dev`)
- Tests unitarios y de integración
- Validación de UX
- Checklist de release

---

## 🚀 Flujo de Trabajo

1. **Arquitecto** define estructura → genera tasks para otros agentes
2. **Backend** construye API → **Mobile** consume endpoints
3. **UX/UI** diseña → **Mobile** implementa
4. **QA** valida → Merge a main

## 📦 Packages Compartidos

| Package | Propósito |
|---------|-----------|
| `config` | ESLint, Prettier, TSConfig |
| `types` | Interfaces TypeScript compartidas |
| `api-client` | Cliente HTTP (openapi-fetch) |
| `theme` | Tokens de diseño, tema oscuro/claro |
| `utils` | Funciones utilitarias |

## 🔑 Consideraciones Legales

- **SIN cálculos médicos** - Solo registro
- **SIN recomendaciones** - Solo visualización
- Disclaimer claro en onboarding y términos
- Cumplimiento GDPR/ANMAT (data mínima necesaria)
