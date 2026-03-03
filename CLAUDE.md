# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
npx expo start                # Start dev server (scan QR with Expo Go)
npx expo lint                 # Run ESLint (flat config, eslint-config-expo)
npm run build:android         # EAS cloud build → APK (preview profile)
npm run build:ios             # EAS cloud build → IPA (preview profile)
```

No test framework is configured. No custom babel or metro config — uses Expo defaults.

## Architecture

React Native app built with **Expo SDK ~54**, **React 19**, **TypeScript (strict)**, and **Expo Router v6** for file-based routing.

### Routing

- `app/index.tsx` — Landing page (full-screen, outside tabs)
- `app/(tabs)/` — Tab navigator with nested Stacks for `lessons/`, `garden/`, `profile/`
- `app/ar/[lessonId].tsx` — Full-screen AR camera experience (presented as `fullScreenModal`)
- The "Home" tab button is a custom FAB that calls `router.replace('/')` — its screen (`home/index.tsx`) is a dead redirect
- Route files use **default exports** (required by Expo Router); all other modules use **named exports**

### State Management (Zustand)

Three stores in `src/stores/`:
- **`useLessonStore`** — Lesson list + per-lesson progress. Progress persisted via AsyncStorage (key: `lesson-storage`). Also exports `LessonProgress` type.
- **`useGardenStore`** — Collected plants + garden entries. Entries persisted (key: `garden-storage`).
- **`useARSessionStore`** — Ephemeral AR session state (phase, identified plant, highlights). Exports `ARPhase` type. Not persisted.

Convention: always use individual slice selectors `(s) => s.field` rather than selecting the full store.

### AR Experience Flow

The AR screen steps through tasks in order: `find` → `interact` → `observe` → `animate` → `reflect`. Each task type renders different AR components. Plant identification is simulated with a 2-second timeout (no real ML). The `interact` step and final `reflect` step both navigate to the garden tab.

### Data Layer

All data is static mock data in `src/data/` (6 plants, 3 lessons, 3 garden entries). Lesson `targetPlantId` links to a plant. IDs use string prefixes: `plant-*`, `lesson-*`, `entry-*`. Dynamic entries use `Date.now()` suffix.

## Key Conventions

- **Path alias:** `@/*` maps to repo root — imports use `@/src/components/...`, `@/src/theme`, etc.
- **Styling:** `StyleSheet.create` at the bottom of every file. No CSS-in-JS or Tailwind.
- **Design tokens:** `src/theme/` exports `colors`, `spacing`, `borderRadius`. Import from `@/src/theme`.
- **Icons:** `Ionicons` from `@expo/vector-icons` exclusively.
- **Animations:** `react-native-reanimated` only (no core `Animated` API).
- **Touch targets:** `Pressable` throughout (not `TouchableOpacity`).
- **Light mode only** — `userInterfaceStyle: "light"` in app.json. The `hooks/use-theme-color.ts` and `constants/theme.ts` are unused Expo scaffolding.
- **New Architecture** and **React Compiler** experiments are enabled.
