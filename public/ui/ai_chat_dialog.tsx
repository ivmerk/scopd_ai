import React, {useEffect, useRef} from 'react';
import {
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
  EuiButtonEmpty,
  EuiSelect,
} from '@elastic/eui';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface AiChatDialogProps {
  onClose: () => void;
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onClear: () => void;
  isLoading: boolean;
  error: string | null;
  messages: ChatMessage[];
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const AiChatDialog: React.FC<AiChatDialogProps> = ({
  onClose,
  inputValue,
  onInputChange,
  onSend,
  onClear,
  isLoading,
  error,
  messages,
  selectedModel,
  onModelChange,
}) => {

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() =>{
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages, isLoading, error])
  return (
    <EuiFlyout
      onClose={onClose}
      size="s"
      aria-labelledby="aiChatDialogTitle"
    >
      <EuiFlyoutHeader hasBorder>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" responsive={false}>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h4 id="aiChatDialogTitle"  style={{ whiteSpace: 'nowrap', fontSize: '14px'}}>AI Assistant</h4>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSelect
              options={[
                { value: 'gpt-4o-mini', text: '4o-mini' },
                { value: 'gpt-4o', text: '4o' },
                { value: 'o1-mini', text: 'o1-mini' },
              ]}
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              compressed
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty iconType="trash" color="text" size="s" onClick={onClear}>
              Clear chat
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        {error && (
          <>
            <EuiCallOut
              title="Error"
              color="danger"
              iconType="alert"
            >
              <p>{error}</p>
            </EuiCallOut>
            <EuiSpacer />
          </>
        )}

        {messages.length > 0 ? (
          messages.map((msg, index) => (
             <React.Fragment key={index}>
               <EuiText size="xs" color="subdued" textAlign={msg.role === 'user' ? 'right' : 'left'}>
                 <strong>{msg.role === 'user' ? 'You' : 'AI'}</strong>
               </EuiText>
               <EuiSpacer size="xs" />
               {msg.role === 'user' ? (
                 <EuiPanel paddingSize="s" color="subdued" hasShadow={false} style={{ marginLeft: '15%' }}>
                  <EuiText size="s"><p>{msg.content}</p></EuiText>
                </EuiPanel>
               ) : (
                 <EuiPanel paddingSize="s" hasShadow={false} style={{ marginRight: '5%' }}>
                  <EuiCodeBlock
                    isCopyable={true}
                    language="markdown"
                    fontSize="m"
                    paddingSize="s"
                    overflowHeight={500}
                    whiteSpace="pre-wrap"
                  >
                    {msg.content}
                  </EuiCodeBlock>
                 </EuiPanel>
               )}
               <EuiSpacer size="m" />
             </React.Fragment>
          ))

        ) : (
          <EuiText color="subdued" textAlign="center">
            <p>How can I help you today?</p>
          </EuiText>
        )}
        <div ref={messagesEndRef} />
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiFlexGroup gutterSize="s">
          <EuiFlexItem>
            <EuiTextArea
              placeholder="Type your message..."
              value={inputValue}
              onChange={onInputChange}
              fullWidth
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              disabled={isLoading}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              onClick={onSend}
              fill
              isLoading={isLoading}
              disabled={!inputValue.trim()}
            >
              Send
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
};
