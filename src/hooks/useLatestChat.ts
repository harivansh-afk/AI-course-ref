import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../lib/chat-service';

export function useLatestChat() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigateToChat = useCallback(async () => {
    if (!user) return;

    try {
      const chats = await chatService.getChatInstances(user.id);
      
      if (chats.length > 0) {
        // Navigate to most recent chat
        navigate(`/dashboard/ask/${chats[0].id}`, { replace: true });
      } else {
        // No chats exist, go to new chat
        navigate('/dashboard/ask?new=true', { replace: true });
      }
    } catch (err) {
      console.error('Error navigating to chat:', err);
      // On error, default to new chat
      navigate('/dashboard/ask?new=true', { replace: true });
    }
  }, [user, navigate]);

  return { navigateToChat };
}
