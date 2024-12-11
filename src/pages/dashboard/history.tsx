import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Trash2, User, Bot } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../lib/chat-service';
import type { ChatInstance } from '../../types/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/AlertDialog";

interface ChatWithStats extends ChatInstance {
  stats?: {
    messageCount: number;
    humanMessages: number;
    aiMessages: number;
  };
  isLoadingStats?: boolean;
}

export default function StudyHistory() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      const chatInstances = await chatService.getChatInstances(user.id);
      setChats(chatInstances.map(chat => ({ ...chat, isLoadingStats: true })));
      setLoading(false);

      // Load stats for each chat
      for (const chat of chatInstances) {
        const stats = await chatService.getChatStats(chat.id);
        setChats(prev => 
          prev.map(c => 
            c.id === chat.id 
              ? { ...c, stats, isLoadingStats: false }
              : c
          )
        );
      }
    };

    loadChats();
  }, [user]);

  const handleDelete = async (chatId: string) => {
    const success = await chatService.deleteChatInstance(chatId);
    if (success) {
      setChats(prev => prev.filter(chat => chat.id !== chatId));
    }
    setChatToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chat History</h1>
          <p className="text-muted-foreground">View your past conversations</p>
        </div>
        <Link to="/dashboard/ask">
          <Button className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white">
            <MessageSquare className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </Link>
      </div>

      {chats.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No chat history</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Start a new conversation to see it here
          </p>
          <Link to="/dashboard/ask" className="mt-4 inline-block">
            <Button className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white">
              Start a new chat
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="group relative rounded-lg border bg-card p-6 transition-all hover:border-purple-300 hover:shadow-md"
            >
              <Link to={`/dashboard/ask/${chat.id}`} className="block">
                <h3 className="font-medium line-clamp-2">{chat.title}</h3>
                
                {chat.isLoadingStats ? (
                  <div className="mt-3 animate-pulse space-y-2">
                    <div className="h-2 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-2 w-1/2 rounded bg-gray-200"></div>
                  </div>
                ) : chat.stats ? (
                  <div className="mt-3 flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MessageSquare className="mr-1 h-4 w-4" />
                      {chat.stats.messageCount}
                    </div>
                    <div className="flex items-center">
                      <User className="mr-1 h-4 w-4" />
                      {chat.stats.humanMessages}
                    </div>
                    <div className="flex items-center">
                      <Bot className="mr-1 h-4 w-4" />
                      {chat.stats.aiMessages}
                    </div>
                  </div>
                ) : null}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  setChatToDelete(chat.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!chatToDelete} onOpenChange={() => setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the chat and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => chatToDelete && handleDelete(chatToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
