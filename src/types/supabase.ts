export interface ChatInstance {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  last_message_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  metadata?: {
    make_response_id?: string;
    error?: string;
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
    };
  };
};
