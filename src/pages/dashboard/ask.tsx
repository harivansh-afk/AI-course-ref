import React, { useState, useEffect } from 'react';
import { Send, Loader2, X, History, MessageSquarePlus, AlertCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ScrollArea } from '../../components/ui/ScrollArea';
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

      // If this is a new chat, create it first with the title from the first message
      if (isNewChat) {
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
      } else if (!chatId) {
        throw new Error('No chat ID available');
      } else {
        currentChatId = chatId;
      }

      // Show typing indicator before sending message
      setIsTyping(true);

      // Add user message and get all updated messages including the AI response
      const updatedMessages = await chatService.addMessage(currentChatId, question.trim(), 'user');
      setMessages(updatedMessages);
      setQuestion('');

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

  // Show loading state while checking for existing chats
  if (hasExistingChats === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-muted-foreground" />
            <div>
              <h1 className="text-sm font-semibold">Ask a Question</h1>
              {chat && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {chat.title}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleNewChat}>
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
      </div>

      {error && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col space-y-6 p-4">
            {!isNewChat && !chatId ? (
              <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
                <div className="mx-auto flex max-w-md flex-col items-center space-y-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <MessageSquarePlus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Welcome to StudyAI Chat</h2>
                    <p className="text-sm text-muted-foreground">
                      Start a new conversation to get answers to your questions
                    </p>
                  </div>
                  <Button onClick={handleNewChat}>
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    Start New Chat
                  </Button>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-[calc(100vh-12rem)] flex-col items-center justify-center text-center">
                <div className="mx-auto flex max-w-md flex-col items-center space-y-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <MessageSquarePlus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold">No messages yet</h2>
                    <p className="text-sm text-muted-foreground">
                      Start by asking a question about your studies
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <Message
                    key={message.id}
                    message={message}
                    onFeedback={async (messageId, isPositive) => {
                      // Implement feedback handling here
                      console.log('Feedback:', messageId, isPositive);
                    }}
                  />
                ))}
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex w-full items-start gap-3 px-4">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-medium">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex max-w-3xl items-center space-x-4 rounded-lg bg-muted/50 px-4 py-3 text-sm shadow-sm border border-border/50">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                      </div>
                      <span className="text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {(isNewChat || chatId) && (
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-4">
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
            <div className="relative flex-1">
              <textarea
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                placeholder="Type your question..."
                className="min-h-[44px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={loading}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (question.trim() && !loading) {
                      handleSubmit(e as any);
                    }
                  }
                }}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                Press <kbd className="rounded border px-1 bg-muted">⏎</kbd> to send
              </div>
            </div>
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
