import React, { useState, useEffect } from 'react';
import { Send, Loader2, X, History, MessageSquarePlus, AlertCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../lib/chat-service';
import type { ChatMessage, ChatInstance } from '../../types/supabase';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export default function AskQuestion() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const supabase = useSupabaseClient();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatInstance | null>(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const [hasExistingChats, setHasExistingChats] = useState<boolean | null>(null);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [availableResources, setAvailableResources] = useState<any[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const checkExistingChats = async () => {
      try {
        const chats = await chatService.getChatInstances(user.id);
        const hasChats = chats.length > 0;
        setHasExistingChats(hasChats);

        if (hasChats && !chatId && !isNewChat) {
          const mostRecentChat = chats[0]; 
          navigate(`/dashboard/ask/${mostRecentChat.id}`);
        }
      } catch (err) {
        setHasExistingChats(false);
      }
    };

    checkExistingChats();
  }, [user, chatId, navigate, isNewChat]);

  useEffect(() => {
    if (!user || !chatId) return;

    const loadChat = async () => {
      try {
        if (chatId.startsWith('temp-')) {
          return;
        }

        const chatInstance = await chatService.getChatInstance(chatId);
        if (!chatInstance) {
          setError('Chat not found');
          return;
        }
        setChat(chatInstance);

        const messages = await chatService.getChatMessages(chatId);
        setMessages(messages);
      } catch (err) {
        setError('Failed to load chat');
      }
    };

    loadChat();
  }, [chatId, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadResources = async () => {
      try {
        setResourcesLoading(true);
        setError(null);

        const { data: resources, error: dbError } = await supabase
          .from('study_resources')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (dbError) {
          throw dbError;
        }

        const resourcesWithContent = await Promise.all((resources || []).map(async (resource) => {
          if (resource.resource_type === 'file' && resource.file_path) {
            try {
              const { data, error: storageError } = await supabase.storage
                .from('study-materials')
                .download(resource.file_path);

              if (storageError) {
                throw storageError;
              }

              let content = '';
              if (data) {
                if (resource.file_type?.includes('text') || resource.file_path.endsWith('.txt')) {
                  content = await data.text();
                } else if (resource.file_type?.includes('pdf')) {
                  content = 'PDF content extraction not implemented yet';
                }
              }

              return { ...resource, content };
            } catch (error) {
              return { ...resource, content: `Error loading content: ${error.message}` };
            }
          }
          return { ...resource, content: resource.url };
        }));

        setAvailableResources(resourcesWithContent);
      } catch (err) {
        setError('Failed to load study resources');
      } finally {
        setResourcesLoading(false);
      }
    };

    loadResources();
  }, [user, supabase]);

  useEffect(() => {
    if (!resourcesLoading && availableResources.length > 0) {
      setSelectedResources(availableResources.map(r => r.id));
    }
  }, [resourcesLoading, availableResources]);

  const handleNewChat = () => {
    setIsNewChat(true);
    setChat(null);
    setMessages([]);
    setError(null);
    const tempId = 'temp-' + Date.now();
    navigate(`/dashboard/ask/${tempId}`);
  };

  const generateChatTitle = (message: string) => {
    const words = message.split(/\s+/).slice(0, 5);
    const title = words.join(' ');
    return words.length < message.split(/\s+/).length ? `${title}...` : title;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading || !user) return;

    setLoading(true);
    setError(null);

    try {
      let currentChatId: string;

      if (isNewChat) {
        const title = generateChatTitle(question.trim());
        const newChat = await chatService.createChatInstance(user.id, title);
        if (!newChat) {
          throw new Error('Failed to create chat instance');
        }
        currentChatId = newChat.id;
        setChat(newChat);
        setIsNewChat(false);
        navigate(`/dashboard/ask/${newChat.id}`, { replace: true });
      } else if (!chatId) {
        throw new Error('No chat ID available');
      } else {
        currentChatId = chatId;
      }

      const userMessageContent = question.trim();
      const tempMessage: ChatMessage = {
        id: 'temp-' + Date.now(),
        chat_id: currentChatId,
        role: 'user',
        content: userMessageContent,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempMessage]);
      setQuestion('');

      try {
        const userMessage = await chatService.addMessage(
          currentChatId, 
          userMessageContent, 
          'user',
          { selectedResources } 
        );
        if (!userMessage) {
          throw new Error('Failed to send message');
        }

        const updatedMessages = await chatService.getChatMessages(currentChatId);
        setMessages(updatedMessages);
      } catch (error) {
        const err = error as Error;
        if (err.message?.includes('Rate limit exceeded')) {
          setError('Too many requests. Please wait a moment before trying again.');
        } else if (err.message?.includes('API key')) {
          setError('AI service configuration error. Please contact support.');
        } else {
          setError(err.message || 'Failed to process message');
        }

        setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
      }
    } catch (error) {
      const err = error as Error;
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!chatId || isNewChat) return;

    try {
      setError(null);
      const success = await chatService.deleteChatInstance(chatId);
      if (success) {
        const remainingChats = await chatService.getChatInstances(user!.id);
        if (remainingChats.length > 0) {
          navigate(`/dashboard/ask/${remainingChats[0].id}`);
        } else {
          navigate('/dashboard/ask');
        }
      }
    } catch (err) {
      setError('Failed to clear chat');
    }
  };

  if (hasExistingChats === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-3xl font-bold">Ask a Question</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleNewChat}>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
          {chatId && !isNewChat && messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <X className="mr-2 h-4 w-4" />
              Clear chat
            </Button>
          )}
          {hasExistingChats && (
            <Link to="/dashboard/history">
              <Button variant="ghost" size="sm">
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="m-4 flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="mb-4 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-3 flex justify-between items-center border-b">
          <div className="text-sm text-muted-foreground">
            Study Resources ({availableResources.length})
          </div>
          {!resourcesLoading && availableResources.length > 0 && (
            <button
              onClick={() => setSelectedResources(prev => 
                prev.length === availableResources.length ? [] : availableResources.map(r => r.id)
              )}
              className="text-xs hover:underline underline-offset-4"
            >
              {selectedResources.length === availableResources.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        <div className="p-3">
          {resourcesLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading...
            </div>
          ) : availableResources.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              <Link to="/dashboard/upload" className="hover:underline underline-offset-4">
                Add some study resources
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {availableResources.map(resource => (
                <button
                  key={resource.id}
                  onClick={() => {
                    setSelectedResources(prev =>
                      prev.includes(resource.id)
                        ? prev.filter(id => id !== resource.id)
                        : [...prev, resource.id]
                    );
                  }}
                  className={cn(
                    "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    selectedResources.includes(resource.id)
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80"
                  )}
                >
                  <span className="mr-1 opacity-70">
                    {resource.resource_type === 'file' ? '📄' : '🔗'}
                  </span>
                  <span className="truncate max-w-[150px]">
                    {resource.title || resource.file_path?.split('/').pop() || 'Untitled'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isNewChat && !chatId ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="max-w-md space-y-4">
              <p className="text-lg font-medium">Welcome to StudyAI Chat</p>
              <p className="text-sm text-muted-foreground">
                Start a new conversation by clicking the "New Chat" button above
              </p>
              <Button onClick={handleNewChat}>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Start New Chat
              </Button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="max-w-md space-y-2">
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Start by asking a question about your studies
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex w-full',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <ReactMarkdown
                    className="prose prose-sm dark:prose-invert max-w-none"
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                    components={{
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                      ul: ({ children }) => <ul className="mb-2 list-disc pl-4">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 list-decimal pl-4">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      h1: ({ children }) => <h1 className="mb-2 text-xl font-bold">{children}</h1>,
                      h2: ({ children }) => <h2 className="mb-2 text-lg font-bold">{children}</h2>,
                      h3: ({ children }) => <h3 className="mb-2 text-base font-bold">{children}</h3>,
                      code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline ? (
                          <pre className="mb-2 rounded bg-gray-900 p-2 text-sm">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className="rounded bg-gray-200 px-1 py-0.5 text-sm dark:bg-gray-800" {...props}>
                            {children}
                          </code>
                        );
                      },
                      a: ({ children, href }) => (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {children}
                        </a>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="mb-2 border-l-2 border-gray-300 pl-4 italic dark:border-gray-600">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {(isNewChat || chatId) && (
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question... "
              className="flex-1 rounded-md border border-input bg-background px-3 py-2"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !question.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
