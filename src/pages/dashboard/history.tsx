import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../lib/chat-service';
import type { ChatInstance } from '../../types/supabase';

export default function StudyHistory() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatInstance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      const chatInstances = await chatService.getChatInstances(user.id);
      setChats(chatInstances);
      setLoading(false);
    };

    loadChats();
  }, [user]);

  const handleDelete = async (chatId: string) => {
    const success = await chatService.deleteChatInstance(chatId);
    if (success) {
      setChats(prev => prev.filter(chat => chat.id !== chatId));
    }
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
          <h1 className="text-2xl font-bold">Study History</h1>
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
              className="group relative rounded-lg border bg-card p-4 transition-colors hover:bg-purple-50/50"
            >
              <Link to={`/dashboard/ask/${chat.id}`} className="block">
                <h3 className="font-medium">{chat.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Last updated: {new Date(chat.last_message_at).toLocaleString()}
                </p>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(chat.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
