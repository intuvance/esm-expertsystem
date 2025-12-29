import React, { useState } from 'react';
import classNames from 'classnames';
import { Button } from '@carbon/react';
import { type AppProps } from 'single-spa';
import LlmToolsPopup from './llmtools-popup.component';
import styles from './llmtools.styles.scss';

export default function LlmTools(props: AppProps) {
  const [llmToolsOpen, setLlmToolsOpen] = useState(false);
  const [llmToolsButtonVisible, setLlmToolsButtonVisible] = useState(true);

  const toggleLlmTools = () => {
    setLlmToolsButtonVisible(!llmToolsButtonVisible);
    setLlmToolsOpen((open) => !open);
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
        />
      )}

      {llmToolsOpen && <LlmToolsPopup close={toggleLlmTools} toggleOverridden={toggleHidden} />}
    </>
  );
}
