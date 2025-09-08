import React from 'react';
import { AILabel, AILabelContent } from '@carbon/react';
import styles from './llmtools-chat.styles.scss';

function LlmToolsAILabel() {
  return (
    <div className={styles.llmttoggletipcontent}>
      <AILabel>
        <AILabelContent className="centered">
          <p className="secondary">
            Query the EMR for population-level health outcomes and patterns of health determinants by typing your
            question(s) in the prompt. e.g. “What percentage of my patients have diabetes?”
          </p>
          <hr />
          <p>
            This AI assistant provides supplemental information only and is not a substitute for professional medical
            judgment. Always verify critical information and consult qualified healthcare professionals before making
            clinical decisions. The system may generate inconsistent or incomplete content - use at your own discretion!
          </p>
        </AILabelContent>
      </AILabel>
    </div>
  );
}

export default LlmToolsAILabel;
