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
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <BookOpen className="h-6 w-6 text-foreground" />
          <span>StudyAI</span>
        </Link>
        <nav className="flex items-center gap-4">
          {session ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button variant="ghost" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/auth/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export { Header };
