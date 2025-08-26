import { getAsyncLifecycle } from '@openmrs/esm-framework';

export const importTranslation = () => Promise.resolve();

const options = {
  featureName: 'llmtools',
  moduleName: '@intuvance/esm-expertsystem-app',
};

export const llmtools = getAsyncLifecycle(() => import('./llmtools/llmtools.component'), options);
