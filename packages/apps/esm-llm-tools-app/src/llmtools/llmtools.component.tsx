import React, { useState } from 'react';
import classNames from 'classnames';
import { Button } from '@carbon/react';
import { type AppProps } from 'single-spa';
import LlmToolsPopup from './llmtools-popup.component';
import { useConfig } from '@openmrs/esm-framework';
import styles from './llmtools.styles.scss';

function useShowLlmTools() {
  const config = useConfig();
  return window.spaEnv === 'development' || config.llmTools?.enabled === true;
}

export default function Root(props: AppProps) {
  const showLlmTools = useShowLlmTools();
  return showLlmTools ? <LlmTools {...props} /> : null;
}

function LlmTools(props: AppProps) {
  const [llmToolsOpen, setLlmToolsOpen] = useState(false);
  const [llmToolsButtonVisible, setLlmToolsButtonVisible] = useState(true);

  const toggleLlmTools = () => {
    setLlmToolsButtonVisible(!llmToolsButtonVisible);
    setLlmToolsOpen((llmToolsOpen) => !llmToolsOpen);
  };

  const toggleHidden = (hidden: boolean) => {
    setLlmToolsButtonVisible(hidden);
  };

  return (
    <>
      {llmToolsButtonVisible && (
        <Button
          name="llmtoolsButton"
          className={classNames(styles.llmtoolsTriggerButton)}
          kind="ghost"
          onClick={toggleLlmTools}
          size="md"
          hasIconOnly
        ></Button>
      )}

      {llmToolsOpen && <LlmToolsPopup close={toggleLlmTools} toggleOverridden={toggleHidden} />}
    </>
  );
}
