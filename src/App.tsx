import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

const App: React.FC = () => {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <AuthProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <AppRouter />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </SessionContextProvider>
  );
};

export default App;
