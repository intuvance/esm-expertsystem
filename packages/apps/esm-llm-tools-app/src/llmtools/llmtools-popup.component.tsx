import React from 'react';
import { IconButton } from '@carbon/react';
import { CloseIcon, getCoreTranslation } from '@openmrs/esm-framework';
import styles from './llmtools-popup.styles.scss';
import LlmToolsChat from './llmtools-chat-component';

type LlmToolsPopupProps = {
  close(): void;
  toggleOverridden(isOverridden: boolean): void;
};

function LlmToolsPopup(props: LlmToolsPopupProps) {
  return (
    <div className={styles.popup}>
      <LlmToolsChat />
      <div className={styles.farRight}>
        <IconButton kind="ghost" label={getCoreTranslation('close')} onClick={props.close} size="sm">
          <CloseIcon size={16} />
        </IconButton>
      </div>
    </div>
  );
}

export default LlmToolsPopup;
