import React from 'react';
import { IconButton } from '@carbon/react';
import { CloseIcon, getCoreTranslation } from '@openmrs/esm-framework';
import styles from './llmtools-popup.styles.scss';
import ExpertSystemChat from './expert-system-chat.component';

type LlmToolsPopupProps = {
  close(): void;
  toggleOverridden(isOverridden: boolean): void;
};

function LlmToolsPopup(props: LlmToolsPopupProps) {
  return (
    <div className={styles.popup}>
      <ExpertSystemChat />
      <div className={styles.farRight}>
        <IconButton kind="ghost" label={getCoreTranslation('close')} onClick={props.close} size="sm">
          <CloseIcon size={16} />
        </IconButton>
      </div>
    </div>
  );
}

export default LlmToolsPopup;
