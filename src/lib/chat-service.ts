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
  ): Promise<ChatMessage | null> {
    try {
      const message: ChatMessage = {
        id: generateId(),
        chat_id: chatId,
        content,
        role,
        created_at: new Date().toISOString(),
        metadata,
      };

      const messages = getFromStorage<ChatMessage>('chat_messages');
      messages.push(message);
      setInStorage('chat_messages', messages);

      // Update last_message_at in chat instance
      const chats = getFromStorage<ChatInstance>('chat_instances');
      const chatIndex = chats.findIndex(chat => chat.id === chatId);
      if (chatIndex !== -1) {
        chats[chatIndex].last_message_at = new Date().toISOString();
        setInStorage('chat_instances', chats);
      }

      return message;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
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
