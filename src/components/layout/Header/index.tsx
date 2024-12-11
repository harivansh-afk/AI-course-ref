import React from 'react';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { useAuth } from '../../../contexts/AuthContext';

const Header = () => {
  const { session, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="fixed w-full top-0 z-50">
      <div className="absolute inset-x-0 -top-4 h-24 bg-gradient-to-b from-background/80 via-background/50 to-background/0 pointer-events-none" />
      <header className="mt-4 mx-4">
        <div className="rounded-2xl bg-neutral-100/80 dark:bg-neutral-800/80 backdrop-blur-xl backdrop-saturate-150 shadow-sm shadow-black/5">
          <div className="h-14 flex items-center">
            <div className="flex-shrink-0 pl-4">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <span className="gradient-text">RAG AI</span>
              </Link>
            </div>
            <div className="flex-1" />
            <nav className="flex items-center gap-4 flex-shrink-0 pr-4">
              {session ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" className="rounded-full">Dashboard</Button>
                  </Link>
                  <Button variant="outline" className="rounded-full" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth/login">
                    <Button variant="ghost" className="rounded-full">Log in</Button>
                  </Link>
                  <Link to="/auth/signup">
                    <Button className="rounded-full px-8 bg-primary hover:bg-primary/90">Sign up</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
    </div>
  );
};

export { Header };
