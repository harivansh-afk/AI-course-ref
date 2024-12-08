import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
import type { ChatMessage } from '../../types/supabase';

interface MessageProps {
  message: ChatMessage;
  onFeedback?: (messageId: string, isPositive: boolean) => void;
}

export function Message({ message, onFeedback }: MessageProps) {
  const [copied, setCopied] = React.useState(false);
  const [feedback, setFeedback] = React.useState<'positive' | 'negative' | null>(null);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (isPositive: boolean) => {
    if (!onFeedback) return;
    setFeedback(isPositive ? 'positive' : 'negative');
    onFeedback(message.id, isPositive);
  };

  return (
    <div
      className={cn(
        'group flex w-full gap-3 px-4',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.role === 'assistant' && (
        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-medium">
            AI
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex flex-col gap-2 max-w-3xl">
        <div
          className={cn(
            'relative rounded-lg px-4 py-3 text-sm',
            message.role === 'user'
              ? 'bg-primary text-primary-foreground shadow-sm'
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
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                
                if (inline) {
                  return (
                    <code className="rounded bg-muted-foreground/20 px-1 py-0.5" {...props}>
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="relative">
                    <div className="absolute right-2 top-2 z-10">
                      <Tooltip content={copied ? 'Copied!' : 'Copy code'}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleCopy(String(children))}
                          asChild={false}
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
                      style={vscDarkPlus}
                      customStyle={{ margin: 0 }}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
          
          {message.role === 'assistant' && onFeedback && (
            <div className="flex items-center gap-1">
              <Tooltip content="Helpful">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 w-6 p-0 hover:bg-background/80',
                    feedback === 'positive' && 'text-primary'
                  )}
                  onClick={() => handleFeedback(true)}
                  asChild={false}
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
              </Tooltip>
              <Tooltip content="Not helpful">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 w-6 p-0 hover:bg-background/80',
                    feedback === 'negative' && 'text-destructive'
                  )}
                  onClick={() => handleFeedback(false)}
                  asChild={false}
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {message.role === 'user' && (
        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
