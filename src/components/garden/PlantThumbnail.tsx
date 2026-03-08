import React from 'react';
import { Pressable, Image, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '@/src/theme';

interface PlantThumbnailProps {
  imageUri: string;
  name?: string;
  onPress: () => void;
  size?: number;
}

export function PlantThumbnail({ imageUri, name, onPress, size = 100 }: PlantThumbnailProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { width: size, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Image source={{ uri: imageUri }} style={[styles.image, { width: size, height: size }]} />
      {name != null && (
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary[200],
    backgroundColor: colors.neutral[0],
  },
  image: {
    backgroundColor: colors.neutral[200],
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral[700],
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
});
