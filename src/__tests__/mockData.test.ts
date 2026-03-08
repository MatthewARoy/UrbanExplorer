import { mockPlants } from '@/src/data/mockPlants';
import { mockLessons } from '@/src/data/mockLessons';
import { mockGardenEntries } from '@/src/data/mockGarden';

describe('mockPlants', () => {
  it('contains 6 plants', () => {
    expect(mockPlants).toHaveLength(6);
  });

  it('all plants have unique ids with plant- prefix', () => {
    const ids = mockPlants.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^plant-/));
  });

  it('all plants have required fields', () => {
    mockPlants.forEach((plant) => {
      expect(plant.commonName).toBeTruthy();
      expect(plant.scientificName).toBeTruthy();
      expect(plant.imageUri).toBeTruthy();
      expect(plant.description).toBeTruthy();
      expect(plant.parts.length).toBeGreaterThan(0);
      expect(plant.funFact).toBeTruthy();
    });
  });

  it('all plant parts have unique ids within each plant', () => {
    mockPlants.forEach((plant) => {
      const partIds = plant.parts.map((p) => p.id);
      expect(new Set(partIds).size).toBe(partIds.length);
    });
  });
});

describe('mockLessons', () => {
  it('contains 4 lessons', () => {
    expect(mockLessons).toHaveLength(4);
  });

  it('all lessons have unique ids with lesson- prefix', () => {
    const ids = mockLessons.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^lesson-/));
  });

  it('all lessons reference valid plant ids', () => {
    const plantIds = mockPlants.map((p) => p.id);
    mockLessons.forEach((lesson) => {
      expect(plantIds).toContain(lesson.targetPlantId);
    });
  });

  it('all lessons have at least one task', () => {
    mockLessons.forEach((lesson) => {
      expect(lesson.tasks.length).toBeGreaterThan(0);
    });
  });

  it('all lesson tasks have unique ids within each lesson', () => {
    mockLessons.forEach((lesson) => {
      const taskIds = lesson.tasks.map((t) => t.id);
      expect(new Set(taskIds).size).toBe(taskIds.length);
    });
  });

  it('all lesson tasks are ordered sequentially', () => {
    mockLessons.forEach((lesson) => {
      lesson.tasks.forEach((task, i) => {
        expect(task.order).toBe(i + 1);
      });
    });
  });

  it('all lessons have valid difficulty levels', () => {
    mockLessons.forEach((lesson) => {
      expect(['beginner', 'intermediate', 'advanced']).toContain(lesson.difficulty);
    });
  });
});

describe('mockGardenEntries', () => {
  it('contains 3 entries', () => {
    expect(mockGardenEntries).toHaveLength(3);
  });

  it('all entries have unique ids with entry- prefix', () => {
    const ids = mockGardenEntries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^entry-/));
  });

  it('all entries reference valid plant ids', () => {
    const plantIds = mockPlants.map((p) => p.id);
    mockGardenEntries.forEach((entry) => {
      expect(plantIds).toContain(entry.plantId);
    });
  });

  it('all entries reference valid lesson ids', () => {
    const lessonIds = mockLessons.map((l) => l.id);
    mockGardenEntries.forEach((entry) => {
      expect(lessonIds).toContain(entry.lessonId);
    });
  });

  it('all entries have valid ISO date strings', () => {
    mockGardenEntries.forEach((entry) => {
      const parsed = new Date(entry.collectedAt);
      expect(parsed.getTime()).not.toBeNaN();
    });
  });
});
