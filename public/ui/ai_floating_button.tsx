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
  EuiPanel,
  EuiCodeBlock,
  EuiCallOut,
} from '@elastic/eui';
import { CoreStart } from '../../../../core/public';
import './ui.scss';

interface Props {
  http: CoreStart['http'];
}

export const AiFloatingButton: React.FC<Props> = ({ http }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReply = async () => {
    if (!inputValue) return;
    setIsLoading(true);
    setError(null);
    setAiResponse('');
    try {
      const result = await http.post('/api/scopd-ai/ask', {
        fullPrompt: inputValue
      });
      setAiResponse(result.answer);
    } catch (e: any) {
      setError(e.message || 'Ошибка соединения с сервером');
      console.error('Error in handleReply:', e);
    } finally {
      setIsLoading(false);
      setInputValue('');
    }
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

            {error && (
              <EuiCallOut title="Ошибка" color="danger" iconType="alert">
                <p>{error}</p>
              </EuiCallOut>
            )}
            {aiResponse && (
              <EuiPanel color="subdued">
                <EuiTitle size="s"><h3>Анализ AI:</h3></EuiTitle>
                <EuiSpacer size="s" />
                <EuiCodeBlock
                  language="markdown"
                  paddingSize="m"
                  isCopyable
                  whiteSpace="pre-wrap">
                  {aiResponse}
                </EuiCodeBlock>
              </EuiPanel>
            )}
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
