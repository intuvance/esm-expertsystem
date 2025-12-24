import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from '@openmrs/esm-framework';
import { Button, CodeSnippet, IconButton, Modal, TextArea, Dropdown, Slider, Stack, MultiSelect } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Copy, SendAltFilled } from '@carbon/react/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import LlmToolsAILabel from './llmtools-label.component';
import { useOllamaModels } from '../hooks/useOllamaModels';

import styles from './expertsystem-chat.scss';

const ExpertSystemChat = () => {
  const { t } = useTranslation();
  const session = useSession();
  const streamingMessageRef = useRef('');
  const [messages, setMessages] = useState<any[]>([]);
  const { models, loading, modelError } = useOllamaModels();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [showSql, setShowSql] = useState(false);
  const [termsStatus, setTermsStatus] = useState<'inactive' | 'active' | 'finished' | 'error'>('inactive');
  const [privacyStatus, setPrivacyStatus] = useState<'inactive' | 'active' | 'finished' | 'error'>('inactive');
  const [acceptLlmToolsTerms, setAcceptLlmToolsTerms] = useState(false);
  const [acceptLlmToolsPrivacy, setAcceptLlmToolsPrivacy] = useState(false);
  const [termsDescription, setTermsDescription] = useState('Accepting terms of use...');
  const [privacyDescription, setPrivacyDescription] = useState('Accepting privacy policy...');
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [selectedTools, setSelectedTools] = useState<string[]>(['search', 'calculator', 'translator']);

  const wsRef = useRef<WebSocket | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const outputEndRef = useRef<HTMLDivElement | null>(null);
  const lastQuestionRef = useRef<string>('');

  const getWebSocketUrl = useCallback((): string => {
    let baseUrl =
      typeof (window as any).getOpenmrsSpaBase === 'function' ? (window as any).getOpenmrsSpaBase() || '' : '';
    if (!baseUrl) baseUrl = window.location.origin;

    try {
      const url = new URL(baseUrl);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = url.host.replace(/:\d+$/, '');
      return `${protocol}//${host}/openmrs/ws/v1/expertsystem/websocket/tokens`;
    } catch {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host.replace(/:\d+$/, '');
      return `${protocol}//${host}/openmrs/ws/v1/expertsystem/websocket/tokens`;
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(getWebSocketUrl());

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'token') {
          streamingMessageRef.current += data.data;
          setStreamingMessage(streamingMessageRef.current);
        } else if (data.type === 'done') {
          const newMessage = {
            id: session?.user?.uuid + Date.now(),
            question: lastQuestionRef.current,
            text: streamingMessageRef.current + (data.data || ''),
            type: 'ai',
            isComplete: true,
            sql: data.sql || '',
          };
          setMessages((prev) => [...prev, newMessage]);
          streamingMessageRef.current = '';
          setStreamingMessage('');
          setIsStreaming(false);

          if (data.confidence) setConfidence(data.confidence);
          if (data.sql) {
            setSqlQuery(data.sql);
            setShowSql(true);
          }
        } else if (data.type === 'error') {
          setError(data.data);
          setIsStreaming(false);
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [getWebSocketUrl]);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [streamingMessage, messages]);

  useEffect(() => {
    if (!selectedModel && models.length > 0) {
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || !wsRef.current || isStreaming || !selectedModel) return;

    const requestId = session?.user?.uuid + Date.now().toString();
    requestIdRef.current = requestId;

    const question = input;
    lastQuestionRef.current = question;

    setMessages((prev) => [...prev, { id: session?.user?.uuid + Date.now().toString(), text: question, type: 'user' }]);

    const payload = {
      requestId,
      model: selectedModel,
      messages: [{ type: 'USER', text: question }],
      options: { temperature, think: false },
      tools: selectedTools,
      stream: true,
    };

    wsRef.current.send(JSON.stringify(payload));
    setIsStreaming(true);
    setStreamingMessage('');
    setInput('');
    setShowSql(false);
  }, [input, isStreaming, selectedModel, temperature, selectedTools]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleToolChange = (data: { selectedItems: string[] }) => setSelectedTools(data.selectedItems);
  const handleTemperatureChange = (data: { value: number; valueUpper?: number }) => setTemperature(data.value);

  const handleAcceptLlmToolsTerms = async () => {
    setAcceptLlmToolsTerms(!acceptLlmToolsTerms);
    setTermsStatus('active');
    await new Promise((r) => setTimeout(r, 2000));
    setTermsDescription('Accepted terms of use!');
    setTermsStatus('finished');
  };

  const handleAcceptLlmToolsPrivacyPolicy = async () => {
    setAcceptLlmToolsPrivacy(!acceptLlmToolsPrivacy);
    setPrivacyStatus('active');
    await new Promise((r) => setTimeout(r, 2000));
    setPrivacyDescription('Accepted privacy policy!');
    setPrivacyStatus('finished');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Copy failed!', e);
    }
  };

  console.error({ models, loading, modelError });

  return (
    <div className={styles.expertSystemChat}>
      <div className={styles.container}>
        <Stack gap={1} className={styles.headerSection} orientation="horizontal">
          <div className={styles.labelPadding}>
            <LlmToolsAILabel />
          </div>
          <Button kind="ghost" onClick={() => setOpenTerms(true)}>
            Usage terms
          </Button>
          <Button kind="ghost" onClick={() => setOpenPrivacy(true)}>
            Privacy policy
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
        </Stack>

        <div className={styles.horizontalDivider}></div>

        <div className={styles.flexContainer}>
          <div className={styles.leftColumn}>
            <div className={styles.llmtpromptpanel}>
              <div className={styles.controlsRow}>
                <div className={styles.temperatureControl}>
                  <p className={styles.controlLabel}>Temperature</p>
                  <Slider min={0} max={1} step={0.1} value={temperature} onChange={handleTemperatureChange} />
                </div>
                <div className={styles.toolsMultiSelect}>
                  <MultiSelect
                    id="tools-multiselect"
                    label="Select tools"
                    titleText="Tools"
                    items={['search', 'calculator', 'translator']}
                    initialSelectedItems={selectedTools}
                    onChange={handleToolChange}
                  />
                </div>
                <div className={styles.modelSelect}>
                  <p className={styles.controlLabel}>
                    Model {modelError && <span className={styles.errorText}> : Failed to load models!</span>}
                  </p>
                  <Dropdown
                    id="model-select"
                    label="Model"
                    titleText=""
                    items={models}
                    selectedItem={selectedModel}
                    onChange={(e) => setSelectedModel(e.selectedItem)}
                    disabled={loading || !!modelError || models.length === 0}
                  />
                </div>
              </div>

              <p className={styles.promptLabel}>{t('prompt', 'Your question')}</p>

              <div className={styles.textAreaButtonWrapper}>
                <TextArea
                  id="expert-system-prompt"
                  placeholder={t('aiPrompt', 'Enter your question...')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={1}
                  className={styles.promptTextarea}
                  onKeyPress={handleKeyPress}
                  labelText={''}
                />

                <IconButton kind="primary" label="Send" onClick={sendMessage} className={styles.promptSendButton}>
                  <SendAltFilled />
                </IconButton>
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.streamingContainer}>
              {isStreaming && lastQuestionRef.current && (
                <div className={styles.userQuestion}>{lastQuestionRef.current}</div>
              )}

              {streamingMessage && (
                <div className={styles.quillEditor}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingMessage}</ReactMarkdown>
                </div>
              )}

              {messages
                .filter((m) => m.type === 'ai')
                .map((msg) => (
                  <div key={msg.id} className={styles.aiMessage}>
                    {msg.question && <div className={styles.userQuestion}>{msg.question}</div>}

                    <div className={styles.aiAnswerHeader}>
                      <IconButton kind="ghost" size="sm" label="Copy" onClick={() => copyToClipboard(msg.text)}>
                        <Copy />
                      </IconButton>
                    </div>

                    <div className={styles.quillEditor}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>

                    {msg.sql && <CodeSnippet type="multi">{msg.sql}</CodeSnippet>}
                  </div>
                ))}

              <div ref={outputEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertSystemChat;
