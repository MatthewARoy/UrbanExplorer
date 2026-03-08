import { useARSessionStore } from '@/src/stores/useARSessionStore';

// Mock the external service imports
jest.mock('@/src/services/plantnet', () => ({
  identifyPlant: jest.fn(),
}));
jest.mock('@/src/services/wikipedia', () => ({
  fetchPlantSummary: jest.fn(),
}));

beforeEach(() => {
  useARSessionStore.getState().resetSession();
  jest.clearAllMocks();
});

describe('useARSessionStore', () => {
  describe('initial state', () => {
    it('starts in camera_active phase', () => {
      expect(useARSessionStore.getState().phase).toBe('camera_active');
    });

    it('starts with no identified plant', () => {
      const state = useARSessionStore.getState();
      expect(state.identifiedPlantId).toBeNull();
      expect(state.identifiedPlant).toBeNull();
    });

    it('starts with empty highlights', () => {
      expect(useARSessionStore.getState().revealedHighlights).toEqual([]);
    });

    it('starts with empty user inputs', () => {
      const state = useARSessionStore.getState();
      expect(state.userGuess).toBe('');
      expect(state.userNotes).toBe('');
    });
  });

  describe('setPhase', () => {
    it('updates the phase', () => {
      useARSessionStore.getState().setPhase('identifying');
      expect(useARSessionStore.getState().phase).toBe('identifying');
    });
  });

  describe('simulateIdentification', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it('sets phase to identifying immediately', () => {
      useARSessionStore.getState().simulateIdentification('plant-strawberry');
      expect(useARSessionStore.getState().phase).toBe('identifying');
    });

    it('sets phase to result_shown after 2 seconds', () => {
      useARSessionStore.getState().simulateIdentification('plant-strawberry');
      jest.advanceTimersByTime(2000);
      const state = useARSessionStore.getState();
      expect(state.phase).toBe('result_shown');
      expect(state.identifiedPlantId).toBe('plant-strawberry');
    });
  });

  describe('retryIdentification', () => {
    it('resets to camera_active and clears identification state', () => {
      useARSessionStore.setState({
        phase: 'identification_failed',
        identificationError: 'Some error',
        identifiedPlant: null,
        identifiedPlantId: 'plant-test',
        confidenceScore: 0.5,
      });

      useARSessionStore.getState().retryIdentification();
      const state = useARSessionStore.getState();

      expect(state.phase).toBe('camera_active');
      expect(state.identificationError).toBeNull();
      expect(state.identifiedPlant).toBeNull();
      expect(state.identifiedPlantId).toBeNull();
      expect(state.confidenceScore).toBeNull();
    });
  });

  describe('revealHighlight', () => {
    it('adds a marker id to revealed highlights', () => {
      useARSessionStore.getState().revealHighlight('h1');
      expect(useARSessionStore.getState().revealedHighlights).toEqual(['h1']);
    });

    it('does not duplicate marker ids', () => {
      useARSessionStore.getState().revealHighlight('h1');
      useARSessionStore.getState().revealHighlight('h1');
      expect(useARSessionStore.getState().revealedHighlights).toEqual(['h1']);
    });

    it('tracks multiple revealed highlights', () => {
      useARSessionStore.getState().revealHighlight('h1');
      useARSessionStore.getState().revealHighlight('h2');
      useARSessionStore.getState().revealHighlight('h3');
      expect(useARSessionStore.getState().revealedHighlights).toEqual(['h1', 'h2', 'h3']);
    });
  });

  describe('setUserGuess', () => {
    it('sets the user guess', () => {
      useARSessionStore.getState().setUserGuess('sunflower');
      expect(useARSessionStore.getState().userGuess).toBe('sunflower');
    });
  });

  describe('setUserNotes', () => {
    it('sets user notes', () => {
      useARSessionStore.getState().setUserNotes('Interesting plant');
      expect(useARSessionStore.getState().userNotes).toBe('Interesting plant');
    });
  });

  describe('resetSession', () => {
    it('resets all state to initial values', () => {
      // Set some state
      useARSessionStore.setState({
        phase: 'result_shown',
        identifiedPlantId: 'plant-test',
        identifiedPlant: { id: 'plant-test', commonName: 'Test', scientificName: 'Test', imageUri: '', description: '', parts: [], funFact: '' },
        identificationError: 'error',
        confidenceScore: 0.95,
        revealedHighlights: ['h1', 'h2'],
        userGuess: 'guess',
        userNotes: 'notes',
      });

      useARSessionStore.getState().resetSession();
      const state = useARSessionStore.getState();

      expect(state.phase).toBe('camera_active');
      expect(state.identifiedPlantId).toBeNull();
      expect(state.identifiedPlant).toBeNull();
      expect(state.identificationError).toBeNull();
      expect(state.confidenceScore).toBeNull();
      expect(state.revealedHighlights).toEqual([]);
      expect(state.userGuess).toBe('');
      expect(state.userNotes).toBe('');
    });
  });
});
