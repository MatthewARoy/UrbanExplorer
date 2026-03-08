import { useLessonStore } from '@/src/stores/useLessonStore';
import { mockLessons } from '@/src/data/mockLessons';

// Reset store state before each test
beforeEach(() => {
  useLessonStore.setState({
    lessons: mockLessons,
    progress: {},
    activeLessonId: null,
  });
});

describe('useLessonStore', () => {
  describe('initial state', () => {
    it('loads lessons from mock data', () => {
      const { lessons } = useLessonStore.getState();
      expect(lessons).toEqual(mockLessons);
    });

    it('starts with empty progress', () => {
      const { progress } = useLessonStore.getState();
      expect(progress).toEqual({});
    });

    it('starts with no active lesson', () => {
      const { activeLessonId } = useLessonStore.getState();
      expect(activeLessonId).toBeNull();
    });
  });

  describe('selectLesson', () => {
    it('sets the active lesson id', () => {
      useLessonStore.getState().selectLesson('lesson-reproduction');
      expect(useLessonStore.getState().activeLessonId).toBe('lesson-reproduction');
    });

    it('can change active lesson', () => {
      useLessonStore.getState().selectLesson('lesson-reproduction');
      useLessonStore.getState().selectLesson('lesson-lifecycles');
      expect(useLessonStore.getState().activeLessonId).toBe('lesson-lifecycles');
    });
  });

  describe('advanceTask', () => {
    it('increments task index from 0 to 1', () => {
      useLessonStore.getState().advanceTask('lesson-reproduction');
      const progress = useLessonStore.getState().progress['lesson-reproduction'];
      expect(progress.currentTaskIndex).toBe(1);
    });

    it('caps at max task index', () => {
      const lesson = mockLessons.find((l) => l.id === 'lesson-reproduction')!;
      const maxIndex = lesson.tasks.length - 1;

      // Advance past the end
      for (let i = 0; i <= maxIndex + 2; i++) {
        useLessonStore.getState().advanceTask('lesson-reproduction');
      }

      const progress = useLessonStore.getState().progress['lesson-reproduction'];
      expect(progress.currentTaskIndex).toBe(maxIndex);
    });

    it('does nothing for non-existent lesson', () => {
      const before = useLessonStore.getState().progress;
      useLessonStore.getState().advanceTask('lesson-does-not-exist');
      expect(useLessonStore.getState().progress).toEqual(before);
    });
  });

  describe('completeTask', () => {
    it('adds task id to completed list', () => {
      useLessonStore.getState().completeTask('lesson-reproduction', 'repr-1');
      const progress = useLessonStore.getState().progress['lesson-reproduction'];
      expect(progress.completedTaskIds).toContain('repr-1');
    });

    it('does not duplicate completed task ids', () => {
      useLessonStore.getState().completeTask('lesson-reproduction', 'repr-1');
      useLessonStore.getState().completeTask('lesson-reproduction', 'repr-1');
      const progress = useLessonStore.getState().progress['lesson-reproduction'];
      expect(progress.completedTaskIds.filter((id) => id === 'repr-1')).toHaveLength(1);
    });

    it('tracks multiple completed tasks', () => {
      useLessonStore.getState().completeTask('lesson-reproduction', 'repr-1');
      useLessonStore.getState().completeTask('lesson-reproduction', 'repr-2');
      const progress = useLessonStore.getState().progress['lesson-reproduction'];
      expect(progress.completedTaskIds).toEqual(['repr-1', 'repr-2']);
    });
  });

  describe('completeLesson', () => {
    it('marks lesson as completed', () => {
      useLessonStore.getState().completeLesson('lesson-reproduction');
      const progress = useLessonStore.getState().progress['lesson-reproduction'];
      expect(progress.isCompleted).toBe(true);
    });
  });

  describe('resetLesson', () => {
    it('resets progress to defaults', () => {
      // Build up some progress
      useLessonStore.getState().advanceTask('lesson-reproduction');
      useLessonStore.getState().completeTask('lesson-reproduction', 'repr-1');
      useLessonStore.getState().completeLesson('lesson-reproduction');

      // Reset
      useLessonStore.getState().resetLesson('lesson-reproduction');
      const progress = useLessonStore.getState().progress['lesson-reproduction'];

      expect(progress.currentTaskIndex).toBe(0);
      expect(progress.completedTaskIds).toEqual([]);
      expect(progress.isCompleted).toBe(false);
      expect(progress.lessonId).toBe('lesson-reproduction');
    });
  });
});
