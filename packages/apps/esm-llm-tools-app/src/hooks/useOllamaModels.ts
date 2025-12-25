import { useEffect, useState } from 'react';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

interface OllamaApiModel {
  name?: string;
  model?: string;
}

interface OllamaResponse {
  models: OllamaApiModel[];
}

export function useOllamaModels() {
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchModels() {
      setLoading(true);
      setModelError(null);

      try {
        const response = await openmrsFetch<OllamaResponse>(`${restBaseUrl}/expertsystem/models`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const rawModels = response.data?.models ?? [];

        const names = rawModels.map((m) => m.name || m.model).filter(Boolean) as string[];

        if (!cancelled) {
          setModels(names);
        }
      } catch (err: any) {
        console.error('Failed to fetch models', err);

        if (!cancelled) {
          setModels([]);
          setModelError(err.message || 'Failed to load models');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchModels();

    return () => {
      cancelled = true;
    };
  }, []);

  return { models, loading, modelError };
}
