import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, ArrowRight } from 'lucide-react';

interface LocationState {
  from?: string;
  message?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(
    (location.state as LocationState)?.message || null
  );
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const from = (location.state as LocationState)?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) throw error;
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen pt-20 flex flex-col">
      <div className="mx-auto max-w-md space-y-8 p-8 animate-in fade-in-50 duration-500 slide-in-from-bottom-8">
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-bold gradient-text">Welcome to RAG AI</h1>
          <p className="text-muted-foreground">Sign in to access intelligent document processing</p>
        </div>

        {message && (
          <div className="rounded-xl bg-primary/10 p-4 text-sm text-primary animate-in fade-in-50 slide-in-from-top-4">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive animate-in fade-in-50 slide-in-from-top-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-xl border border-input bg-background px-4 py-2.5 transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-xl border border-input bg-background px-4 py-2.5 transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl h-11 hover:scale-105 transition-transform"
            disabled={loading}
          >
            {loading ? (
              'Signing in...'
            ) : (
              <>
                Sign in <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="font-medium text-primary hover:text-primary/90 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
