import { supabase } from './supabase';
import type { ChatInstance, ChatMessage } from '../types/supabase';
import OpenAI from 'openai';

// Error types
class ChatError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ChatError';
    this.status = status;
    this.code = code;
  }

  static fromOpenAIError(error: OpenAI.APIError): ChatError {
    return new ChatError(
      error.message,
      error.status,
      error.code
    );
  }

  static fromError(error: unknown): ChatError {
    if (error instanceof ChatError) {
      return error;
    }
    if (error instanceof OpenAI.APIError) {
      return ChatError.fromOpenAIError(error);
    }
    if (error instanceof Error) {
      return new ChatError(error.message);
    }
    return new ChatError('Unknown error occurred');
  }
}

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_REQUESTS: 5, // Increased to 5 requests per minute
  WINDOW_MS: 60000, // 1 minute window
  MIN_DELAY: 1000, // Reduced to 1 second between requests
};

// Rate limiting state
let requestTimestamps: number[] = [];
let lastRequestTime = 0;

// Helper function to check and enforce rate limits
const enforceRateLimit = async () => {
  const now = Date.now();

  // Clean up old timestamps
  requestTimestamps = requestTimestamps.filter(
    time => now - time < RATE_LIMIT.WINDOW_MS
  );

  // Check if we've hit the rate limit
  if (requestTimestamps.length >= RATE_LIMIT.MAX_REQUESTS) {
    const oldestRequest = requestTimestamps[0];
    const timeToWait = RATE_LIMIT.WINDOW_MS - (now - oldestRequest);
    throw new ChatError(
      `Please wait ${Math.ceil(timeToWait / 1000)} seconds before sending another message.`,
      429,
      'rate_limit_exceeded'
    );
  }

  // Enforce minimum delay between requests with exponential backoff
  const timeSinceLastRequest = now - lastRequestTime;
  const requiredDelay = Math.min(
    RATE_LIMIT.MIN_DELAY * Math.pow(1.5, requestTimestamps.length),
    5000 // Cap at 5 seconds
  );

  if (timeSinceLastRequest < requiredDelay) {
    await new Promise(resolve => setTimeout(resolve, requiredDelay - timeSinceLastRequest));
  }

  // Update state
  requestTimestamps.push(now);
  lastRequestTime = now;
};

// Initialize OpenAI with error checking
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OpenAI API key is not configured in environment variables');
}

// Verify API key format
if (!apiKey.startsWith('sk-')) {
  throw new Error('Invalid OpenAI API key format. Key should start with "sk-"');
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

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
    try {
      // Save the initial message
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

      // If this is a user message, generate and save AI response
      if (role === 'user') {
        try {
          // Enforce rate limit before making API call
          await enforceRateLimit();

          // Get chat history
          const { data: history } = await supabase
            .from('chat_messages')
            .select()
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

          // If resources are selected, fetch their content
          let resourceContext = '';
          if (metadata?.selectedResources?.length > 0) {
            const { data: resources } = await supabase
              .from('study_resources')
              .select('*')
              .in('id', metadata.selectedResources);

            if (resources && resources.length > 0) {
              // Build context from resources
              resourceContext = 'Here are the relevant study resources:\n\n';
              
              for (const resource of resources) {
                resourceContext += `[${resource.title || resource.file_path}]\n`;
                
                if (resource.resource_type === 'file' && resource.file_path) {
                  try {
                    // Download file content
                    const { data: fileData, error: downloadError } = await supabase.storage
                      .from('study-materials')
                      .download(resource.file_path);

                    if (downloadError) throw downloadError;

                    // Convert file content to text
                    if (fileData) {
                      if (resource.file_type?.includes('text') || resource.file_path.endsWith('.txt')) {
                        const content = await fileData.text();
                        resourceContext += content + '\n\n';
                      } else if (resource.file_type?.includes('pdf')) {
                        resourceContext += 'PDF content extraction not implemented yet\n\n';
                      }
                    }
                  } catch (error) {
                    console.error(`Error loading content for resource ${resource.id}:`, error);
                    resourceContext += `Error loading content: ${error.message}\n\n`;
                  }
                } else if (resource.resource_type === 'link') {
                  resourceContext += `URL: ${resource.url}\n\n`;
                }
              }
            }
          }

          // Create completion with OpenAI
          const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
              {
                role: "system",
                content: "You are an advanced AI study assistant powered by GPT-4 Turbo. You have enhanced capabilities including understanding complex topics, providing detailed explanations, and analyzing various types of content. You can process and discuss text documents, code, and structured data. Use your capabilities to provide comprehensive assistance while studying."
              },
              // Add resource context if available
              ...(resourceContext ? [{
                role: "system",
                content: resourceContext
              }] : []),
              ...(history?.map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content
              })) || []),
              { role: "user", content }
            ],
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
          });

          const aiResponse = completion.choices[0].message.content || '';

          // Store the assistant's response
          const { data: message, error: insertError } = await supabase
            .from('chat_messages')
            .insert({
              chat_id: chatId,
              content: aiResponse,
              role: 'assistant',
              metadata: { model: 'gpt-4-turbo-preview' }
            })
            .select()
            .single();

          if (insertError) {
            throw new ChatError('Failed to save AI response', 500, 'database_error');
          }

          // Update chat's last message timestamp
          await supabase
            .from('chat_instances')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', chatId);

          return message;
        } catch (error) {
          const chatError = ChatError.fromError(error);

          // Handle rate limit and quota errors gracefully
          let fallbackMessage = "The system is temporarily busy. Please try again in a few seconds.";

          if (error instanceof OpenAI.APIError) {
            if (error.status === 429) {
              if (error.message.includes('quota')) {
                fallbackMessage = "The API quota has been exceeded. Please try again in a few minutes.";
              } else {
                fallbackMessage = `The system is processing too many requests. Please wait 10-15 seconds before trying again.`;
              }
            } else if (error.status === 500) {
              fallbackMessage = "There was a temporary server error. Please try again.";
            } else if (error.status === 503) {
              fallbackMessage = "The service is temporarily unavailable. Please try again in a moment.";
            }
          }

          // Save fallback response with improved metadata
          const { data: fallbackResponse } = await supabase
            .from('chat_messages')
            .insert({
              chat_id: chatId,
              content: fallbackMessage,
              role: 'assistant',
              metadata: {
                fallback: true,
                error: chatError.message,
                errorCode: chatError.code,
                errorStatus: chatError.status,
                retryAfter: error instanceof OpenAI.APIError ? error.headers?.['retry-after'] : undefined
              }
            })
            .select()
            .single();

          return fallbackResponse;
        }
      }

      return message;
    } catch (error) {
      const chatError = error instanceof ChatError ? error : new ChatError(
        error instanceof Error ? error.message : 'Unknown error'
      );
      console.error('Error in addMessage:', chatError);
      throw chatError;
    }
  },

  async deleteChatInstance(chatId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_instances')
      .delete()
      .eq('id', chatId);

    if (error) {
      console.error('Error deleting chat instance:', error);
      return false;
    }

    return true;
  }
};
