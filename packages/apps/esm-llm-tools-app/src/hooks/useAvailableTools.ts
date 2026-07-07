import { useEffect, useState } from 'react';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export interface ToolSpec {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string }>;
  required?: string[];
}

interface ToolsApiResponse {
  tools: ToolSpec[];
}

const FALLBACK_TOOLS: ToolSpec[] = [
  {
    name: 'queryVisits',
    description: 'Queries visit data aggregated for population-level analysis',
    parameters: {
      dateRange: { type: 'string', description: 'Date range for visits, e.g., "last month"' },
      visitType: { type: 'string', description: 'Type of visit' },
      cohort: { type: 'string', description: 'Patient cohort filter' },
    },
    required: ['dateRange', 'visitType', 'cohort'],
  },
  {
    name: 'aggregateDiagnoses',
    description: 'Aggregates and analyzes diagnosis data from encounters',
    parameters: {
      diagnosis: { type: 'string', description: 'Diagnosis code or name' },
      period: { type: 'string', description: 'Time period' },
      cohort: { type: 'string', description: 'Cohort' },
    },
    required: ['diagnosis', 'period', 'cohort'],
  },
];

export function useAvailableTools() {
  const [tools, setTools] = useState<ToolSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTools() {
      setLoading(true);
      setError(null);

      try {
        const response = await openmrsFetch<ToolsApiResponse>(`${restBaseUrl}/expertsystem/tools`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const fetched = response.data?.tools ?? [];

        if (!cancelled) {
          setTools(fetched.length > 0 ? fetched : FALLBACK_TOOLS);
        }
      } catch (err: any) {
        console.warn('Falling back to built-in tools:', err.message);
        if (!cancelled) {
          setTools(FALLBACK_TOOLS);
          setError(err.message || 'Failed to load tools');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTools();

    return () => {
      cancelled = true;
    };
  }, []);

  return { tools, loading, error };
}
