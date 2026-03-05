import React, { createContext, useContext, useState, useCallback } from 'react';

interface ChatbotContextType {
  isOpen: boolean;
  openChat: (initialMessage?: string) => void;
  closeChat: () => void;
  pendingMessage: string | null;
  consumePending: () => string | null;
}

const ChatbotContext = createContext<ChatbotContextType | null>(null);

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const openChat = useCallback((initialMessage?: string) => {
    if (initialMessage) setPendingMessage(initialMessage);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const consumePending = useCallback(() => {
    const msg = pendingMessage;
    setPendingMessage(null);
    return msg;
  }, [pendingMessage]);

  return (
    <ChatbotContext.Provider value={{ isOpen, openChat, closeChat, pendingMessage, consumePending }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = (): ChatbotContextType => {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error('useChatbot must be used within ChatbotProvider');
  return ctx;
};
