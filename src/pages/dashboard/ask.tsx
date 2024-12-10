import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, X, History, MessageSquarePlus, AlertCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Message } from '../../components/chat/Message';
import { Avatar, AvatarFallback } from '../../components/ui/Avatar';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../lib/chat-service';
import type { ChatMessage, ChatInstance } from '../../types/supabase';

export default function AskQuestion() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatInstance | null>(null);
  const [isNewChat, setIsNewChat] = useState(false);
  const [hasExistingChats, setHasExistingChats] = useState<boolean | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Check for existing chats and redirect to most recent if on base path
  useEffect(() => {
    if (!user) return;

    const checkExistingChats = async () => {
      try {
        const chats = await chatService.getChatInstances(user.id);
        const hasChats = chats.length > 0;
        setHasExistingChats(hasChats);

        // If we're on the base ask page and there are existing chats,
        // redirect to the most recent one
        if (hasChats && !chatId && !isNewChat) {
          const mostRecentChat = chats[0]; // Chats are already sorted by last_message_at desc
          navigate(`/dashboard/ask/${mostRecentChat.id}`);
        }
      } catch (err) {
        console.error('Error checking existing chats:', err);
        setHasExistingChats(false);
      }
    };

    checkExistingChats();
  }, [user, chatId, navigate, isNewChat]);

  useEffect(() => {
    if (!user || !chatId) return;

    const loadChat = async () => {
      try {
        // Don't try to load chat if we're using a temporary ID
        if (chatId.startsWith('temp-')) {
          return;
        }

        // Load chat instance
        const chatInstance = await chatService.getChatInstance(chatId);
        if (!chatInstance) {
          setError('Chat not found');
          return;
        }
        setChat(chatInstance);

        // Load messages
        const messages = await chatService.getChatMessages(chatId);
        setMessages(messages);
      } catch (err) {
        setError('Failed to load chat');
        console.error('Error loading chat:', err);
      }
    };

    loadChat();
  }, [chatId, user]);

  const handleNewChat = () => {
    setIsNewChat(true);
    setChat(null);
    setMessages([]);
    setError(null);
    // Generate a temporary ID for the new chat
    const tempId = 'temp-' + Date.now();
    navigate(`/dashboard/ask/${tempId}`);
  };

  const generateChatTitle = (message: string) => {
    // Split into words and take first 5
    const words = message.split(/\s+/).slice(0, 5);

    // Join words and add ellipsis if we truncated
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

      // If no chat exists or we're on the base ask page, create a new one
      if (!chatId || chatId === undefined) {
        const title = generateChatTitle(question.trim());
        const newChat = await chatService.createChatInstance(user.id, title);
        if (!newChat) {
          throw new Error('Failed to create chat instance');
        }
        currentChatId = newChat.id;
        setChat(newChat);
        setIsNewChat(false);
        // Update URL with the real chat ID
        navigate(`/dashboard/ask/${newChat.id}`, { replace: true });
      } else {
        currentChatId = chatId;
      }

      // Show typing indicator before sending message
      setIsTyping(true);

      // Add user message and get all updated messages including the AI response
      const updatedMessages = await chatService.addMessage(currentChatId, question.trim(), 'user');
      setMessages(updatedMessages);
      setQuestion('');

      // Reset textarea height to initial state
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.style.height = '40px';
      }

    } catch (err) {
      setError('Failed to send message');
      console.error('Failed to process message:', err);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    if (!chatId || isNewChat) return;

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

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages, isTyping]);

  // Show loading state while checking for existing chats
  if (hasExistingChats === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Container */}
      <div className="flex-none bg-background rounded-lg m-4">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <MessageSquarePlus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-medium">Ask a Question</h1>
              {chat && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {chat.title}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
            {chatId && !isNewChat && messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <X className="mr-2 h-4 w-4" />
                Clear chat
              </Button>
            )}
            {hasExistingChats && (
              <Link to="/dashboard/history">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Container - Added pb-20 to create space at bottom */}
      <div className="flex-1 bg-background rounded-lg mx-4 flex flex-col min-h-0">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="flex-none mx-4 mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="flex flex-col space-y-6 p-4">
            {!isNewChat && !chatId ? (
              <div className="h-full flex items-center justify-center min-h-[calc(100vh-50rem)]">
                <div className="max-w-md w-full space-y-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-purple-500/20 p-6 mb-8">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 shadow-lg" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Welcome to your AI AGENT</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Start a new chat to begin automating your tasks
                    </p>
                    <Button
                      onClick={handleNewChat}
                      className="w-full bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white mb-8"
                    >
                      <MessageSquarePlus className="mr-2 h-5 w-5" />
                      Start New Chat
                    </Button>
                    <div className="w-full text-left">
                      <p className="text-sm font-medium mb-3">Current Tools:</p>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            handleNewChat();
                            setQuestion("Help me draft, analyze, or respond to emails professionally");
                          }}
                        >
                          Email Assistant
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            handleNewChat();
                            setQuestion("Help me analyze research papers and extract key findings");
                          }}
                        >
                          Research Assistant
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                          onClick={() => {
                            handleNewChat();
                            setQuestion("Search and analyze information from my uploaded documents");
                          }}
                        >
                          Vector Database Assistant
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center min-h-[calc(100vh-12rem)]">
                <div className="max-w-md w-full space-y-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="rounded-full bg-purple-500/20 p-6 mb-8">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 shadow-lg" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Ask Your First Question</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Type your question below or choose from the examples
                    </p>
                    <div className="w-full space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                        onClick={() => setQuestion("Help me draft, analyze, or respond to emails professionally")}
                      >
                        Email Assistant
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                        onClick={() => setQuestion("Help me analyze research papers and extract key findings")}
                      >
                        Research Assistant
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                        onClick={() => setQuestion("Search and analyze information from my uploaded documents")}
                      >
                        Vector Database Assistant
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    message={message}
                  />
                ))}
                {isTyping && (
                  <div className="flex w-full items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-purple-300 to-purple-500 text-white text-xs font-medium">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex max-w-3xl items-center space-x-4 rounded-2xl bg-primary/5 px-4 py-3 text-sm shadow-sm">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:0ms]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:150ms]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Input Box - Keep original styling */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex items-start gap-2">
            <div className="flex-1 relative">
              <textarea
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  // Reset the height to auto first to get the correct scrollHeight
                  e.target.style.height = 'auto';
                  // Calculate new height between min and max
                  const newHeight = Math.max(
                    40, // min height
                    Math.min(e.target.scrollHeight, window.innerHeight * 0.4) // max height
                  );
                  e.target.style.height = `${newHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask me anything..."
                rows={1}
                className={cn(
                  'w-full rounded-2xl px-4 py-3 text-sm resize-none',
                  'bg-primary/5 border-primary/10',
                  'focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'placeholder:text-muted-foreground',
                  'min-h-[40px] transition-all duration-200',
                  '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
                )}
                disabled={loading}
                style={{
                  height: '40px',
                  maxHeight: `${window.innerHeight * 0.4}px` // 40% of viewport height
                }}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !question.trim()}
              className={cn(
                'rounded-full bg-gradient-to-r from-purple-400 to-purple-500 text-white h-10 w-10 p-0 flex-shrink-0',
                'hover:from-purple-500 hover:to-purple-600',
                'focus:outline-none focus:ring-2 focus:ring-primary/20',
                'disabled:opacity-50'
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
