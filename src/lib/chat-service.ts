import type { ChatInstance, ChatMessage } from '../types/supabase';

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
const sendToN8N = async (sessionId: string, message: string): Promise<N8NResponse> => {
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
      const chats = getFromStorage<ChatInstance>('chat_instances');
      return chats
        .filter(chat => chat.user_id === userId)
        .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    } catch (error) {
      console.error('Error fetching chat instances:', error);
      return [];
    }
  },

  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const messages = getFromStorage<ChatMessage>('chat_messages');
      return messages
        .filter(message => message.chat_id === chatId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
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
        created_at: new Date().toISOString(),
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
              created_at: new Date().toISOString(),
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
            created_at: new Date().toISOString(),
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

      // Update last_message_at in chat instance
      const chats = getFromStorage<ChatInstance>('chat_instances');
      const chatIndex = chats.findIndex(chat => chat.id === chatId);
      if (chatIndex !== -1) {
        chats[chatIndex].last_message_at = new Date().toISOString();
        setInStorage('chat_instances', chats);
      }

      // Return all messages for this chat
      const updatedMessages = messages.filter(msg => msg.chat_id === chatId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      console.log('Returning updated messages:', updatedMessages);
      return updatedMessages;
    } catch (error) {
      console.error('Error adding message:', error);
      return [];
    }
  },

  async deleteChatInstance(chatId: string): Promise<boolean> {
    try {
      // Delete all messages for this chat
      const messages = getFromStorage<ChatMessage>('chat_messages');
      const filteredMessages = messages.filter(message => message.chat_id !== chatId);
      setInStorage('chat_messages', filteredMessages);

      // Delete the chat instance
      const chats = getFromStorage<ChatInstance>('chat_instances');
      const filteredChats = chats.filter(chat => chat.id !== chatId);
      setInStorage('chat_instances', filteredChats);

      return true;
    } catch (error) {
      console.error('Error deleting chat instance:', error);
      return false;
    }
  },
};
