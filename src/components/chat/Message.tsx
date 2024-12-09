import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, BookOpen, Link as LinkIcon, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
import { Separator } from '../ui/separator';
import type { ChatMessage } from '../../types/supabase';
import type { Components } from 'react-markdown';

interface MessageProps {
  message: ChatMessage;
}

interface CodeBlockProps {
  language: string;
  value: string;
}

interface Citation {
  text: string;
  source: string;
}

function extractCitations(content: string): { cleanContent: string; citations: Citation[] } {
  const citationRegex = /\[([^\]]+)\]\(((?:(?!\)\[).)+)\)/g;
  const citations: Citation[] = [];
  const cleanContent = content.replace(citationRegex, (_, text, source) => {
    citations.push({ text, source });
    return text;
  });
  return { cleanContent, citations };
}

export function Message({ message }: MessageProps) {
  const [copied, setCopied] = React.useState(false);
  const [messageCopied, setMessageCopied] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);
  const [isDisliked, setIsDisliked] = React.useState(false);
  const { cleanContent, citations } = extractCitations(message.content);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    // Here you could send feedback to your backend
  };

  const CodeBlock = React.memo(({ language, value }: CodeBlockProps) => (
    <div className="relative my-4 rounded-lg overflow-hidden bg-muted/30 transition-all duration-200 hover:bg-muted/40 group">
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content={copied ? 'Copied!' : 'Copy code'}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
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
      <div className="bg-muted/50 backdrop-blur-sm px-4 py-2 text-xs font-medium text-muted-foreground/80 flex items-center justify-between">
        <span>{language}</span>
        <span className="text-xs text-muted-foreground/60">{value.split('\n').length} lines</span>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vs}
        customStyle={{ margin: 0, background: 'transparent', padding: '1rem' }}
        PreTag="div"
        className="!bg-transparent"
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
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props}>
          {children}
        </code>
      );
    }

    return <CodeBlock language={language} value={value} />;
  };

  const components: Components = {
    code,
    h1: ({ children }) => (
      <h1 className="text-xl font-semibold tracking-tight mt-6 mb-4">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold tracking-tight mt-5 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-semibold tracking-tight mt-4 mb-2">
        {children}
      </h3>
    ),
  };

  return (
    <div
      className={cn(
        'group flex w-full gap-3 px-4 animate-in fade-in slide-in-from-bottom-4 duration-300',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.role === 'assistant' && (
        <Avatar className="h-8 w-8 ring-2 ring-purple-500/20 transition-all duration-300 group-hover:ring-purple-500/40">
          <AvatarFallback className="bg-gradient-to-br from-purple-300 to-purple-500 text-white text-xs font-medium">
            AI
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col gap-2 max-w-3xl w-full">
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 text-sm transition-all duration-200',
            message.role === 'user'
              ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:translate-y-[-1px]'
              : 'bg-background/60 backdrop-blur-sm shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)] hover:bg-background/80 hover:translate-y-[-1px]'
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className={cn(
              'prose prose-sm max-w-none',
              'prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0',
              'prose-p:leading-relaxed prose-p:mb-2 last:prose-p:mb-0',
              'prose-li:my-0',
              message.role === 'user' ? 'prose-invert' : 'prose-stone dark:prose-invert'
            )}
            components={components}
          >
            {cleanContent}
          </ReactMarkdown>

          {message.role === 'assistant' && citations.length > 0 && (
            <>
              <Separator className="my-4 opacity-30" />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
                  <BookOpen className="h-4 w-4" />
                  Sources
                </div>
                {citations.map((citation, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs group/citation">
                    <LinkIcon className="h-3 w-3 mt-0.5 text-muted-foreground/70" />
                    <span className="text-muted-foreground/70 group-hover/citation:text-foreground/90 transition-colors">
                      {citation.text} - <span className="text-foreground/90 underline-offset-4 group-hover/citation:underline">{citation.source}</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>

          {message.role === 'assistant' && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
          )}
        </div>
      </div>

      {message.role === 'user' && (
        <Avatar className="h-8 w-8 ring-2 ring-secondary/20 transition-all duration-300 group-hover:ring-secondary/40">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
