import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, X, History, MessageSquarePlus, AlertCircle, ArrowDown, Trash2, Bot } from 'lucide-react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Message } from '../../components/chat/Message';
import { Avatar, AvatarFallback } from '../../components/ui/Avatar';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../lib/chat-service';
import { cn } from '../../lib/utils';
import type { ChatMessage, ChatInstance } from '../../types/supabase';
import { useChatRouting } from '../../hooks/useChatRouting';

export default function AskQuestion() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isNewChatRequest = searchParams.get('new') === 'true';
  
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatInstance | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(!!chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Use the chat routing hook
  const { loading: routingLoading } = useChatRouting(chatId, isNewChatRequest);

  // Load chat messages
  useEffect(() => {
    if (!user || !chatId || routingLoading) return;

    const loadChat = async () => {
      setIsLoadingChat(true);
      try {
        const [messages, existingChat] = await Promise.all([
          chatService.getChatMessages(chatId),
          chatService.getChatInstance(chatId)
        ]);

        setMessages(messages);

        if (existingChat) {
          setChat(existingChat);
        } else if (messages.length > 0) {
          const firstMessage = messages[0];
          const chatInstance: ChatInstance = {
            id: chatId,
            created_at: '',
            user_id: 'system',
            title: firstMessage.content.slice(0, 50) + '...',
            last_message_at: '',
          };
          setChat(chatInstance);
        }
      } catch (err) {
        console.error('Error loading chat:', err);
        setError('Failed to load chat');
      } finally {
        setIsLoadingChat(false);
      }
    };

    loadChat();
  }, [user, chatId, routingLoading]);

  const handleNewChat = () => {
    setIsTyping(false);
    setChat(null);
    setMessages([]);
    setError(null);
    navigate('/dashboard/ask?new=true', { replace: true });
  };

  const generateChatTitle = (message: string) => {
    // Split into words and take first 5
    const words = message.split(/\s+/).slice(0, 5);

    // Join words and add ellipsis if we truncated
    const title = words.join(' ');
    return words.length < message.split(/\s+/).length ? `${title}...` : title;
  };

  const handleSubmit = async () => {
    if (!question.trim() || loading) return;

    const userMessage = question.trim();
    setQuestion('');
    setError(null);
    setLoading(true);
    setIsTyping(true);

    try {
      let currentChatId: string;

      // Get or create chat ID
      if (chatId) {
        currentChatId = chatId;
      } else {
        const newChat = await chatService.createChatInstance(user!.id, "New Chat");
        if (!newChat) {
          throw new Error("Failed to create new chat");
        }
        navigate(`/dashboard/ask/${newChat.id}`, { replace: true });
        currentChatId = newChat.id;
      }

      // Immediately show the user's message in the UI
      const tempUserMessage: ChatMessage = {
        id: crypto.randomUUID(),
        chat_id: currentChatId,
        content: userMessage,
        role: 'user',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // Add message and get AI response through chatService
      const updatedMessages = await chatService.addMessage(currentChatId, userMessage, 'user');
      setMessages(updatedMessages);
    } catch (err) {
      console.error('Failed to process message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    if (!chatId || isNewChatRequest) return;

    try {
      setError(null);
      const success = await chatService.deleteChatInstance(chatId);
      if (success) {
        // After deleting, check if there are other chats to navigate to
        const remainingChats = await chatService.getChatInstances(user!.id);
        if (remainingChats.length > 0) {
          navigate(`/dashboard/ask/${remainingChats[0].id}`);
        } else {
          navigate('/dashboard/ask');
        }
      }
    } catch (err) {
      setError('Failed to clear chat');
      console.error('Error clearing chat:', err);
    }
  };

  // Function to handle scroll events
  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isAtBottom);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
      // Initial check for scroll position
      handleScroll();
      return () => scrollArea.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

      // Only auto-scroll if user is already at bottom
      if (isAtBottom) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }

      // Check if we should show scroll button
      handleScroll();
    }
  }, [messages, isTyping]);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    // Reset the height to auto first to get the correct scrollHeight
    e.target.style.height = 'auto';
    // Calculate new height between min and max
    const newHeight = Math.max(
      40, // min height
      Math.min(e.target.scrollHeight, window.innerHeight * 0.4) // max height
    );
    e.target.style.height = `${newHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Show loading state while checking for existing chats or loading messages
  if (routingLoading || isLoadingChat) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-background">
      {/* Messages */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        onScroll={handleScroll}
      >
        {!isLoadingChat && messages.length === 0 && !loading ? (
          <div className="flex h-full flex-col items-center justify-center">
            <h1 className="mb-10 text-2xl font-bold">
              What can I help with?
            </h1>
            <div className={cn(
              "w-full max-w-3xl transform transition-all duration-300 ease-in-out",
              loading && messages.length === 0 ? "opacity-0 translate-y-[-20px]" : "opacity-100 translate-y-0"
            )}>
              <form onSubmit={handleSubmit} className="relative flex flex-col items-end gap-2 px-4">
                <div className="relative flex w-full flex-col overflow-hidden rounded-2xl border bg-background shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                  <textarea
                    value={question}
                    onChange={handleQuestionChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Message RagAI..."
                    rows={1}
                    className="min-h-[52px] w-full resize-none border-0 bg-transparent px-4 py-[14px] focus-visible:outline-none disabled:opacity-50"
                    style={{ 
                      maxHeight: '200px',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                    disabled={loading}
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    {loading ? (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:bg-gray-100"
                        onClick={() => setLoading(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        size="icon"
                        className={cn(
                          "h-8 w-8 rounded-2xl bg-gray-100 text-gray-600 transition-all hover:bg-gray-200",
                          !question.trim() && "opacity-40 cursor-not-allowed hover:bg-gray-100"
                        )}
                        disabled={!question.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex w-full items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs hover:bg-purple-50"
                        onClick={handleNewChat}
                      >
                        <MessageSquarePlus className="mr-1 h-3 w-3" />
                        New Chat
                      </Button>
                    </div>
                  </div>
                  <p>
                    AI may produce inaccurate information about people, places, or facts.
                  </p>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="relative mx-auto max-w-3xl px-4 py-4 md:py-8">
            {messages.map((message, index) => (
              <Message
                key={index}
                message={message}
                loading={loading && index === messages.length - 1 && message.role === 'user'}
              />
            ))}
            {loading && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* Input area for when messages exist */}
      {messages.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-background/0 py-4">
          <div className="mx-auto max-w-3xl px-4">
            <form onSubmit={handleSubmit} className="relative flex flex-col items-end gap-2">
              <div className="relative flex w-full flex-col overflow-hidden rounded-2xl border bg-background shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                <textarea
                  value={question}
                  onChange={handleQuestionChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Message RagAI..."
                  rows={1}
                  className="min-h-[52px] w-full resize-none border-0 bg-transparent px-4 py-[14px] focus-visible:outline-none disabled:opacity-50"
                  style={{ 
                    maxHeight: '200px',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                  disabled={loading}
                />
                <div className="absolute right-3 top-3 flex items-center gap-2">
                  {loading ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:bg-gray-100"
                      onClick={() => setLoading(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-2xl bg-gray-100 text-gray-600 transition-all hover:bg-gray-200",
                        !question.trim() && "opacity-40 cursor-not-allowed hover:bg-gray-100"
                      )}
                      disabled={!question.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex w-full items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs hover:bg-purple-50"
                    onClick={handleNewChat}
                  >
                    <MessageSquarePlus className="mr-1 h-3 w-3" />
                    New Chat
                  </Button>
                  {!isNewChatRequest && chatId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                      onClick={clearChat}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete Chat
                    </Button>
                  )}
                </div>
                <p>
                  AI may produce inaccurate information about people, places, or facts.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 right-8 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white shadow-lg transition-colors hover:bg-purple-600"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 rounded-md p-1 hover:bg-destructive/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
