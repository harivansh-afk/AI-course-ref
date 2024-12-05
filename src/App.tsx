import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes';
import './index.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <AppRouter />
      </div>
    </BrowserRouter>
  );
};

export default App;
