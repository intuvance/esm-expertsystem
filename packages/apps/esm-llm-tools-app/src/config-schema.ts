import { Type } from '@openmrs/esm-framework';

const configSchema = {
  llmTools: {
    enabled: {
      _type: Type.Boolean,
      _default: false,
      _description: 'Enable LLM Tools UI',
    },
  },
};

export default configSchema;
