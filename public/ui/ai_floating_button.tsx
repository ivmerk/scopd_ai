import React, { useState } from 'react';
import {
  EuiButtonIcon,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiTitle,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { CoreSetup } from '../../../../src/core/public';

interface Props {
  core: CoreSetup;
}

export const AiFloatingButton: React.FC<Props> = ({ core }) => { 
  console.log('AiFloatingButton mounted with core:', core);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <EuiButtonIcon
          iconType="help"
          aria-label="AI Assistant"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            backgroundColor: '#006BB4',
            color: 'white',
            borderRadius: '50%',
            width: '50px',
            height: '50px'
          }}
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      {isOpen && (
        <EuiFlyout
          ownFocus
          onClose={() => setIsOpen(false)}
          size="s"
          aria-labelledby="scopdAiFlyout"
        >
          <EuiFlyoutHeader>
            <EuiTitle size="s">
              <h2 id="scopdAiFlyout">AI Assistant</h2>
            </EuiTitle>
          </EuiFlyoutHeader>

          <EuiFlyoutBody>
            <EuiText size="s">
              <p>Ask about alerts, rules, or investigations.</p>
            </EuiText>

            <EuiSpacer />

            {/* TODO: chat UI / actions */}
            <EuiText color="subdued">
              <small>Coming soon…</small>
            </EuiText>
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </>
  );
};
