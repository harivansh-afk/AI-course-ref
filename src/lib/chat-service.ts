import { supabase } from './supabase';
import type { ChatInstance, ChatMessage } from '../types/supabase';

export const chatService = {
  async createChatInstance(userId: string, title: string): Promise<ChatInstance | null> {
    const { data, error } = await supabase
      .from('chat_instances')
      .insert({
        user_id: userId,
        title,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat instance:', error);
      return null;
    }

    return data;
  },

  async getChatInstance(chatId: string): Promise<ChatInstance | null> {
    const { data, error } = await supabase
      .from('chat_instances')
      .select()
      .eq('id', chatId)
      .single();

    if (error) {
      console.error('Error fetching chat instance:', error);
      return null;
    }

    return data;
  },

  async updateChatTitle(chatId: string, title: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_instances')
      .update({ title })
      .eq('id', chatId);

    if (error) {
      console.error('Error updating chat title:', error);
      return false;
    }

    return true;
  },

  async getChatInstances(userId: string): Promise<ChatInstance[]> {
    const { data, error } = await supabase
      .from('chat_instances')
      .select()
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat instances:', error);
      return [];
    }

    return data;
  },

  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select()
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }

    return data;
  },

  async addMessage(
    chatId: string,
    content: string,
    role: 'user' | 'assistant',
    metadata?: ChatMessage['metadata']
  ): Promise<ChatMessage | null> {
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        content,
        role,
        metadata,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error adding message:', messageError);
      return null;
    }

    // Update last_message_at in chat instance
    const { error: updateError } = await supabase
      .from('chat_instances')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId);

    if (updateError) {
      console.error('Error updating chat instance:', updateError);
    }

    return message;
  },

  async deleteChatInstance(chatId: string): Promise<boolean> {
    // Delete all messages first
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('chat_id', chatId);

    if (messagesError) {
      console.error('Error deleting chat messages:', messagesError);
      return false;
    }

    // Then delete the chat instance
    const { error: instanceError } = await supabase
      .from('chat_instances')
      .delete()
      .eq('id', chatId);

    if (instanceError) {
      console.error('Error deleting chat instance:', instanceError);
      return false;
    }

    return true;
  },
};
