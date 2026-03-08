import { useGardenStore } from '@/src/stores/useGardenStore';
import { mockGardenEntries } from '@/src/data/mockGarden';
import { mockPlants } from '@/src/data/mockPlants';
import type { Plant } from '@/src/types';

// Reset store state before each test
beforeEach(() => {
  useGardenStore.setState({
    entries: [...mockGardenEntries],
    plants: [...mockPlants],
  });
});

describe('useGardenStore', () => {
  describe('initial state', () => {
    it('loads entries from mock data', () => {
      const { entries } = useGardenStore.getState();
      expect(entries).toHaveLength(mockGardenEntries.length);
    });

    it('loads plants from mock data', () => {
      const { plants } = useGardenStore.getState();
      expect(plants).toHaveLength(mockPlants.length);
    });
  });

  describe('addEntry', () => {
    it('adds an entry with auto-generated id and timestamp', () => {
      const before = useGardenStore.getState().entries.length;

      useGardenStore.getState().addEntry({
        plantId: 'plant-rose',
        lessonId: 'lesson-reproduction',
        photoUri: 'https://example.com/photo.jpg',
        badges: [],
        keyPointsLearned: ['Roses have thorns'],
        personalNotes: 'Beautiful rose',
        mediaItems: [],
      });

      const { entries } = useGardenStore.getState();
      expect(entries).toHaveLength(before + 1);

      const newEntry = entries[entries.length - 1];
      expect(newEntry.id).toMatch(/^entry-\d+$/);
      expect(newEntry.collectedAt).toBeTruthy();
      expect(newEntry.plantId).toBe('plant-rose');
    });
  });

  describe('addPlant', () => {
    it('adds a new plant', () => {
      const newPlant: Plant = {
        id: 'plant-new',
        commonName: 'Test Plant',
        scientificName: 'Testus plantus',
        imageUri: 'https://example.com/test.jpg',
        description: 'A test plant',
        parts: [],
        funFact: 'This is a test',
      };

      useGardenStore.getState().addPlant(newPlant);
      const { plants } = useGardenStore.getState();
      expect(plants.find((p) => p.id === 'plant-new')).toEqual(newPlant);
    });

    it('does not duplicate existing plants', () => {
      const existingPlant = mockPlants[0];
      const before = useGardenStore.getState().plants.length;

      useGardenStore.getState().addPlant(existingPlant);
      expect(useGardenStore.getState().plants).toHaveLength(before);
    });
  });

  describe('removeEntry', () => {
    it('removes an entry by id', () => {
      const before = useGardenStore.getState().entries.length;
      useGardenStore.getState().removeEntry('entry-1');

      const { entries } = useGardenStore.getState();
      expect(entries).toHaveLength(before - 1);
      expect(entries.find((e) => e.id === 'entry-1')).toBeUndefined();
    });

    it('does nothing when entry id does not exist', () => {
      const before = useGardenStore.getState().entries.length;
      useGardenStore.getState().removeEntry('entry-nonexistent');
      expect(useGardenStore.getState().entries).toHaveLength(before);
    });
  });

  describe('updateNotes', () => {
    it('updates personal notes for an entry', () => {
      useGardenStore.getState().updateNotes('entry-1', 'Updated notes');
      const entry = useGardenStore.getState().entries.find((e) => e.id === 'entry-1');
      expect(entry?.personalNotes).toBe('Updated notes');
    });

    it('does not affect other entries', () => {
      useGardenStore.getState().updateNotes('entry-1', 'Updated notes');
      const entry2 = useGardenStore.getState().entries.find((e) => e.id === 'entry-2');
      expect(entry2?.personalNotes).toBe('Found a patch of daisies in the park. They really do close at night!');
    });
  });
});
