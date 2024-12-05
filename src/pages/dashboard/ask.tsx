import React, { useState, useEffect } from 'react';
import { Send, Loader2, X, History, MessageSquarePlus, AlertCircle } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
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

      // Add user message
      const userMessage = await chatService.addMessage(currentChatId, question.trim(), 'user');
      if (userMessage) {
        setMessages(prev => [...prev, userMessage]);
      }

      setQuestion('');

      // TODO: Integrate with Make.com for AI response
      // For now, using a placeholder response
      const aiMessage = await chatService.addMessage(
        currentChatId,
        'This is a placeholder response. AI integration coming soon!',
        'assistant',
        { make_response_id: 'placeholder' }
      );
      if (aiMessage) {
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('Failed to process message:', err);
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
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Ask a Question</h1>
          {chat && (
            <p className="text-sm text-muted-foreground">
              {chat.title}
            </p>
          )}
        </div>
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
                {message.content}
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
              placeholder="Type your question..."
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
