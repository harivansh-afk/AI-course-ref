import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../lib/chat-service';

export function useChatRouting(chatId: string | undefined, isNewChatRequest: boolean = false) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Only initiate loading if we don't have a chatId and it's not a new chat request
    if (!chatId && !isNewChatRequest) {
      setLoading(true);
      const initializeChat = async () => {
        try {
          const chats = await chatService.getChatInstances(user.id);
          
          if (chats.length > 0) {
            navigate(`/dashboard/ask/${chats[0].id}`, { replace: true });
          }
        } catch (err) {
          console.error('Error initializing chat:', err);
        } finally {
          setLoading(false);
        }
      };

      initializeChat();
    }
  }, [user, chatId, navigate, isNewChatRequest]);

  return { loading };
}
