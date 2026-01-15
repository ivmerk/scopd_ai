import React, { useState } from 'react';
import {
  EuiButtonIcon,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiTitle,
  EuiSpacer,
  EuiText,
  EuiFlyoutFooter,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTextArea,
  EuiButton,
} from '@elastic/eui';
import { CoreSetup } from '../../../../src/core/public';
import './ui.scss';

interface Props {
  core: CoreSetup;
}

export const AiFloatingButton: React.FC<Props> = ({ core }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleReply = () => {
    console.log('Reply submitted:', inputValue);
    setInputValue('');
  };

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
          className="aiFloatingButton"

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
            <EuiFlyoutFooter>
             <EuiFlexGroup responsive={false} alignItems="flexEnd">
              <EuiFlexItem>
                <EuiTextArea
                  fullWidth
                  placeholder="Ask the AI assistant..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  rows={3}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton fill onClick={handleReply} disabled={!inputValue}>
                  Reply
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlyoutFooter>
        </EuiFlyout>
      )}
    </>
  );
};
