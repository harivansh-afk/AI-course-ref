export interface Question {
  id: string;
  text: string;
  timestamp: Date;
  answer?: string;
}

export interface User {
  name: string;
  email: string;
}