import { PLANTNET_API_KEY } from '@/src/config/api';

export interface PlantIdentificationResult {
  scientificName: string;
  commonNames: string[];
  family: string;
  genus: string;
  score: number;
  gbifId: number | null;
  imageUrl: string | null;
}

const API_URL = 'https://my-api.plantnet.org/v2/identify/all';
const MIN_CONFIDENCE = 0.1;

export async function identifyPlant(photoUri: string): Promise<PlantIdentificationResult> {
  if (PLANTNET_API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error('PlantNet API key not configured. Add your key in src/config/api.ts');
  }

  const formData = new FormData();
  formData.append('images', {
    uri: photoUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as any);
  formData.append('organs', 'auto');

  const url = `${API_URL}?include-related-images=true&no-reject=false&nb-results=1&lang=en&type=kt&api-key=${PLANTNET_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No plant match found. Try taking a clearer photo.');
    }
    throw new Error(`Identification failed (status ${response.status}). Please try again.`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error('No plant match found. Try photographing the plant from a different angle.');
  }

  const best = data.results[0];

  if (best.score < MIN_CONFIDENCE) {
    throw new Error('Confidence too low. Try a clearer photo with good lighting.');
  }

  const species = best.species ?? {};

  return {
    scientificName: species.scientificNameWithoutAuthor ?? species.scientificName ?? 'Unknown',
    commonNames: species.commonNames ?? [],
    family: species.family?.scientificNameWithoutAuthor ?? species.family?.scientificName ?? 'Unknown',
    genus: species.genus?.scientificNameWithoutAuthor ?? species.genus?.scientificName ?? 'Unknown',
    score: best.score,
    gbifId: best.gbif?.id ?? null,
    imageUrl: best.images?.[0]?.url?.m ?? best.images?.[0]?.url?.o ?? null,
  };
}
