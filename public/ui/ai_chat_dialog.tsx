import React, {useEffect, useRef, useState} from 'react';
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
  EuiCallOut,
  EuiButtonEmpty,
  EuiSelect,
  EuiPopover,
  EuiFormRow,
  EuiFieldPassword,
  EuiFilePicker,
  EuiBadge,
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
  onSaveToken: (token: string) => Promise<void>;
  initialSettingsOpen?: boolean;
  selectedImages: File[];
  onImagesChange: (files: File[]) => void;
  isFullWidth: boolean;
  onToggleFullWidth: () => void;
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
  onSaveToken, initialSettingsOpen = false,
  selectedImages,
  onImagesChange,
  isFullWidth,
  onToggleFullWidth
}) => {

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [filePickerKey, setFilePickerKey] = useState(0);

  const handleSaveToken = async () => {
    await onSaveToken(newToken);
    setNewToken('');
    setIsSettingsOpen(initialSettingsOpen);
  };


  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!supportsImages(selectedModel)) return;
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      onImagesChange([...selectedImages, ...files]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const onFilePickerChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      onImagesChange([...selectedImages, ...Array.from(files)]);
      setFilePickerKey((prev) => prev + 1);
    }
  };

  const supportsImages = (model: string) => {
    return model === 'gpt-4o' || model === 'gpt-4o-mini' || model === 'gpt-5.2';
  };

  const renderWithLinks = (text: string): React.ReactNode => {
    const regex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)|https?:\/\/[^\s<>"'\)\]]+/g;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(text.slice(lastIndex, match.index));
      }
      if (match[1] !== undefined) {
        nodes.push(<a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer">{match[1]}</a>);
      } else {
        nodes.push(<a key={key++} href={match[0]} target="_blank" rel="noopener noreferrer">{match[0]}</a>);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      nodes.push(text.slice(lastIndex));
    }
    return <>{nodes}</>;
  };

  useEffect(() =>{
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages, isLoading, error])
  return (
    <EuiFlyout
      onClose={onClose}
      size={isFullWidth ? '100%' : 's'}
      aria-labelledby="aiChatDialogTitle"
    >
      <EuiFlyoutHeader hasBorder>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" responsive={false}>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h4 id="aiChatDialogTitle"  style={{ whiteSpace: 'nowrap', fontSize: '14px'}}>AI Assistant</h4>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{minWidth: '90px'}}>
            <EuiSelect
              options={[
                { value: 'gpt-4o-mini', text: '4o-mini' },
                { value: 'gpt-4o', text: '4o' },
                { value: 'gpt-5.2', text: 'gpt-5.2' },
              ]}
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              compressed
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              iconType={isFullWidth ? 'minimize' : 'fullScreen'}
              color="text"
              size="s"
              onClick={onToggleFullWidth}
              aria-label={isFullWidth ? 'Collapse' : 'Expand'}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty iconType="trash" color="text" size="s" onClick={onClear}>
              Clear
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiPopover
              button={
                <EuiButtonEmpty
                  iconType="gear"
                  color="text"
                  size="s"
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                >
                </EuiButtonEmpty>
              }
              isOpen={isSettingsOpen}
              closePopover={() => setIsSettingsOpen(false)}
              anchorPosition="downRight"
            >
              <div style={{ padding: '16px', width: '300px' }}>
                <EuiTitle size="xs"><h3>API Settings</h3></EuiTitle>
                <EuiSpacer size="s" />
                <EuiFormRow label="OpenAI Token" helpText="Token will be saved securely on the server.">
                  <EuiFieldPassword
                    value={newToken}
                    onChange={(e) => setNewToken(e.target.value)}
                    placeholder="sk-..."
                  />
                </EuiFormRow>
                <EuiSpacer size="s" />
                <EuiButton fullWidth size="s" fill onClick={handleSaveToken}>Save Token</EuiButton>
              </div>
            </EuiPopover>
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
                  <EuiText size="s">
                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}>
                      {renderWithLinks(msg.content)}
                    </div>
                  </EuiText>
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
        {supportsImages(selectedModel) && (
          <EuiFormRow label="Attach Images" fullWidth>
            <>
              {selectedImages.length > 0 && (
                <EuiFlexGroup wrap responsive={false} gutterSize="xs" style={{ marginBottom: '8px' }}>
                  {selectedImages.map((file, i) => (
                    <EuiFlexItem grow={false} key={i}>
                      <EuiBadge
                        iconType="cross"
                        iconSide="right"
                        iconOnClick={() => removeImage(i)}
                        iconOnClickAriaLabel="Remove image"
                      >
                        {file.name}
                      </EuiBadge>
                    </EuiFlexItem>
                  ))}
                </EuiFlexGroup>
              )}
              <EuiFilePicker
                key={filePickerKey}
                multiple
                display="default"
                initialPromptText={selectedImages.length > 0 ? "Add more images" : "Select images"}
                onChange={onFilePickerChange}
              />
            </>
          </EuiFormRow>
        )}
        <EuiFlexGroup gutterSize="s">
          <EuiFlexItem>
            <EuiTextArea
              placeholder="Type your message or paste an image from clipboard..."
              value={inputValue}
              onChange={onInputChange}
              fullWidth
              onPaste={handlePaste}
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

