export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  resourceIds?: string[]; // References to resources mentioned in the message
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  user_id: string;
}

export interface Resource {
  id: string;
  title: string;
  resource_type: 'file' | 'link';
  file_path?: string;
  url?: string;
  created_at: string;
  user_id: string;
  content?: string;
}

export interface ChatResponse {
  message: string;
  relatedResources?: Resource[];
}
