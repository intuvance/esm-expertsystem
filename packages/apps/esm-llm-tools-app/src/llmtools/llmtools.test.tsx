import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { type AppProps } from 'single-spa';
import { render, screen } from '@testing-library/react';
import Root from './llmtools.component';

vi.mock('./import-map.component', () => ({
  __esModule: true,
  default: () => <div role="chat">Mock Import Map</div>,
  importMapOverridden: false,
}));

const defaultProps: AppProps = {
  name: '@intuvance/esm-expertsystem-app-page-0',
  singleSpa: {},
  mountParcel: vi.fn(),
};

describe('LlmTools', () => {
  beforeEach(() => {
    localStorage.clear();
    delete window.spaEnv;
    vi.resetModules();
  });

  describe('Root component', () => {
    it('should not render LlmTools in production without the llmtools localStorage flag', () => {
      window.spaEnv = 'production';

      const { container } = render(<Root {...defaultProps} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should render LlmTools in development environments', () => {
      window.spaEnv = 'development';

      render(<Root {...defaultProps} />);

      expect(screen.getByRole('button', { name: '{···}' })).toBeInTheDocument();
    });

    it('should render LlmTools when the llmtools localStorage flag is set', () => {
      localStorage.setItem('openmrs:llmtools', 'true');

      render(<Root {...defaultProps} />);

      expect(screen.getByRole('button', { name: '{···}' })).toBeInTheDocument();
    });
  });

  describe('LlmTools component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
      window.spaEnv = 'development';
    });

    it('should toggle LlmToolsPopup when clicking trigger button', async () => {
      render(<Root {...defaultProps} />);

      const triggerButton = screen.getByRole('button', { name: '{···}' });
      // Initially, popup should not be present
      expect(screen.queryByRole('chat')).not.toBeInTheDocument();

      // Click to open
      await user.click(triggerButton);
      expect(screen.getByRole('chat')).toBeInTheDocument();

      // Click to close
      await user.click(triggerButton);
      expect(screen.queryByRole('chat')).not.toBeInTheDocument();
    });
  });
});
