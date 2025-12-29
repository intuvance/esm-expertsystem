import React, { useRef, useState, useMemo } from 'react';
import { Button } from '@carbon/react';
import { toPng } from 'html-to-image';
import { Download } from '@carbon/react/icons';
import ReactWordcloud, { type Options } from 'react-wordcloud';
import ReactFlow, { Background, Controls, MiniMap, type Node, type Edge } from 'react-flow-renderer';
import styles from './expertsystem-context.styles.scss';

const openmrsColors = ['#F26522', '#5B57A6', '#EEA616', '#009384', '#231F20'];

/**
 * Context-aware Words with tooltips.
 */
const words = [
  { text: 'Patient', value: 50, tooltip: 'The central entity receiving care.' },
  { text: 'Person', value: 40, tooltip: 'Demographics associated with a patient.' },
  { text: 'Encounter', value: 45, tooltip: 'A single interaction between a patient and healthcare system.' },
  { text: 'Observation (Obs)', value: 40, tooltip: 'A single data point recorded during an encounter.' },
  { text: 'Visit', value: 35, tooltip: 'A collection of encounters grouped together.' },
  { text: 'Diagnosis', value: 30, tooltip: 'Health conditions associated with an encounter.' },
  { text: 'Allergy', value: 30, tooltip: 'Known patient allergies.' },
  { text: 'Program', value: 25, tooltip: 'A care pathway the patient is enrolled in.' },
  { text: 'Relationship', value: 25, tooltip: 'Links between patients or people (e.g., Mother/Child).' },
  { text: 'Concept', value: 35, tooltip: 'The fundamental definition of a medical question, answer, or observation.' },
  { text: 'Location', value: 20, tooltip: 'Physical place of care delivery.' },
  { text: 'Drug', value: 25, tooltip: 'A medicinal product linked to a concept.' },
  { text: 'Order', value: 20, tooltip: 'Action to be performed for a patient, like a drug or lab test.' },
  { text: 'Cohort', value: 20, tooltip: 'A static, predefined group of patients.' },
  { text: 'Report', value: 20, tooltip: 'Predefined report summarizing patient or cohort data.' },
];

interface WordMapProps {
  msg: { text: string };
}

export const WordMapAndDiagram: React.FC<WordMapProps> = ({ msg }) => {
  const [showDiagram, setShowDiagram] = useState(false);
  const wordcloudRef = useRef<HTMLDivElement>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const defaultOptions = { svgAttributes: {}, textAttributes: {}, tooltipOptions: {} };

  const wordcloudOptions: Options = useMemo(
    () => ({
      rotations: 2,
      rotationAngles: [0, 0],
      fontSizes: [15, 40] as [number, number],
      fontFamily: 'impact, sans-serif',
      fontStyle: 'normal',
      fontWeight: 'normal',
      padding: 1,
      colors: openmrsColors,
      enableTooltip: true,
      deterministic: true,
      scale: 'sqrt',
      spiral: 'rectangular',
      transitionDuration: 0,
      enableOptimizations: false,
      ...defaultOptions,
    }),
    [],
  );

  const wordcloudCallbacks = useMemo(
    () => ({
      getWordTooltip: (word: any) => word.tooltip || word.text,
    }),
    [],
  );

  const wordcloudSize: [number, number] = [800, 400];

  const nodes: Node[] = useMemo(
    () => [
      { id: 'patient', type: 'default', data: { label: 'Patient' }, position: { x: 400, y: 50 } },
      { id: 'person', type: 'default', data: { label: 'Person' }, position: { x: 200, y: 150 } },
      { id: 'encounter', type: 'default', data: { label: 'Encounter' }, position: { x: 400, y: 250 } },
      { id: 'observation', type: 'default', data: { label: 'Observation' }, position: { x: 200, y: 350 } },
      { id: 'diagnosis', type: 'default', data: { label: 'Diagnosis' }, position: { x: 600, y: 350 } },
      { id: 'visit', type: 'default', data: { label: 'Visit' }, position: { x: 400, y: 450 } },
      { id: 'allergy', type: 'default', data: { label: 'Allergy' }, position: { x: 800, y: 50 } },
      { id: 'program', type: 'default', data: { label: 'Program' }, position: { x: 0, y: 50 } },
      { id: 'relationship', type: 'default', data: { label: 'Relationship' }, position: { x: 0, y: 250 } },
    ],
    [],
  );

  const edges: Edge[] = useMemo(
    () => [
      { id: 'p-person', source: 'patient', target: 'person', label: 'is a' },
      { id: 'p-encounter', source: 'patient', target: 'encounter', label: 'has' },
      { id: 'p-allergy', source: 'patient', target: 'allergy', label: 'has' },
      { id: 'p-program', source: 'patient', target: 'program', label: 'enrolled in' },
      { id: 'person-relationship', source: 'person', target: 'relationship', label: 'participates in' },
      { id: 'encounter-observation', source: 'encounter', target: 'observation', label: 'records' },
      { id: 'encounter-diagnosis', source: 'encounter', target: 'diagnosis', label: 'diagnosed with' },
      { id: 'encounter-visit', source: 'encounter', target: 'visit', label: 'grouped into' },
    ],
    [],
  );

  const exportWordcloud = async () => {
    if (!wordcloudRef.current) return;
    const dataUrl = await toPng(wordcloudRef.current, { backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = 'openmrs-ai-context-wordcloud.png';
    link.href = dataUrl;
    link.click();
  };

  const exportDiagram = async () => {
    if (!reactFlowWrapper.current) return;
    const dataUrl = await toPng(reactFlowWrapper.current, { backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = 'openmrs-ai-context-diagram.png';
    link.href = dataUrl;
    link.click();
  };

  const memoizedWordcloud = useMemo(
    () => (
      <ReactWordcloud words={words} options={wordcloudOptions} callbacks={wordcloudCallbacks} size={wordcloudSize} />
    ),
    [],
  );

  return (
    <div className={styles.contextStyles}>
      <div className={styles.toggleButtonGroup}>
        <Button kind="ghost" size="sm" onClick={() => setShowDiagram(!showDiagram)}>
          {showDiagram ? 'Show Word Map' : 'Show Diagram'}
        </Button>

        <Button
          kind="ghost"
          size="sm"
          hasIconOnly
          renderIcon={Download}
          iconDescription="Export as PNG"
          onClick={showDiagram ? exportDiagram : exportWordcloud}
        />
      </div>

      {showDiagram ? (
        <div className={styles.reactFlowDiagram} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      ) : (
        <div className={styles.reactWordcloudContainer}>
          <div className={styles.reactWordcloud} ref={wordcloudRef}>
            {memoizedWordcloud}
          </div>
        </div>
      )}
    </div>
  );
};
