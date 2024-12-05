import React from 'react';
import { ArrowRight, Brain, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Header } from '../components/layout/Header';

function Home() {
  return (
    <div>
      <Header />
      <main>
        <section className="bg-muted/50 px-4 py-20">
          <div className="mx-auto max-w-7xl text-center">
            <h1 className="text-5xl font-bold tracking-tight">
              Your AI Study Buddy
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Get instant help with your coursework using advanced AI. Upload your materials,
              ask questions, and receive detailed explanations.
            </p>
            <div className="mt-10">
              <Link to="/auth/signup">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-center text-3xl font-bold">Why Choose StudyAI?</h2>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  icon: Brain,
                  title: 'Smart Learning',
                  description:
                    'Our AI understands your questions and provides detailed, accurate answers.',
                },
                {
                  icon: Sparkles,
                  title: 'Instant Help',
                  description:
                    'Get immediate assistance with your coursework, available 24/7.',
                },
                {
                  icon: Users,
                  title: 'Personalized Experience',
                  description:
                    'The more you use StudyAI, the better it understands your learning style.',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border bg-card p-6 text-center shadow-sm"
                >
                  <feature.icon className="mx-auto h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
