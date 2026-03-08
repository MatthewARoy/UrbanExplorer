import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button } from '@/src/components/ui/Button';
import { colors, spacing } from '@/src/theme';

interface CameraViewfinderProps {
  children?: React.ReactNode;
  onPhotoTaken?: (uri: string) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800';

export function CameraViewfinder({ children, onPhotoTaken }: CameraViewfinderProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || !onPhotoTaken) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) {
        onPhotoTaken(photo.uri);
      }
    } catch {
      // Camera may not be ready; silently ignore
    }
  }, [onPhotoTaken]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: FALLBACK_IMAGE }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.permissionOverlay}>
          <Button
            title="Enable Camera"
            onPress={requestPermission}
            variant="primary"
            icon="camera-outline"
          />
        </View>
        {children}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      {children}
      {onPhotoTaken && (
        <View style={styles.shutterContainer}>
          <Pressable style={styles.shutterButton} onPress={handleCapture}>
            <View style={styles.shutterInner} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  permissionOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  shutterContainer: {
    position: 'absolute',
    bottom: spacing.xl + 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.neutral[0],
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neutral[0],
  },
});
