import React, { useCallback } from 'react';
import { FlatList, View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGardenStore } from '@/src/stores/useGardenStore';
import { PlantThumbnail } from '@/src/components/garden/PlantThumbnail';
import { colors, spacing } from '@/src/theme';
import { GardenEntry } from '@/src/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const ITEM_MARGIN = spacing.sm;
const ITEM_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - ITEM_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function GardenScreen() {
  const router = useRouter();
  const entries = useGardenStore((s) => s.entries);
  const plants = useGardenStore((s) => s.plants);

  const getPlantName = useCallback(
    (plantId: string) => plants.find((p) => p.id === plantId)?.commonName ?? 'Unknown',
    [plants]
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.neutral[0]} />
        </View>
        <Ionicons name="home" size={24} color={colors.accent[500]} style={styles.homeIcon} />
      </View>
      <View style={styles.gardenLabel}>
        <Text style={styles.gardenTitle}>My garden</Text>
      </View>
      <Text style={styles.countText}>{entries.length} plants collected</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="leaf-outline" size={64} color={colors.neutral[200]} />
      <Text style={styles.emptyTitle}>Your garden is empty</Text>
      <Text style={styles.emptyText}>
        Start a lesson to discover and collect plants!
      </Text>
    </View>
  );

  const renderItem = useCallback(({ item }: { item: GardenEntry }) => (
    <PlantThumbnail
      imageUri={item.photoUri}
      name={getPlantName(item.plantId)}
      size={ITEM_SIZE}
      onPress={() => router.push(`/(tabs)/garden/${item.plantId}` as any)}
    />
  ), [getPlantName]);

  const keyExtractor = useCallback((item: GardenEntry) => item.id, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        columnWrapperStyle={entries.length > 0 ? styles.row : undefined}
        renderItem={renderItem}
        removeClippedSubviews
        maxToRenderPerBatch={15}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[50],
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIcon: {
    marginLeft: spacing.sm,
  },
  gardenLabel: {
    backgroundColor: colors.accent[100],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  gardenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent[700],
  },
  countText: {
    fontSize: 13,
    color: colors.neutral[400],
    marginTop: spacing.sm,
  },
  row: {
    gap: ITEM_MARGIN,
    marginBottom: ITEM_MARGIN,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[600],
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
