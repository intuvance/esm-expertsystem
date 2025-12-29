import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

export const importTranslation = () => Promise.resolve();

const moduleName = '@intuvance/esm-llm-tools-app';
const featureName = 'llmtools';

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(() => import('./root.component'), {
  moduleName,
  featureName,
});
