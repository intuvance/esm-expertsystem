import React, { useState } from 'react';
import {
  Button,
  CodeSnippet,
  IconButton,
  Modal,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
  TextArea,
  TextAreaSkeleton,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { AiGenerate, AiGovernanceTracked, SendAltFilled } from '@carbon/react/icons';

import { Ollama } from '@langchain/ollama';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { useLlm } from '../hooks/useLlm';
import LlmToolsAILabel from './llmtools-label.component';
import LlmToolsOptions from './llmtools-options-component';

import classNames from 'classnames';
import styles from './llmtools-chat.styles.scss';

function LlmToolsChat() {
  const { t } = useTranslation();
  const [termsStatus, setTermsStatus] = useState<'inactive' | 'active' | 'finished' | 'error'>('inactive');
  const [privacyStatus, setPrivacyStatus] = useState<'inactive' | 'active' | 'finished' | 'error'>('inactive');
  const [acceptLlmToolsTerms, setLacceptLlmToolsTerms] = useState(false);
  const [acceptLlmToolsPrivacy, setAcceptLlmToolsPrivacy] = useState(false);
  const [termsDescription, setTermsDescription] = useState('Accepting terms of use...');
  const [privacyDescription, setPrivacyDescription] = useState('Accepting privacy policy...');
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [input, setInput] = useState('');
  const [llmResponse, setLlmResponse] = useLlm('expertsystem-llm-response', '');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleGenerateResponse = async () => {
    setIsLoading(true);

    try {
      const ollama = new Ollama({ model: 'meditron' });
      const prompt = ChatPromptTemplate.fromMessages([['human', '{query}']]);
      const chain = prompt.pipe(ollama).pipe(new StringOutputParser());
      const result = await chain.invoke({ query: input });
      setLlmResponse(result);
    } catch (error) {
      console.error('Error generating response:', error);
      setLlmResponse('Error generating response...');
    } finally {
      setIsLoading(false);
    }
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
                modalHeading={t('aiUsageTerms', 'By using this prompt you agree to the OpenMRS A.I usage Terms.')}
                modalLabel={t('terms', 'Terms')}
                primaryButtonText={t('aiAcceptTermsOfUse', 'Accept Terms Of Use')}
                secondaryButtonText={t('cancel', 'Cancel')}
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
                modalHeading={t('aiPrivacyPolicy', 'By using this prompt you agree to the OpenMRS A.I Privacy policy.')}
                modalLabel={t('privacy', 'Privacy')}
                primaryButtonText={t('aiAcceptPolicy', 'Accept Privacy Policy.')}
                secondaryButtonText={t('cancel', 'Cancel')}
                onRequestSubmit={handleAcceptLlmToolsPrivacyPolicy}
                loadingStatus={privacyStatus}
                loadingDescription={privacyDescription}
              />
            </StructuredListCell>
            <StructuredListCell className={classNames(styles.llmtpromptpanel)}>
              <TextArea
                id="llmtools-prompt"
                enableCounter
                decorator={
                  <>
                    {isLoading ? (
                      <AiGenerate />
                    ) : (
                      <IconButton
                        align="bottom"
                        defaultOpen
                        kind="primary"
                        label="Send"
                        onClick={handleGenerateResponse}
                        size="sm"
                      >
                        <SendAltFilled />
                      </IconButton>
                    )}
                  </>
                }
                labelText={t('prompt', 'Your Prompt')}
                placeholder={t('aiPrompt', 'Enter your A.I prompt here...')}
                value={input}
                maxCount={500}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                className={classNames(styles.promptTextarea)}
                helperText={<LlmToolsOptions />}
              />
            </StructuredListCell>
            <StructuredListCell className={classNames(styles.llmtslargecell)}>
              {isLoading ? (
                <TextAreaSkeleton />
              ) : (
                llmResponse && (
                  <p>
                    {llmResponse}
                    <br />
                    <div className={styles.footer}>
                      <AiGovernanceTracked size={14} />
                      <span className={styles.notes}>{t('aiGeneratedResponse', ' AI-generated notes')}</span>
                    </div>
                  </p>
                )
              )}
              <CodeSnippet
                feedback={t('copiedToClipboard', 'Copied to clipboard')}
                type="multi"
                className={classNames(styles.llmtsnippet)}
              >
                {isLoading ? <TextAreaSkeleton /> : <p>{llmResponse}</p>}
              </CodeSnippet>
            </StructuredListCell>
          </StructuredListRow>
        </StructuredListBody>
      </StructuredListWrapper>
    </div>
  );
}

export default LlmToolsChat;
