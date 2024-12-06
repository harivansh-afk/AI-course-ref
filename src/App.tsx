import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import './index.css';

const App: React.FC = () => {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <AuthProvider>
        <ChatProvider>
          <Toaster position="top-right" />
          <BrowserRouter>
            <div className="min-h-screen bg-background text-foreground">
              <AppRouter />
            </div>
          </BrowserRouter>
        </ChatProvider>
      </AuthProvider>
    </SessionContextProvider>
  );
};

export default App;
