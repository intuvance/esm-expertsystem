import React, { useState } from 'react';
import classNames from 'classnames';
import { Button } from '@carbon/react';
import { type AppProps } from 'single-spa';
import LlmToolsPopup from './llmtools-popup.component';
import styles from './llmtools.styles.scss';

const showLlmTools = () => window.spaEnv === 'development' || Boolean(localStorage.getItem('openmrs:llmtools'));

export default function Root(props: AppProps) {
  return showLlmTools() ? <LlmTools {...props} /> : null;
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
