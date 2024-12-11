export interface ChatInstance {
  id: string;
  created_at: string; // Keep this as it's required by Supabase but we'll use empty string
  user_id: string;
  title: string;
  last_message_at: string; // Keep this as it's required by Supabase but we'll use empty string
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string; // Keep this as it's required by Supabase but we'll use empty string
  metadata?: {
    make_response_id?: string;
    error?: string;
  };
}

export interface N8NChatHistory {
  id: number;
  session_id: string;
  message: {
    type: 'human' | 'ai';
    content: string;
    tool_calls?: any[];
    additional_kwargs: Record<string, any>;
    response_metadata: Record<string, any>;
    invalid_tool_calls?: any[];
  };
}

export type Database = {
  public: {
    Tables: {
      chat_instances: {
        Row: ChatInstance;
        Insert: Omit<ChatInstance, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatInstance, 'id' | 'created_at' | 'user_id'>>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatMessage, 'id' | 'created_at' | 'chat_id'>>;
      };
      n8n_chat_histories: {
        Row: N8NChatHistory;
        Insert: Omit<N8NChatHistory, 'id'>;
        Update: Partial<Omit<N8NChatHistory, 'id'>>;
      };
    };
  };
};
