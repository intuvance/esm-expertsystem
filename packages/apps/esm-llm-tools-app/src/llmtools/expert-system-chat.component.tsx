import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from '@openmrs/esm-framework';
import { Button, CodeSnippet, IconButton, Modal, TextArea, Dropdown, Slider, Stack, MultiSelect } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Copy, SendAltFilled, StopFilled, ChevronDown, Information } from '@carbon/react/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import LlmToolsAILabel from './llmtools-label.component';
import { WordMapAndDiagram } from '../context-aware/expertsystem-context.component';
import { useOllamaModels } from '../hooks/useOllamaModels';
import { useAvailableTools, type ToolSpec } from '../hooks/useAvailableTools';

import styles from './expertsystem-chat.scss';
import { setResponse, getResponse } from '../utils/localStorage';

interface ChatMessage {
  id: string;
  text: string;
  type: 'user' | 'ai';
  question?: string;
  isComplete?: boolean;
  sql?: string;
  confidence?: number | null;
  tools?: string[];
}

const ExpertSystemChat = () => {
  const { t } = useTranslation();
  const session = useSession();
  const streamingMessageRef = useRef('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { models, loading, modelError } = useOllamaModels();
  const { tools: availableTools, loading: toolsLoading, error: toolsError } = useAvailableTools();

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
  const [termsContent, setTermsContent] = useState<string>('');
  const [privacyContent, setPrivacyContent] = useState<string>('');
  const [termsFileName, setTermsFileName] = useState<string>('');
  const [privacyFileName, setPrivacyFileName] = useState<string>('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [selectedToolNames, setSelectedToolNames] = useState<string[]>([]);
  const [activeToolCalls, setActiveToolCalls] = useState<string[]>([]);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [fullResponseModalOpen, setFullResponseModalOpen] = useState(false);
  const [fullResponseContent, setFullResponseContent] = useState('');
  const [wordMapModalOpen, setWordMapModalOpen] = useState(false);
  const [diagramModalOpen, setDiagramModalOpen] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const outputEndRef = useRef<HTMLDivElement | null>(null);
  const lastQuestionRef = useRef<string>('');
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const toolItems = availableTools.map((t) => ({
    id: t.name,
    label: t.name,
    description: t.description,
  }));

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
        if (data.type === 'tool_call') {
          setActiveToolCalls((prev) => [...prev, ...(data.tools || [])]);
        } else if (data.type === 'tool_result') {
          setActiveToolCalls((prev) => prev.filter((t) => t !== data.tool));
        } else if (data.type === 'token') {
          streamingMessageRef.current += data.data;
          setStreamingMessage(streamingMessageRef.current);
        } else if (data.type === 'done') {
          const newMessage: ChatMessage = {
            id: session?.user?.uuid + Date.now(),
            question: lastQuestionRef.current,
            text: streamingMessageRef.current + (data.data || ''),
            type: 'ai',
            isComplete: true,
            sql: data.sql || '',
            confidence: data.confidence ?? null,
            tools: activeToolCalls.length > 0 ? [...activeToolCalls] : undefined,
          };
          setMessages((prev) => [...prev, newMessage]);
          streamingMessageRef.current = '';
          setStreamingMessage('');
          setIsStreaming(false);
          setActiveToolCalls([]);

          if (data.confidence) setConfidence(data.confidence);
          if (data.sql) {
            setSqlQuery(data.sql);
            setShowSql(true);
          }

          setFullResponseContent(newMessage.text);
          setFullResponseModalOpen(true);
        } else if (data.type === 'error') {
          setError(data.data);
          setIsStreaming(false);
          setActiveToolCalls([]);
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

  useEffect(() => {
    if (selectedToolNames.length === 0 && availableTools.length > 0 && !toolsLoading) {
      setSelectedToolNames(availableTools.map((t) => t.name));
    }
  }, [availableTools, toolsLoading]);

  useEffect(() => {
    const storedTerms = getResponse('esm_llm_tools_terms_accepted');
    const storedPrivacy = getResponse('esm_llm_tools_privacy_accepted');
    if (storedTerms) setAcceptLlmToolsTerms(true);
    if (storedPrivacy) setAcceptLlmToolsPrivacy(true);
  }, []);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleTermsFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await readFileContent(file);
      setTermsContent(content);
      setTermsFileName(file.name);
    } catch (err) {
      console.error('Failed to read terms file:', err);
    }
  };

  const handlePrivacyFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await readFileContent(file);
      setPrivacyContent(content);
      setPrivacyFileName(file.name);
    } catch (err) {
      console.error('Failed to read privacy file:', err);
    }
  };

  const sendMessage = useCallback(() => {
    if (!input.trim() || !wsRef.current || isStreaming || !selectedModel) return;

    const requestId = session?.user?.uuid + Date.now().toString();
    requestIdRef.current = requestId;

    const question = input;
    lastQuestionRef.current = question;
    setActiveToolCalls([]);

    const toolSpecs = availableTools
      .filter((t) => selectedToolNames.includes(t.name))
      .map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
        ...(t.required ? { required: t.required } : {}),
      }));

    setMessages((prev) => [...prev, { id: session?.user?.uuid + Date.now().toString(), text: question, type: 'user' }]);

    const payload: Record<string, unknown> = {
      requestId,
      model: selectedModel,
      messages: [{ type: 'USER', text: question }],
      options: { temperature, think: false },
      stream: true,
    };

    if (toolSpecs.length > 0) {
      payload.tools = toolSpecs;
    }

    wsRef.current.send(JSON.stringify(payload));
    setIsStreaming(true);
    setStreamingMessage('');
    setInput('');
    setShowSql(false);
  }, [input, isStreaming, selectedModel, temperature, selectedToolNames, availableTools, session]);

  const stopStreaming = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ requestId: requestIdRef.current, action: 'stop' }));
    }
    setIsStreaming(false);
    setStreamingMessage('');
    streamingMessageRef.current = '';
    setActiveToolCalls([]);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleToolChange = (data: { selectedItems: string[] }) => setSelectedToolNames(data.selectedItems);
  const handleTemperatureChange = (data: { value: number; valueUpper?: number }) => setTemperature(data.value);

  const handleAcceptLlmToolsTerms = async () => {
    setAcceptLlmToolsTerms(!acceptLlmToolsTerms);
    setTermsStatus('active');
    await new Promise((r) => setTimeout(r, 2000));
    setTermsDescription('Accepted terms of use!');
    setTermsStatus('finished');
    setResponse('esm_llm_tools_terms_accepted', true);
  };

  const handleAcceptLlmToolsPrivacyPolicy = async () => {
    setAcceptLlmToolsPrivacy(!acceptLlmToolsPrivacy);
    setPrivacyStatus('active');
    await new Promise((r) => setTimeout(r, 2000));
    setPrivacyDescription('Accepted privacy policy!');
    setPrivacyStatus('finished');
    setResponse('esm_llm_tools_privacy_accepted', true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('Copy failed!', e);
    }
  };

  const toggleExpand = (msgId: string, text: string) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
      } else {
        next.add(msgId);
      }
      return next;
    });
  };

  const openModal = (title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };

  const registerMessageRef = (id: string, el: HTMLDivElement | null) => {
    if (el) {
      messageRefs.current.set(id, el);
    } else {
      messageRefs.current.delete(id);
    }
  };

  const isOverflowing = (msgId: string): boolean => {
    const el = messageRefs.current.get(msgId);
    if (!el) return false;
    return el.scrollHeight > el.clientHeight + 2;
  };

  console.error({ models, loading, modelError, tools: availableTools.length, toolsLoading });

  return (
    <div className={styles.expertSystemChat}>
      <div className={styles.container}>
        <Stack gap={1} className={styles.headerSection} orientation="horizontal">
          <div className={styles.labelPadding}>
            <LlmToolsAILabel />
          </div>
          <Button kind="ghost" size="sm" onClick={() => setDiagramModalOpen(true)}>
            Context Diagram
          </Button>
          {streamingMessage && (
            <Button
              kind="ghost"
              size="sm"
              onClick={() => {
                setFullResponseContent(streamingMessage);
                setFullResponseModalOpen(true);
              }}
            >
              View Response
            </Button>
          )}
          <Button kind="ghost" size="sm" onClick={() => setOpenTerms(true)} disabled={acceptLlmToolsTerms}>
            {acceptLlmToolsTerms ? 'Terms Accepted' : 'Usage terms'}
          </Button>
          <Button kind="ghost" size="sm" onClick={() => setOpenPrivacy(true)} disabled={acceptLlmToolsPrivacy}>
            {acceptLlmToolsPrivacy ? 'Privacy Accepted' : 'Privacy policy'}
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
          >
            <div className={styles.termsUploadSection}>
              <label htmlFor="terms-file-upload" className={styles.termsUploadLabel}>
                Upload Terms Document
              </label>
              <input
                id="terms-file-upload"
                type="file"
                accept=".txt,.md,.html"
                onChange={handleTermsFileUpload}
                className={styles.termsFileInput}
              />
              {termsFileName && <p className={styles.termsFileName}>Uploaded: {termsFileName}</p>}
            </div>
            {termsContent && (
              <div className={styles.termsDocumentContent}>
                {termsFileName.endsWith('.html') ? (
                  <iframe srcDoc={termsContent} title="terms document" sandbox="" />
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{termsContent}</ReactMarkdown>
                )}
              </div>
            )}
          </Modal>
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
          >
            <div className={styles.termsUploadSection}>
              <label htmlFor="privacy-file-upload" className={styles.termsUploadLabel}>
                Upload Privacy Document
              </label>
              <input
                id="privacy-file-upload"
                type="file"
                accept=".txt,.md,.html"
                onChange={handlePrivacyFileUpload}
                className={styles.termsFileInput}
              />
              {privacyFileName && <p className={styles.termsFileName}>Uploaded: {privacyFileName}</p>}
            </div>
            {privacyContent && (
              <div className={styles.termsDocumentContent}>
                {privacyFileName.endsWith('.html') ? (
                  <iframe srcDoc={privacyContent} title="privacy document" sandbox="" />
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{privacyContent}</ReactMarkdown>
                )}
              </div>
            )}
          </Modal>
        </Stack>

        <div className={styles.horizontalDivider}></div>

        <div className={styles.bodyColumn}>
          <div className={styles.streamingContainer}>
            {isStreaming && lastQuestionRef.current && (
              <div className={styles.userQuestion}>{lastQuestionRef.current}</div>
            )}

            {(streamingMessage || isStreaming) && (
              <div className={styles.streamingAnswer}>
                {activeToolCalls.length > 0 && (
                  <div className={styles.toolCallsIndicator}>
                    <span className={styles.toolCallDot}></span>
                    Using tools: {activeToolCalls.join(', ')}
                  </div>
                )}
                <div className={styles.quillEditor}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingMessage}</ReactMarkdown>
                </div>
              </div>
            )}

            {!isStreaming && streamingMessage === '' && messages.filter((m) => m.type === 'ai').length === 0 && (
              <WordMapAndDiagram msg={{ text: '' }} />
            )}

            {messages
              .filter((m) => m.type === 'ai')
              .map((msg) => {
                const isExpanded = expandedMessages.has(msg.id);
                const hasOverflow = !isExpanded && isOverflowing(msg.id);

                return (
                  <div key={msg.id} className={styles.aiMessage}>
                    {msg.question && <div className={styles.userQuestion}>{msg.question}</div>}

                    {msg.tools && msg.tools.length > 0 && (
                      <div className={styles.toolCallsIndicator}>
                        <span className={styles.toolCallDot}></span>
                        Used tools: {msg.tools.join(', ')}
                      </div>
                    )}

                    <div className={styles.aiAnswerHeader}>
                      <IconButton kind="ghost" size="sm" label="Copy" onClick={() => copyToClipboard(msg.text)}>
                        <Copy />
                      </IconButton>
                      <span className={styles.headerActions}>
                        <IconButton
                          kind="ghost"
                          size="sm"
                          label={isExpanded ? 'Show less' : 'Read more'}
                          onClick={() => toggleExpand(msg.id, msg.text)}
                          title={isExpanded ? 'Collapse' : 'Expand full response'}
                          disabled={!msg.isComplete}
                        >
                          <ChevronDown size={16} style={isExpanded ? { transform: 'rotate(180deg)' } : undefined} />
                        </IconButton>
                        {msg.confidence != null && (
                          <span className={styles.confidenceBadge}>
                            Confidence: {Math.round((msg.confidence as number) * 100)}%
                          </span>
                        )}
                      </span>
                    </div>

                    <div
                      ref={(el) => registerMessageRef(msg.id, el)}
                      className={`${styles.quillEditor} ${!isExpanded ? styles.quillEditorClamped : ''}`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>

                    {hasOverflow && (
                      <button
                        type="button"
                        className={styles.readMoreButton}
                        onClick={() => openModal(msg.question || 'Full response', msg.text)}
                        title="View full response in a scrollable modal"
                      >
                        <Information size={16} />
                        <span>Read More</span>
                      </button>
                    )}

                    {msg.isComplete && isExpanded && (
                      <button
                        type="button"
                        className={styles.readLessButton}
                        onClick={() => toggleExpand(msg.id, msg.text)}
                      >
                        Show less
                      </button>
                    )}

                    {msg.sql && <CodeSnippet type="multi">{msg.sql}</CodeSnippet>}
                  </div>
                );
              })}

            <div ref={outputEndRef} />
          </div>

          <div className={styles.controlsPanel}>
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
                  items={toolItems as any}
                  initialSelectedItems={selectedToolNames}
                  onChange={handleToolChange}
                  disabled={toolsLoading || !!toolsError}
                />
                {toolsError && <p className={styles.toolsErrorHint}>Showing built-in tools</p>}
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
                {toolsError && <p className={styles.toolsErrorHint}>Showing Ollama Models</p>}
              </div>
            </div>

            <div className={styles.promptLabel}>{t('prompt', 'Your question')}</div>

            <div className={styles.textAreaButtonWrapper}>
              <TextArea
                id="expert-system-prompt"
                placeholder={t('aiPrompt', 'Enter your question...')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={3}
                className={styles.promptTextarea}
                onKeyPress={handleKeyPress}
                labelText={''}
              />
              <div className={styles.overlayButtonGroup}>
                {isStreaming ? (
                  <IconButton kind="primary" label="Stop" onClick={stopStreaming} className={styles.overlayIconButton}>
                    <StopFilled size={16} />
                  </IconButton>
                ) : (
                  <IconButton
                    kind="primary"
                    label="Send"
                    onClick={sendMessage}
                    className={styles.overlayIconButton}
                    disabled={!input.trim()}
                  >
                    <SendAltFilled size={16} />
                  </IconButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        modalHeading={modalTitle}
        modalLabel="Full response"
        primaryButtonText={t('cancel', 'Close')}
        onRequestSubmit={() => setModalOpen(false)}
        size="lg"
      >
        <div className={styles.modalContent}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{modalContent}</ReactMarkdown>
        </div>
      </Modal>

      <Modal
        open={fullResponseModalOpen}
        onRequestClose={() => setFullResponseModalOpen(false)}
        modalHeading="Full Response"
        modalLabel="Full response"
        primaryButtonText={t('cancel', 'Close')}
        onRequestSubmit={() => setFullResponseModalOpen(false)}
        className={styles.fullPageModal}
      >
        <div className={styles.fullPageModalContent}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{fullResponseContent}</ReactMarkdown>
        </div>
      </Modal>

      <Modal
        open={wordMapModalOpen}
        onRequestClose={() => setWordMapModalOpen(false)}
        modalHeading="Word Map"
        modalLabel="Word Map"
        primaryButtonText={t('cancel', 'Close')}
        onRequestSubmit={() => setWordMapModalOpen(false)}
        className={styles.fullPageModal}
      >
        <div className={styles.fullPageModalContent}>
          <WordMapAndDiagram msg={{ text: '' }} />
        </div>
      </Modal>

      <Modal
        open={diagramModalOpen}
        onRequestClose={() => setDiagramModalOpen(false)}
        modalHeading="Context Diagram"
        modalLabel="Context Diagram"
        primaryButtonText={t('cancel', 'Close')}
        onRequestSubmit={() => setDiagramModalOpen(false)}
        className={styles.fullPageModal}
      >
        <div className={styles.fullPageModalContent}>
          <WordMapAndDiagram msg={{ text: '' }} />
        </div>
      </Modal>
    </div>
  );
};

export default ExpertSystemChat;
