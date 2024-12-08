import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
import type { ChatMessage } from '../../types/supabase';
import type { Components } from 'react-markdown';

interface MessageProps {
  message: ChatMessage;
}

interface CodeBlockProps {
  language: string;
  value: string;
}

export function Message({ message }: MessageProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CodeBlock = React.memo(({ language, value }: CodeBlockProps) => (
    <div className="relative">
      <div className="absolute right-2 top-2 z-10">
        <Tooltip content={copied ? 'Copied!' : 'Copy code'}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleCopy(value)}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </Tooltip>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vs}
        customStyle={{ margin: 0 }}
        PreTag="div"
      >
        {value.replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  ));

  const code: Components['code'] = ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const value = String(children).replace(/\n$/, '');

    if (!className) {
      return (
        <code className="rounded bg-muted-foreground/20 px-1 py-0.5" {...props}>
          {children}
        </code>
      );
    }

    return <CodeBlock language={language} value={value} />;
  };

  return (
    <div
      className={cn(
        'group flex w-full gap-3 px-4',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.role === 'assistant' && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs font-medium">
            AI
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col gap-2 max-w-3xl">
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 text-sm',
            message.role === 'user'
              ? 'bg-blue-500 text-white'
              : 'bg-muted/50 shadow-sm border border-border/50'
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className={cn(
              'prose max-w-none',
              message.role === 'user' ? 'prose-invert' : 'prose-stone dark:prose-invert'
            )}
            components={{
              code
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {message.role === 'user' && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
