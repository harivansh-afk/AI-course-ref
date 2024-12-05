import { createClient, AuthError, Session, AuthResponse } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string): Promise<{ data: AuthResponse | null; error: AuthError | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data: data as AuthResponse | null, error };
  },

  signIn: async (email: string, password: string): Promise<{ data: AuthResponse | null; error: AuthError | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data: data as AuthResponse | null, error };
  },

  signOut: async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getSession: async (): Promise<{ session: Session | null; error: AuthError | null }> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
