import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { ThumbsUp, ThumbsDown, Copy, Check, User, Bot, Wrench } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { Separator } from '../ui/separator';
import type { ChatMessage } from '../../types/supabase';

interface MessageProps {
  message: ChatMessage;
  isLast?: boolean;
}

function extractUsedTools(content: string): { cleanContent: string; usedTools: string[] } {
  const toolRegex = /^\*\*Used Tools?:([^*]+)\*\*\n\n/;
  const match = content.match(toolRegex);

  if (match) {
    const toolsString = match[1].trim();
    // Simply split by newlines and clean up each line
    const usedTools = toolsString
      .split('\n')
      .map(tool => tool.trim())
      .filter(tool => tool.length > 0);

    const cleanContent = content.replace(toolRegex, '');
    return { cleanContent, usedTools };
  }

  return { cleanContent: content, usedTools: [] };
}

export const Message: React.FC<MessageProps> = ({ message, isLast }) => {
  const isUser = message.role === 'user';
  const [messageCopied, setMessageCopied] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);
  const [isDisliked, setIsDisliked] = React.useState(false);

  const { cleanContent, usedTools } = useMemo(() => 
    extractUsedTools(message.content), [message.content]
  );

  const handleMessageCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setMessageCopied(true);
      setTimeout(() => setMessageCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    if (type === 'like') {
      setIsLiked(!isLiked);
      setIsDisliked(false);
    } else {
      setIsDisliked(!isDisliked);
      setIsLiked(false);
    }
  };

  return (
    <div
      className={cn(
        'group flex w-full items-start gap-4 px-4',
        isUser && 'flex-row-reverse'
      )}
    >
      <Avatar className={cn(
        'flex h-8 w-8 shrink-0 select-none overflow-hidden rounded-full',
        isUser 
          ? 'ring-2 ring-secondary/20 hover:ring-secondary/40 transition-all duration-300' 
          : 'ring-2 ring-purple-500/20 hover:ring-purple-500/40 transition-all duration-300'
      )}>
        <AvatarFallback className={cn(
          'flex h-full w-full items-center justify-center rounded-full text-xs font-medium',
          isUser 
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-gradient-to-br from-purple-300 to-purple-500 text-white'
        )}>
          {isUser ? 'You' : 'AI'}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
        <div className={cn(
          'relative rounded-lg px-4 py-3 text-sm transition-all duration-200 max-w-[800px]',
          isUser
            ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:translate-y-[-1px]'
            : 'bg-background/60 backdrop-blur-sm shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] hover:bg-background/80 hover:translate-y-[-1px]'
        )}>
          <div className={cn(
            'prose prose-sm max-w-none',
            isUser ? 'prose-invert' : 'prose-neutral dark:prose-invert',
            'prose-p:leading-relaxed prose-p:mb-2 last:prose-p:mb-0'
          )}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre: ({ node, ...props }) => (
                  <div className="overflow-auto rounded-lg bg-muted p-4">
                    <pre {...props} />
                  </div>
                ),
                code: ({ node, inline, ...props }) =>
                  inline ? (
                    <code className="rounded-sm bg-muted px-1 py-0.5" {...props} />
                  ) : (
                    <code {...props} />
                  ),
              }}
            >
              {cleanContent}
            </ReactMarkdown>
          </div>

          {!isUser && usedTools.length > 0 && (
            <>
              <Separator className="my-2 opacity-30" />
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Wrench className="h-3 w-3" />
                  <span className="font-medium">Used Tools:</span>
                </div>
                {usedTools.map((tool, index) => (
                  <div key={index} className="flex items-center gap-1 pl-4">
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={cn(
          'flex items-center gap-2 text-xs',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
        )}>
          {!isUser && (
            <>
              <Tooltip content="Helpful">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 p-0 hover:text-purple-500",
                    isLiked && "text-purple-500"
                  )}
                  onClick={() => handleFeedback('like')}
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
              </Tooltip>
              <Tooltip content="Not helpful">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 p-0 hover:text-purple-500",
                    isDisliked && "text-purple-500"
                  )}
                  onClick={() => handleFeedback('dislike')}
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </Tooltip>
            </>
          )}
          <Tooltip content={messageCopied ? "Copied!" : "Copy message"}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:text-purple-500"
              onClick={handleMessageCopy}
            >
              {messageCopied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
