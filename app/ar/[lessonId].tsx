import React, { useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLessonStore, LessonProgress } from '@/src/stores/useLessonStore';
import { useGardenStore } from '@/src/stores/useGardenStore';
import { useARSessionStore } from '@/src/stores/useARSessionStore';
import { CameraViewfinder } from '@/src/components/ar/CameraViewfinder';
import { AROverlay } from '@/src/components/ar/AROverlay';
import { IdentifyingLoader } from '@/src/components/ar/IdentifyingLoader';
import { IdentificationError } from '@/src/components/ar/IdentificationError';
import { PlantResultCard } from '@/src/components/ar/PlantResultCard';
import { ObservationPrompt } from '@/src/components/ar/ObservationPrompt';
import { PlantHighlightMarker } from '@/src/components/ar/PlantHighlightMarker';
import { IconButton } from '@/src/components/ui/IconButton';
import { Button } from '@/src/components/ui/Button';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { colors, spacing, borderRadius } from '@/src/theme';

const DEFAULT_PROGRESS: LessonProgress = {
  lessonId: '',
  currentTaskIndex: 0,
  completedTaskIds: [],
  isCompleted: false,
};

export default function ARExperienceScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const lesson = useLessonStore((s) => s.lessons.find((l) => l.id === lessonId));
  const progress = useLessonStore((s) => s.progress[lessonId!] ?? DEFAULT_PROGRESS);
  const advanceTask = useLessonStore((s) => s.advanceTask);
  const completeTask = useLessonStore((s) => s.completeTask);
  const completeLesson = useLessonStore((s) => s.completeLesson);

  const targetPlantId = lesson?.targetPlantId ?? '';
  const plant = useGardenStore((s) => s.plants.find((p) => p.id === targetPlantId));
  const allPlants = useGardenStore((s) => s.plants);
  const entries = useGardenStore((s) => s.entries);
  const addEntry = useGardenStore((s) => s.addEntry);
  const addPlant = useGardenStore((s) => s.addPlant);

  const phase = useARSessionStore((s) => s.phase);
  const identifiedPlant = useARSessionStore((s) => s.identifiedPlant);
  const identificationError = useARSessionStore((s) => s.identificationError);
  const confidenceScore = useARSessionStore((s) => s.confidenceScore);
  const revealedHighlights = useARSessionStore((s) => s.revealedHighlights);
  const userNotes = useARSessionStore((s) => s.userNotes);
  const identifyFromPhoto = useARSessionStore((s) => s.identifyFromPhoto);
  const retryIdentification = useARSessionStore((s) => s.retryIdentification);
  const revealHighlight = useARSessionStore((s) => s.revealHighlight);
  const setUserNotes = useARSessionStore((s) => s.setUserNotes);
  const resetSession = useARSessionStore((s) => s.resetSession);

  // The plant to display: use the identified plant from photo if available, otherwise the lesson's target plant
  const displayPlant = identifiedPlant ?? plant;

  const currentTaskIndex = progress.currentTaskIndex;
  const currentTask = lesson?.tasks[currentTaskIndex] ?? null;
  const totalTasks = lesson?.tasks.length ?? 0;
  const stepProgress = totalTasks > 0 ? (currentTaskIndex + 1) / totalTasks : 0;

  // Track which plants we've already auto-saved in this session to avoid duplicates
  const savedPlantIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    resetSession();
    savedPlantIds.current.clear();
  }, []);

  // Auto-save every identified plant to the garden
  useEffect(() => {
    if (phase !== 'result_shown' || !identifiedPlant || !lesson) return;
    if (savedPlantIds.current.has(identifiedPlant.id)) return;

    savedPlantIds.current.add(identifiedPlant.id);

    // Add dynamic plant to store if new
    if (!allPlants.some((p) => p.id === identifiedPlant.id)) {
      addPlant(identifiedPlant);
    }

    // Add garden entry if not already present
    if (!entries.some((e) => e.plantId === identifiedPlant.id)) {
      addEntry({
        plantId: identifiedPlant.id,
        lessonId: lessonId!,
        photoUri: identifiedPlant.imageUri,
        badges: lesson.badgesAwarded.map((label, i) => ({
          id: `badge-${Date.now()}-${i}`,
          label,
          iconName: 'ribbon-outline',
          color: colors.accent[500],
          earned: true,
        })),
        keyPointsLearned: identifiedPlant.parts.length > 0
          ? identifiedPlant.parts.map((p) => p.learnedFact)
          : [identifiedPlant.funFact],
        personalNotes: '',
        mediaItems: [{ id: `media-${Date.now()}`, type: 'photo' as const, uri: identifiedPlant.imageUri }],
      });
    }
  }, [phase, identifiedPlant]);

  const handleAdvance = useCallback(() => {
    if (currentTask) {
      completeTask(lessonId!, currentTask.id);
    }

    if (currentTaskIndex >= totalTasks - 1) {
      completeLesson(lessonId!);
      router.replace('/(tabs)/garden' as any);
      return;
    }

    advanceTask(lessonId!);
    resetSession();
  }, [currentTask, currentTaskIndex, totalTasks, lessonId]);

  const handlePhotoTaken = useCallback((uri: string) => {
    identifyFromPhoto(uri, allPlants);
  }, [identifyFromPhoto, allPlants]);

  const handleSaveReflection = useCallback(() => {
    if (currentTask) {
      completeTask(lessonId!, currentTask.id);
    }
    completeLesson(lessonId!);
    router.replace('/(tabs)/garden' as any);
  }, [lessonId, currentTask]);

  // Only show the shutter button during the interact task in camera_active phase
  const showShutter = currentTask?.type === 'interact' && phase === 'camera_active';

  if (!lesson || !plant) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.neutral[0] }}>Lesson not found</Text>
      </View>
    );
  }

  const renderTaskContent = () => {
    if (!currentTask) return null;

    switch (currentTask.type) {
      case 'find':
        return (
          <ObservationPrompt
            title={currentTask.title}
            instruction={currentTask.instruction}
            buttonText="I found it!"
            onPress={handleAdvance}
          />
        );

      case 'interact':
        if (phase === 'identifying') {
          return <IdentifyingLoader />;
        }
        if (phase === 'identification_failed') {
          return (
            <IdentificationError
              message={identificationError ?? 'Something went wrong.'}
              onRetry={retryIdentification}
            />
          );
        }
        if (phase === 'result_shown' && displayPlant) {
          return (
            <PlantResultCard
              plant={displayPlant}
              resultText={currentTask.resultText || 'Plant identified!'}
              confidenceScore={confidenceScore}
              autoSaved
              onContinue={handleAdvance}
            />
          );
        }
        return (
          <ObservationPrompt
            title={currentTask.title}
            instruction="Point your camera at a plant and tap the shutter button to identify it."
            buttonText=""
            onPress={undefined}
          />
        );

      case 'observe':
        return (
          <ObservationPrompt
            title={currentTask.observationPrompt || currentTask.title}
            instruction={currentTask.instruction}
            buttonText="Continue"
            onPress={handleAdvance}
          />
        );

      case 'animate': {
        const allRevealed =
          currentTask.highlightAreas?.every((h) => revealedHighlights.includes(h.id)) ?? false;
        return (
          <>
            {currentTask.highlightAreas?.map((area) => (
              <PlantHighlightMarker
                key={area.id}
                label={area.label}
                x={area.x}
                y={area.y}
                color={area.color}
                isRevealed={revealedHighlights.includes(area.id)}
                onPress={() => revealHighlight(area.id)}
              />
            ))}
            <ObservationPrompt
              title={currentTask.title}
              instruction={
                allRevealed
                  ? "Great job! You've explored all the parts."
                  : currentTask.instruction
              }
              buttonText={allRevealed ? 'Continue' : `${revealedHighlights.length}/${currentTask.highlightAreas?.length ?? 0} discovered`}
              onPress={allRevealed ? handleAdvance : undefined}
            />
          </>
        );
      }

      case 'reflect':
        return (
          <View style={[styles.reflectContainer, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.reflectCard}>
              <Text style={styles.reflectTitle}>{currentTask.title}</Text>
              <Text style={styles.reflectInstruction}>{currentTask.instruction}</Text>
              <TextInput
                style={styles.reflectInput}
                multiline
                placeholder="Write your observations here..."
                placeholderTextColor={colors.neutral[400]}
                value={userNotes}
                onChangeText={setUserNotes}
              />
              <Button
                title="Save to Journal"
                onPress={handleSaveReflection}
                variant="primary"
                fullWidth
                icon="journal-outline"
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <CameraViewfinder onPhotoTaken={showShutter ? handlePhotoTaken : undefined}>
      <AROverlay>
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
          <IconButton iconName="close" onPress={() => router.back()} />
          <View style={styles.progressContainer}>
            <Text style={styles.stepText}>
              Step {currentTaskIndex + 1} of {totalTasks}
            </Text>
            <ProgressBar
              progress={stepProgress}
              color={colors.accent[500]}
              height={4}
            />
          </View>
          <View style={{ width: 44 }} />
        </View>

        {renderTaskContent()}
      </AROverlay>
    </CameraViewfinder>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[900],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    zIndex: 10,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: spacing.lg,
  },
  stepText: {
    color: colors.neutral[0],
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  reflectContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  reflectCard: {
    backgroundColor: colors.overlayLight,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  reflectTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary[700],
  },
  reflectInstruction: {
    fontSize: 14,
    color: colors.neutral[600],
    marginTop: spacing.sm,
  },
  reflectInput: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    minHeight: 100,
    fontSize: 15,
    color: colors.neutral[800],
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
});
