import React, { useState } from 'react';
import { Column, Dropdown, FlexGrid, FormLabel, Row, Slider } from '@carbon/react';
import classNames from 'classnames';
import styles from './llmtools-options.styles.scss';

const models = [
  { id: 'gpt-3.5', label: 'GPT-3.5' },
  { id: 'gpt-4', label: 'GPT-4' },
  { id: 'claude', label: 'Claude' },
  { id: 'meditron', label: 'Meditron' },
  { id: 'llama', label: 'Llama 2' },
  { id: 'deepseek-r1', label: 'DeepSeek R1' },
];

function LlmToolsOptions() {
  const [temperature, setTemperature] = useState(0.7);

  return (
    <>
      <FlexGrid fullWidth>
        <Row className={classNames(styles.promptLayout)}>
          <Column sm={6} md={6} lg={6}>
            <FormLabel>Temperature</FormLabel>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={temperature}
              className={classNames(styles.promptTempearatureSlider)}
              onChange={({ value }) => setTemperature(value)}
              aria-label="Temperature"
            />
          </Column>
          <Column sm={6} md={6} lg={6}>
            <Dropdown
              autoAlign
              direction="top"
              helperText="Select a model"
              id="models"
              initialSelectedItem={models[1]}
              itemToString={(item) => item.label}
              items={models.map((item) => ({
                label: item.label,
              }))}
              label="Model"
              titleText="Model"
            />
          </Column>
        </Row>
      </FlexGrid>
    </>
  );
}

export default LlmToolsOptions;
