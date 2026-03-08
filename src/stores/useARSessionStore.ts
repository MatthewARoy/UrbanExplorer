import { create } from 'zustand';
import { Plant } from '@/src/types';
import { identifyPlant } from '@/src/services/plantnet';
import { fetchPlantSummary } from '@/src/services/wikipedia';

export type ARPhase =
  | 'camera_active'
  | 'identifying'
  | 'result_shown'
  | 'identification_failed'
  | 'observing'
  | 'highlighting'
  | 'detail_view'
  | 'reflecting';

interface ARSessionState {
  phase: ARPhase;
  identifiedPlantId: string | null;
  identifiedPlant: Plant | null;
  identificationError: string | null;
  confidenceScore: number | null;
  revealedHighlights: string[];
  userGuess: string;
  userNotes: string;

  setPhase: (phase: ARPhase) => void;
  simulateIdentification: (plantId: string) => void;
  identifyFromPhoto: (photoUri: string, existingPlants: Plant[]) => void;
  retryIdentification: () => void;
  revealHighlight: (markerId: string) => void;
  setUserGuess: (guess: string) => void;
  setUserNotes: (notes: string) => void;
  resetSession: () => void;
}

export const useARSessionStore = create<ARSessionState>()((set) => ({
  phase: 'camera_active',
  identifiedPlantId: null,
  identifiedPlant: null,
  identificationError: null,
  confidenceScore: null,
  revealedHighlights: [],
  userGuess: '',
  userNotes: '',

  setPhase: (phase) => set({ phase }),

  simulateIdentification: (plantId) => {
    set({ phase: 'identifying' });
    setTimeout(() => {
      set({ phase: 'result_shown', identifiedPlantId: plantId });
    }, 2000);
  },

  identifyFromPhoto: async (photoUri, existingPlants) => {
    set({ phase: 'identifying', identificationError: null });

    try {
      const result = await identifyPlant(photoUri);

      // Check if the identified plant matches an existing mock plant by scientific name
      const normalizedName = result.scientificName.toLowerCase();
      const existingMatch = existingPlants.find(
        (p) => p.scientificName.toLowerCase() === normalizedName
      );

      if (existingMatch) {
        set({
          phase: 'result_shown',
          identifiedPlantId: existingMatch.id,
          identifiedPlant: existingMatch,
          confidenceScore: result.score,
        });
        return;
      }

      // Fetch additional info from Wikipedia
      const wiki = await fetchPlantSummary(result.scientificName, result.commonNames[0]);

      const dynamicPlant: Plant = {
        id: `plant-${Date.now()}`,
        commonName: result.commonNames[0] ?? result.scientificName,
        scientificName: result.scientificName,
        imageUri: result.imageUrl ?? wiki.imageUrl ?? photoUri,
        description: wiki.description,
        parts: [],
        funFact: `This plant belongs to the ${result.family} family (genus ${result.genus}).`,
      };

      set({
        phase: 'result_shown',
        identifiedPlantId: dynamicPlant.id,
        identifiedPlant: dynamicPlant,
        confidenceScore: result.score,
      });
    } catch (error: any) {
      set({
        phase: 'identification_failed',
        identificationError: error.message ?? 'Identification failed. Please try again.',
      });
    }
  },

  retryIdentification: () =>
    set({
      phase: 'camera_active',
      identificationError: null,
      confidenceScore: null,
      identifiedPlant: null,
      identifiedPlantId: null,
    }),

  revealHighlight: (markerId) =>
    set((state) => ({
      revealedHighlights: state.revealedHighlights.includes(markerId)
        ? state.revealedHighlights
        : [...state.revealedHighlights, markerId],
    })),

  setUserGuess: (guess) => set({ userGuess: guess }),
  setUserNotes: (notes) => set({ userNotes: notes }),

  resetSession: () =>
    set({
      phase: 'camera_active',
      identifiedPlantId: null,
      identifiedPlant: null,
      identificationError: null,
      confidenceScore: null,
      revealedHighlights: [],
      userGuess: '',
      userNotes: '',
    }),
}));
