import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChatService } from '../services/chat';
import { ChatSession, Message, Resource } from '../types/chat';
import { useUser } from '@supabase/auth-helpers-react';

interface ChatContextType {
  currentSession: ChatSession | null;
  loading: boolean;
  error: string | null;
  sendMessage: (message: string, resourceIds?: string[]) => Promise<void>;
  createNewSession: (title: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useUser();

  const sendMessage = useCallback(async (message: string, resourceIds?: string[]) => {
    if (!currentSession) {
      throw new Error('No active chat session');
    }

    console.log('ChatContext: Sending message with resourceIds:', resourceIds);
    setLoading(true);
    setError(null);

    try {
      const response = await ChatService.sendMessage(message, currentSession.id, resourceIds);
      console.log('ChatContext: Received response:', response);
      
      setCurrentSession(prev => {
        if (!prev) return null;
        
        const updatedSession = {
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              role: 'user',
              content: message,
              createdAt: new Date().toISOString(),
              resourceIds
            },
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: response.message,
              createdAt: new Date().toISOString(),
              resourceIds
            }
          ]
        };
        console.log('ChatContext: Updated session:', updatedSession);
        return updatedSession;
      });
    } catch (err) {
      console.error('ChatContext: Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const createNewSession = useCallback(async (title: string) => {
    if (!user) {
      setError('You must be logged in to start a chat');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionId = await ChatService.createSession(title, user.id);
      const session = await ChatService.getSession(sessionId);
      setCurrentSession(session);
    } catch (err) {
      console.error('Error creating chat session:', err);
      setError('Failed to create chat session');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const session = await ChatService.getSession(sessionId);
      setCurrentSession(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ChatContext.Provider value={{
      currentSession,
      loading,
      error,
      sendMessage,
      createNewSession,
      loadSession
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
