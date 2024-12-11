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
    <div className={cn(
      'group relative py-8 first:pt-4 last:pb-4',
      isUser ? 'bg-background' : 'bg-secondary/30'
    )}>
      <div className="mx-auto flex items-start gap-6">
        <Avatar className={cn(
          'flex h-8 w-8 shrink-0 select-none overflow-hidden rounded-sm',
          isUser 
            ? 'ring-1 ring-secondary/20' 
            : 'ring-1 ring-purple-500/20'
        )}>
          <AvatarFallback className={cn(
            'flex h-full w-full items-center justify-center text-xs font-medium',
            isUser 
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
          )}>
            {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4 overflow-hidden">
          <div className={cn(
            'prose prose-sm max-w-none break-words',
            isUser ? 'prose-neutral' : 'prose-neutral',
            'prose-p:leading-relaxed prose-pre:bg-secondary/50 prose-pre:border prose-pre:border-border'
          )}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre: ({ node, ...props }) => (
                  <div className="relative group/code mt-4">
                    <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-secondary"
                        onClick={() => {
                          const code = props.children?.[0]?.props?.children?.[0];
                          if (code) {
                            navigator.clipboard.writeText(code);
                          }
                        }}
                      >
                        {messageCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <pre {...props} className="rounded-lg bg-secondary/50 p-4 overflow-x-auto" />
                  </div>
                ),
                code: ({ node, inline, ...props }) =>
                  inline ? (
                    <code className="rounded-sm bg-secondary/50 px-1 py-0.5" {...props} />
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
              <Separator className="my-4 opacity-30" />
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Wrench className="h-3 w-3" />
                  <span className="font-medium">Used Tools:</span>
                </div>
                {usedTools.map((tool, index) => (
                  <div key={index} className="flex items-center gap-1.5 pl-4">
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className={cn(
            'flex items-center gap-2 text-xs',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
          )}>
            {!isUser && (
              <>
                <Tooltip content={isLiked ? "Remove like" : "Like message"}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 p-0 hover:text-purple-500",
                      isLiked && "text-purple-500"
                    )}
                    onClick={() => handleFeedback('like')}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
                <Tooltip content={isDisliked ? "Remove dislike" : "Dislike message"}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 p-0 hover:text-purple-500",
                      isDisliked && "text-purple-500"
                    )}
                    onClick={() => handleFeedback('dislike')}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
                <Tooltip content={messageCopied ? "Copied!" : "Copy message"}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:text-purple-500"
                    onClick={handleMessageCopy}
                  >
                    {messageCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
