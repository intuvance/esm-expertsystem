import React from 'react';
import { type AppProps } from 'single-spa';
import { useConfig } from '@openmrs/esm-framework';
import LlmTools from './llmtools/llmtools.component';

function useShowLlmTools() {
  const config = useConfig();
  return config?.llmtools?.enabled ?? false;
}

export default function Root(props: AppProps) {
  const showLlmTools = useShowLlmTools();
  return showLlmTools ? <LlmTools {...props} /> : null;
}
