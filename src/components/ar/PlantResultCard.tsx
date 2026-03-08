import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/src/components/ui/Button';
import { colors, spacing, borderRadius } from '@/src/theme';
import { Plant } from '@/src/types';

interface PlantResultCardProps {
  plant: Plant;
  resultText: string;
  confidenceScore?: number | null;
  autoSaved?: boolean;
  onAddToGarden?: () => void;
  onContinue: () => void;
}

export function PlantResultCard({
  plant,
  resultText,
  confidenceScore,
  autoSaved,
  onAddToGarden,
  onContinue,
}: PlantResultCardProps) {
  const translateY = useSharedValue(300);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.card}>
        <View style={styles.handle} />
        <Image source={{ uri: plant.imageUri }} style={styles.image} />
        <View style={styles.info}>
          <View style={styles.resultRow}>
            <Text style={styles.resultText}>{resultText}</Text>
            {confidenceScore != null && (
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {Math.round(confidenceScore * 100)}% match
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.plantName}>{plant.commonName}</Text>
          <Text style={styles.scientificName}>{plant.scientificName}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {plant.description}
          </Text>
        </View>
        {autoSaved ? (
          <>
            <View style={styles.savedRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.savedText}>Saved to your garden</Text>
            </View>
            <View style={styles.buttons}>
              <Button title="Continue" onPress={onContinue} variant="primary" icon="arrow-forward-outline" />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.prompt}>Do you want to add this plant to your garden?</Text>
            <View style={styles.buttons}>
              <Button title="Add to Garden" onPress={onAddToGarden!} variant="primary" icon="add-circle-outline" />
              <Button title="Continue" onPress={onContinue} variant="ghost" />
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[200],
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[200],
  },
  info: {
    marginTop: spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  confidenceBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary[700],
  },
  plantName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary[700],
    marginTop: spacing.xs,
  },
  scientificName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.neutral[400],
  },
  description: {
    fontSize: 14,
    color: colors.neutral[600],
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  savedText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.success,
  },
  prompt: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent[500],
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
