# UrbanExplorer

A nature education app that uses AR-guided lessons to teach plant biology outdoors. Users explore real plants through interactive camera experiences, identify species, learn about plant parts and processes, and build a personal nature journal.

## Features

- **Guided Lessons** — Structured lessons on plant reproduction, life cycles, and photosynthesis with step-by-step outdoor tasks
- **AR Camera Experience** — Point your camera at plants to identify them, highlight parts (stomata, roots, flowers), and follow interactive prompts
- **My Garden** — Collect plants you've discovered into a personal garden with photos, earned badges, and key points learned
- **Nature Journal** — Record observations and reflections after each lesson
- **Progress Tracking** — Track lesson completion, badges earned, and plants collected

## Screenshots

### Landing Page
![Landing Page](urban%20explorer%20landing%20page%20prototype.png)

### AR Experience & My Garden
![AR Experience and My Garden](urban%20explorer%20basic%20prototype.png)

## Tech Stack

- **React Native** with **Expo SDK** (Expo Router for file-based navigation)
- **TypeScript**
- **Zustand** for state management (persisted with AsyncStorage)
- **expo-camera** for AR camera view
- **react-native-reanimated** for animations
- **react-native-svg** for custom graphics

## Project Structure

```
app/                          Routes (Expo Router)
  index.tsx                   Landing page (Notice/Wonder/Observe)
  (tabs)/lessons/             Lesson list + detail screens
  (tabs)/garden/              Garden grid + plant detail screens
  (tabs)/profile/             Profile with stats
  ar/[lessonId].tsx           Full-screen AR camera experience

src/
  components/ui/              Button, Card, Badge, ProgressBar, IconButton
  components/ar/              CameraViewfinder, AROverlay, IdentifyingLoader,
                              PlantResultCard, ObservationPrompt, PlantHighlightMarker
  components/lessons/         LessonCard, TaskStep
  components/garden/          PlantThumbnail, BadgeGrid, MediaRow
  stores/                     Zustand stores (lessons, garden, AR session)
  data/                       Mock data (6 plants, 3 lessons, 3 garden entries)
  types/                      TypeScript type definitions
  theme/                      Colors, typography, spacing tokens
```

## Getting Started

### Prerequisites

- Node.js 20+
- Expo Go app on your phone (or an Android/iOS emulator)

### Install & Run

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS) to open on your device.

## User Flow

1. **Landing Page** — Welcome screen with three core pillars: Notice, Wonder, Observe
2. **Select a Lesson** — Browse lessons by topic, see progress and difficulty
3. **Lesson Focus Card** — Review the learning objective and task checklist
4. **AR Experience** — Camera-based multi-step flow:
   - Find a plant outdoors
   - Guess the plant type → simulated identification
   - Observe closely → guided prompts
   - Tap highlighted plant parts to learn
   - Reflect and save to journal
5. **My Garden** — View collected plants, badges, and key points learned
6. **Profile** — See overall progress and stats

## Current Status

This is a **functional prototype** with simulated plant identification (mock data, no real ML/AI). The AR camera shows a live feed with overlay UI — identification results come from pre-built lesson data after a simulated delay.

## License

MIT
