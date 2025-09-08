import React, { useState } from 'react';
import {
  Button,
  CodeSnippet,
  Modal,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
} from '@carbon/react';
import LlmToolsAILabel from './llmtools-label.component';
import LlmToolsAIPrompt from './llmtools-prompt-component';
import classNames from 'classnames';
import styles from './llmtools-chat.styles.scss';

function LlmToolsChat() {
  const [termsStatus, setTermsStatus] = useState<'inactive' | 'active' | 'finished' | 'error'>('inactive');
  const [privacyStatus, setPrivacyStatus] = useState<'inactive' | 'active' | 'finished' | 'error'>('inactive');
  const [acceptLlmToolsTerms, setLacceptLlmToolsTerms] = useState(false);
  const [acceptLlmToolsPrivacy, setAcceptLlmToolsPrivacy] = useState(false);
  const [termsDescription, setTermsDescription] = useState('Accepting terms of use...');
  const [privacyDescription, setPrivacyDescription] = useState('Accepting privacy policy...');
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);

  const fakePromise = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  };

  const handleAcceptLlmToolsTerms = async () => {
    setLacceptLlmToolsTerms(!acceptLlmToolsTerms);
    setTermsStatus('active');
    await fakePromise();
    setTermsDescription('Accepted terms of use!');
    setTermsStatus('finished');
  };

  const handleAcceptLlmToolsPrivacyPolicy = async () => {
    setAcceptLlmToolsPrivacy(!acceptLlmToolsPrivacy);
    setPrivacyStatus('active');
    await fakePromise();
    setPrivacyDescription('Accepted privacy policy!');
    setPrivacyStatus('finished');
  };

  return (
    <div className={styles.llmtscrollablelistcontainer}>
      <StructuredListWrapper>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>
              <LlmToolsAILabel />
            </StructuredListCell>
            <StructuredListCell head className={classNames(styles.llmtpromptleftheader)}>
              Prompt
            </StructuredListCell>
            <StructuredListCell head className={classNames(styles.llmtpromptrightheader)}>
              Output
            </StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          <StructuredListRow>
            <StructuredListCell noWrap className={classNames(styles.llmtslargecell)}>
              <Button kind="ghost" className={styles.llmtprivacytermsbutton} onClick={() => setOpenTerms(true)}>
                Usage terms
              </Button>
              <Modal
                open={openTerms}
                onRequestClose={() => setOpenTerms(false)}
                danger
                modalHeading="By using this prompt you agree to the OpenMRS A.I usage Terms."
                modalLabel="Terms"
                primaryButtonText="Accept Terms Of Use"
                secondaryButtonText="Cancel"
                onRequestSubmit={handleAcceptLlmToolsTerms}
                loadingStatus={termsStatus}
                loadingDescription={termsDescription}
              />
              <hr />
              <Button kind="ghost" className={styles.llmtprivacytermsbutton} onClick={() => setOpenPrivacy(true)}>
                Privacy policy
              </Button>
              <Modal
                open={openPrivacy}
                onRequestClose={() => setOpenPrivacy(false)}
                danger
                modalHeading="By using this prompt you agree to the OpenMRS A.I Privacy policy."
                modalLabel="Privacy"
                primaryButtonText="Accept Privacy Policy"
                secondaryButtonText="Cancel"
                onRequestSubmit={handleAcceptLlmToolsPrivacyPolicy}
                loadingStatus={privacyStatus}
                loadingDescription={privacyDescription}
              />
            </StructuredListCell>
            <StructuredListCell className={classNames(styles.llmtpromptpanel)}>
              <LlmToolsAIPrompt />
            </StructuredListCell>
            <StructuredListCell className={classNames(styles.llmtslargecell)}>
              This output means that 12.34% of your patients have diabetes in your OpenMRS system. How to Interpret the
              Numbers: 12.34%: This represents the proportion of your active patients who have been diagnosed with
              diabetes Calculation basis: This percentage was calculated by: Counting all unique patients with a
              diabetes diagnosis (concept ID 5089) Dividing by the total number of active patients in your system
              Converting to a percentage and rounding to 2 decimal places.
              <CodeSnippet feedback="Copied to clipboard" type="multi" className={classNames(styles)}>
                SELECT ROUND( (COUNT(DISTINCT diabetes_patients.patient_id) * 100.0 / COUNT(DISTINCT
                all_patients.patient_id)), 2 ) AS diabetes_percentage FROM patient all_patients LEFT JOIN ( SELECT
                DISTINCT obs.person_id AS patient_id FROM obs JOIN concept_name cn ON obs.concept_id = cn.concept_id
                WHERE cn.name = 'DIABETES' AND cn.concept_name_type = 'FULLY_SPECIFIED' AND obs.voided = 0 AND
                obs.value_coded IS NOT NULL ) diabetes_patients ON all_patients.patient_id =
                diabetes_patients.patient_id WHERE all_patients.voided = 0;
              </CodeSnippet>
            </StructuredListCell>
          </StructuredListRow>
        </StructuredListBody>
      </StructuredListWrapper>
    </div>
  );
}

export default LlmToolsChat;
