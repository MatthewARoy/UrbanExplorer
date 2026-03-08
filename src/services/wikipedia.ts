const API_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary';

interface WikiSummary {
  description: string;
  imageUrl: string | null;
}

export async function fetchPlantSummary(scientificName: string, commonName?: string): Promise<WikiSummary> {
  // Try scientific name first, then common name as fallback
  const namesToTry = [scientificName, ...(commonName ? [commonName] : [])];

  for (const name of namesToTry) {
    try {
      const encoded = encodeURIComponent(name.replace(/ /g, '_'));
      const response = await fetch(`${API_URL}/${encoded}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) continue;

      const data = await response.json();

      if (data.extract) {
        return {
          description: data.extract,
          imageUrl: data.thumbnail?.source ?? data.originalimage?.source ?? null,
        };
      }
    } catch {
      continue;
    }
  }

  return {
    description: `A plant of the species ${scientificName}.`,
    imageUrl: null,
  };
}
