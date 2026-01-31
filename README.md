# RangeXp - Gamified Diabetes Self-Management App

RangeXp is a mobile application designed to encourage daily self-monitoring in diabetic patients through strong gamification elements, featuring a companion character named Rex.

## 🎯 Core Concept

**"You don't need perfect days. You need consistent ones."**

RangeXp is NOT a medical device. It does NOT calculate insulin doses or provide medical recommendations. Its sole purpose is to motivate patients to track their blood glucose regularly through gamification, rewards, and emotional support via Rex.

## 🧑‍🎤 Rex - The Companion

Rex is the heart of RangeXp:
- Reduces anxiety around glucose tracking
- Reinforces continuity and small wins
- Reframes "bad days" as part of the journey
- Never judges, never punishes, always celebrates progress

## 📱 Features

### MVP (v1.0)
- 📊 Glucose logging (manual entry only - NO medical calculations)
- 🎮 Rex companion with personality and animations
- ⭐ XP system for consistent tracking
- 🏆 Achievements and badges
- 👥 Basic social features (friends, activity feed)
- 📈 Visual statistics and progress tracking
- 🔔 Configurable reminders
- 📚 Scalable educational content (by levels)

### Premium (IAP)
- Additional Rex characters
- Complete educational content
- Advanced statistics
- Unlimited reminders
- Custom objectives

## 🏗️ Architecture

```
rangexp/
├── apps/
│   ├── backend/          # NestJS API
│   ├── web/              # Marketing website (Next.js)
│   └── mobile/           # Expo React Native app
├── packages/
│   ├── config/           # Shared ESLint, Prettier, TSConfig
│   ├── types/            # Shared TypeScript types
│   ├── api-client/       # HTTP client for API
│   ├── theme/            # Design tokens and theme
│   └── utils/            # Shared utilities
└── docker-compose.yml    # PostgreSQL + services
```

## 🛠️ Tech Stack

- **Backend**: NestJS + Prisma + PostgreSQL
- **Mobile**: Expo + React Native + Reanimated
- **Web**: Next.js 14 + Material-UI
- **Monorepo**: pnpm workspaces + Turborepo
- **Auth**: JWT + optional OAuth (Google, Apple)

## 📋 Prerequisites

- Node.js 20.x
- pnpm 9.12.2
- Docker Desktop (for PostgreSQL)

## 🚀 Getting Started

```bash
# Clone and install
git clone <repo-url>
cd rangexp
corepack enable
corepack prepare pnpm@9.12.2 --activate
pnpm install

# Build shared packages
pnpm -r --filter "@rangexp/*" build

# Start database
docker compose up -d db

# Generate Prisma client
pnpm -C apps/backend prisma:generate

# Run migrations
pnpm -C apps/backend prisma:migrate

# Start development
pnpm dev
```

## 🔒 Legal Disclaimer

RangeXp is NOT a medical device. It does NOT:
- Calculate insulin doses
- Provide medical recommendations
- Diagnose conditions
- Replace healthcare professional advice

Always consult your doctor for medical decisions.

## 📄 License

MIT
