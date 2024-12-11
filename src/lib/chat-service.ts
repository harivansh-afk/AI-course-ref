import type { ChatInstance, ChatMessage, N8NChatHistory } from '../types/supabase';
import { supabase } from './supabase';

// Helper function to generate UUIDs
const generateId = () => crypto.randomUUID();

// Helper functions for localStorage
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setInStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// N8N webhook configuration
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

// Define the expected response type from n8n RAG workflow
interface N8NResponse {
  success: boolean;
  response: {
    content: string;
    role: 'assistant';
    metadata?: {
      sources?: string[];
      error?: string;
    };
  };
}

// Function to send message to n8n webhook and handle response
export const sendToN8N = async (sessionId: string, message: string): Promise<N8NResponse> => {
  try {
    console.log('Sending message to n8n:', { sessionId, message });

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        action: 'sendMessage',
        chatInput: message
      })
    });

    console.log('Raw n8n response:', response);

    if (!response.ok) {
      throw new Error(`N8N webhook error: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Parsed n8n response:', responseData);

    return responseData;
  } catch (error) {
    console.error('Error sending message to n8n:', error);
    return {
      success: false,
      response: {
        content: 'Sorry, I encountered an error processing your request.',
        role: 'assistant',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    };
  }
};

// Helper function to group messages by session and create chat instances
const createChatInstanceFromMessages = (messages: N8NChatHistory[]): ChatInstance[] => {
  const sessionMap = new Map<string, N8NChatHistory[]>();
  
  // Group messages by session_id
  messages.forEach(msg => {
    const existing = sessionMap.get(msg.session_id) || [];
    sessionMap.set(msg.session_id, [...existing, msg]);
  });

  // Convert each session group into a ChatInstance
  return Array.from(sessionMap.entries()).map(([sessionId, messages]) => {
    const sortedMessages = messages.sort((a, b) => a.id - b.id);
    const firstMessage = sortedMessages[0];
    
    return {
      id: sessionId,
      created_at: '',
      user_id: 'system',
      title: firstMessage.message.content.slice(0, 50) + '...',
      last_message_at: '',
    };
  });
};

interface ChatStats {
  messageCount: number;
  firstMessage: string;
  lastMessage: string;
  humanMessages: number;
  aiMessages: number;
}

export const chatService = {
  async createChatInstance(userId: string, title: string): Promise<ChatInstance | null> {
    try {
      const chatInstance: ChatInstance = {
        id: generateId(),
        created_at: new Date().toISOString(),
        user_id: userId,
        title,
        last_message_at: new Date().toISOString(),
      };

      const chats = getFromStorage<ChatInstance>('chat_instances');
      chats.push(chatInstance);
      setInStorage('chat_instances', chats);

      return chatInstance;
    } catch (error) {
      console.error('Error creating chat instance:', error);
      return null;
    }
  },

  async getChatInstance(chatId: string): Promise<ChatInstance | null> {
    try {
      const chats = getFromStorage<ChatInstance>('chat_instances');
      return chats.find(chat => chat.id === chatId) || null;
    } catch (error) {
      console.error('Error fetching chat instance:', error);
      return null;
    }
  },

  async updateChatTitle(chatId: string, title: string): Promise<boolean> {
    try {
      const chats = getFromStorage<ChatInstance>('chat_instances');
      const chatIndex = chats.findIndex(chat => chat.id === chatId);

      if (chatIndex === -1) return false;

      chats[chatIndex].title = title;
      setInStorage('chat_instances', chats);

      return true;
    } catch (error) {
      console.error('Error updating chat title:', error);
      return false;
    }
  },

  async getChatInstances(userId: string): Promise<ChatInstance[]> {
    try {
      const { data: messages, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      
      return createChatInstanceFromMessages(messages);
    } catch (error) {
      console.error('Error fetching chat instances:', error);
      return [];
    }
  },

  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const { data: messages, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', chatId)
        .order('id', { ascending: true });

      if (error) throw error;

      // Convert N8NChatHistory to ChatMessage format
      return messages.map(msg => ({
        id: msg.id.toString(),
        chat_id: msg.session_id,
        content: msg.message.content,
        role: msg.message.type === 'human' ? 'user' : 'assistant',
        created_at: new Date(msg.id).toISOString(), // Using id as timestamp approximation
        metadata: {
          ...msg.message.response_metadata,
          ...msg.message.additional_kwargs
        }
      }));
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  },

  async addMessage(
    chatId: string,
    content: string,
    role: 'user' | 'assistant',
    metadata?: ChatMessage['metadata']
  ): Promise<ChatMessage[]> {
    try {
      // Create and save the user message
      const userMessage: ChatMessage = {
        id: generateId(),
        chat_id: chatId,
        content,
        role,
        created_at: '', // Empty string for timestamp
        metadata,
      };

      let messages = getFromStorage<ChatMessage>('chat_messages');
      messages.push(userMessage);
      setInStorage('chat_messages', messages);

      // If it's a user message, send to n8n and create assistant message
      if (role === 'user') {
        try {
          const n8nResponse = await sendToN8N(chatId, content);
          console.log('Creating assistant message with n8n response:', n8nResponse);

          if (n8nResponse.success && n8nResponse.response) {
            // Create and save the assistant's response
            const assistantMessage: ChatMessage = {
              id: generateId(),
              chat_id: chatId,
              content: n8nResponse.response.content,
              role: 'assistant',
              created_at: '', // Empty string for timestamp
              metadata: {
                ...n8nResponse.response.metadata,
                make_response_id: userMessage.id // Link to the user's message
              }
            };

            messages = getFromStorage<ChatMessage>('chat_messages');
            messages.push(assistantMessage);
            setInStorage('chat_messages', messages);
            console.log('Assistant message saved:', assistantMessage);
          } else {
            throw new Error('Invalid response format from n8n');
          }
        } catch (n8nError) {
          console.error('Failed to get response from n8n:', n8nError);
          // Add an error message if n8n fails
          const errorMessage: ChatMessage = {
            id: generateId(),
            chat_id: chatId,
            content: 'Sorry, I encountered an error processing your request.',
            role: 'assistant',
            created_at: '', // Empty string for timestamp
            metadata: {
              error: 'Failed to process message',
              make_response_id: userMessage.id
            }
          };
          messages = getFromStorage<ChatMessage>('chat_messages');
          messages.push(errorMessage);
          setInStorage('chat_messages', messages);
        }
      }

      // Return all messages for this chat
      const updatedMessages = messages.filter(msg => msg.chat_id === chatId)
        .sort((a, b) => messages.indexOf(a) - messages.indexOf(b)); // Sort by order of addition
      console.log('Returning updated messages:', updatedMessages);
      return updatedMessages;
    } catch (error) {
      console.error('Error adding message:', error);
      return [];
    }
  },

  async getChatStats(chatId: string): Promise<ChatStats | null> {
    try {
      const { data: messages, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', chatId)
        .order('id', { ascending: true });

      if (error) throw error;
      if (!messages || messages.length === 0) return null;

      const stats: ChatStats = {
        messageCount: messages.length,
        firstMessage: messages[0].message.content,
        lastMessage: messages[messages.length - 1].message.content,
        humanMessages: messages.filter(m => m.message.type === 'human').length,
        aiMessages: messages.filter(m => m.message.type === 'ai').length
      };

      return stats;
    } catch (error) {
      console.error('Error getting chat stats:', error);
      return null;
    }
  },

  async deleteChatInstance(chatId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('n8n_chat_histories')
        .delete()
        .eq('session_id', chatId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting chat instance:', error);
      return false;
    }
  },
};
