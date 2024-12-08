import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { auth } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    auth.getSession().then(({ session: initialSession }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
    signIn: async (email: string, password: string) => {
      try {
        const { data, error } = await auth.signIn(email, password);
        if (error) {
          console.error('Sign in error:', error);
          return { error };
        }
        return { error: null };
      } catch (err) {
        console.error('Unexpected sign in error:', err);
        return { 
          error: new AuthError('Failed to sign in. Please check your credentials and try again.') 
        };
      }
    },
    signUp: async (email: string, password: string) => {
      try {
        if (!email || !password) {
          return { 
            error: new AuthError('Email and password are required.') 
          };
        }
        
        if (password.length < 6) {
          return { 
            error: new AuthError('Password must be at least 6 characters long.') 
          };
        }

        const { data, error } = await auth.signUp(email, password);
        if (error) {
          console.error('Sign up error:', error);
          return { error };
        }
        return { error: null };
      } catch (err) {
        console.error('Unexpected sign up error:', err);
        return { 
          error: new AuthError('Failed to create account. Please try again.') 
        };
      }
    },
    signOut: async () => {
      const { error } = await auth.signOut();
      return { error };
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
