export interface ChatInstance {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  metadata?: {
    model?: string;
    type?: 'text' | 'image' | 'pdf' | 'link';
    url?: string;
    fileType?: string;
    fileName?: string;
  };
}

export interface Resource {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  content?: string;
  url?: string;
  file_path?: string;
  resource_type: 'file' | 'link' | 'text';
  metadata?: {
    fileType?: string;
    fileName?: string;
    size?: number;
    lastModified?: string;
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
