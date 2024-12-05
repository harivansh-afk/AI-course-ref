import React from 'react';
import { ArrowRight, Brain, Sparkles, Users, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Header } from '../components/layout/Header';

function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-6 w-6 text-foreground" />
            <span>StudyAI</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/auth/signup">
              <Button>Sign up</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4">
          <section className="py-20">
            <div className="text-center">
              <h1 className="text-4xl font-bold sm:text-6xl">
                Learn Smarter with AI
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                Enhance your learning experience with personalized AI assistance.
                Ask questions, get instant feedback, and track your progress.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <Link to="/auth/signup">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link to="/auth/login">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Home;
