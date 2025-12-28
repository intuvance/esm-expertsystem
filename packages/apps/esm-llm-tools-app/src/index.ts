import { getAsyncLifecycle } from '@openmrs/esm-framework';
import configSchema from './config-schema';

export const importTranslation = () => Promise.resolve();

/**
 * Export configSchema so the ESM framework can discover it
 */
export { configSchema };

const options = {
  featureName: 'llmtools',
  moduleName: '@intuvance/esm-llm-tools-app',
};

export const llmtools = getAsyncLifecycle(() => import('./llmtools/llmtools.component'), options);
