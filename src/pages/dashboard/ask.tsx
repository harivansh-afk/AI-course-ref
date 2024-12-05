import React, { useState } from 'react';
import { Send, Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';

function AskQuestion() {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle question submission
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ask a Question</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg bg-card p-6 shadow-sm">
          <label className="block">
            <span className="text-sm font-medium text-foreground">
              What would you like to know?
            </span>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-input px-4 py-2 focus:border-primary focus:ring-primary"
              rows={4}
              placeholder="Type your question here..."
            />
          </label>
        </div>

        <div className="rounded-lg bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Upload Study Materials (Optional)
            </span>
            <Button variant="secondary" type="button" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full gap-2">
          <Send className="h-5 w-5" />
          Submit Question
        </Button>
      </form>
    </div>
  );
}

export default AskQuestion;
