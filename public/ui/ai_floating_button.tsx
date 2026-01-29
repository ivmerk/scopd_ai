import React, { useState } from 'react';
import { EuiButtonIcon } from '@elastic/eui';
import {AiChatDialog, ChatMessage} from './ai_chat_dialog';
import { CoreStart } from '../../../../core/public';
import './ui.scss';

interface Props {
  http: CoreStart['http'];
}

export const AiFloatingButton: React.FC<Props> = ({ http }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [missingToken, setMissingToken] = useState(false);

  const handleReply = async () => {
    if (!inputValue) return;
    const currentPrompt = inputValue;
    setIsLoading(true);
    setError(null);
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', content: currentPrompt }]);

    try {
      const result = await http.post('/api/scopd-ai/ask', {
        body: JSON.stringify({ fullPrompt: currentPrompt, model: selectedModel }),
        headers: {
          'Content-Type': 'application/json',
          'kbn-xsrf': 'true'  // Required for OpenSearch Dashboards API requests
        },
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: result.answer }]);
    } catch (e: any) {
      const errorMessage = e.body?.message || e.message || 'Ошибка соединения с сервером';
      setError(errorMessage);
      console.error('Error in handleReply:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  const handleSaveToken = async (token: string) => {
    try {
      await http.post('/api/scopd-ai/token', {
        body: JSON.stringify({ token }),
        headers: {
          'Content-Type': 'application/json',
          'kbn-xsrf': 'true'
        },
      });
    } catch (e: any) {
      console.error('Error saving token:', e);
      setError('Failed to save settings: ' + (e.body?.message || e.message));
    }
  };

  const toggleOpen = async () => {
    if (!isOpen) {
      try {
        const result = await http.get('/api/scopd-ai/token');
        setMissingToken(!result.token);
      } catch (e) {
        setMissingToken(true);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
        }}
      >
        <EuiButtonIcon
          iconType="machineLearningApp"
          size="m"
          aria-label="Open AI Assistant"
          onClick={toggleOpen}
          style={{
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            backgroundColor: '#006BB4',
            color: 'white',
          }}
        />
      </div>

      {isOpen &&
      <AiChatDialog
        onClose={() => setIsOpen(false)}
        inputValue={inputValue}
        onInputChange={(e) => setInputValue(e.target.value)}
        onSend={handleReply}
        onClear={handleClear}
        isLoading={isLoading}
        error={error}
        messages={messages}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onSaveToken={handleSaveToken}
        initialSettingsOpen={missingToken}
      />
      }
    </>
  );
};
