import React from 'react';
import { MessageSquare } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  timestamp: Date;
}

interface QuestionListProps {
  questions: Question[];
}

export function QuestionList({ questions }: QuestionListProps) {
  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div
          key={question.id}
          className="flex items-start space-x-4 rounded-lg border p-4 hover:bg-muted/50"
        >
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-medium">{question.text}</p>
            <p className="text-sm text-muted-foreground">
              {question.timestamp.toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
