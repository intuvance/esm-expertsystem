import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  llmtools: {
    enabled: {
      _type: Type.Boolean,
      _default: true,
      _description: 'Enable the LLM Tools UI',
    },
  },
};
