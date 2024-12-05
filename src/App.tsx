import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <AppRouter />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
