import React, { useState } from 'react';
import { IconButton, TextArea } from '@carbon/react';
import { Ollama } from '@langchain/ollama';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import LlmToolsOptions from './llmtools-options-component';

import classNames from 'classnames';
import styles from './llmtools-prompt.styles.scss';
import { SendAltFilled } from '@carbon/react/icons';

function LlmToolsAIPrompt() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleGenerate = async () => {
    console.error('Send button clicked');
    try {
      const ollama = new Ollama({ model: 'llama2' });
      const prompt = ChatPromptTemplate.fromMessages([['human', '{query}']]);
      const chain = prompt.pipe(ollama).pipe(new StringOutputParser());
      const result = await chain.invoke({ query: input });
      setOutput(result);
    } catch (error) {
      console.error('Error generating response:', error);
      setOutput('Error generating response.');
    }
  };

  return (
    <>
      <TextArea
        id="llmtools-prompt-text-area"
        enableCounter
        decorator={
          <>
            <IconButton align="bottom" defaultOpen kind="primary" label="Send" onClick={handleGenerate} size="sm">
              <SendAltFilled />
            </IconButton>
          </>
        }
        labelText="Your Prompt"
        placeholder="Enter your A.I prompt here..."
        value={input}
        maxCount={500}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        className={classNames(styles.promptTextarea)}
        helperText={<LlmToolsOptions />}
      />
    </>
  );
}

export default LlmToolsAIPrompt;
