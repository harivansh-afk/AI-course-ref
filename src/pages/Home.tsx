import React from 'react';
import { ArrowRight, Brain, Sparkles, Users, FileText, Zap, Shield, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Header } from '../components/layout/Header';

function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto pt-24">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="py-20">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">

              <h1 className="text-6xl font-bold mb-6 gradient-text leading-tight">
                Advanced Document Intelligence with RAG AI
              </h1>
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                Experience the power of Retrieval-Augmented Generation. Process documents, get instant insights, and learn more effectively with our advanced AI system.
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/auth/signup">
                  <Button size="lg" className="rounded-full px-8 hover:scale-105 transition-transform">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button size="lg" variant="outline" className="rounded-full px-8 hover:bg-secondary transition-colors">
                    Try Demo
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-6 rounded-2xl bg-card border animate-in fade-in-50 duration-1000 hover:shadow-lg transition-all">
                <div className="text-4xl font-bold gradient-text mb-2">95%</div>
                <div className="text-muted-foreground">Query Accuracy</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-card border animate-in fade-in-50 duration-1000 delay-150 hover:shadow-lg transition-all">
                <div className="text-4xl font-bold gradient-text mb-2">1000+</div>
                <div className="text-muted-foreground">Daily Queries</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-card border animate-in fade-in-50 duration-1000 delay-300 hover:shadow-lg transition-all">
                <div className="text-4xl font-bold gradient-text mb-2">90%</div>
                <div className="text-muted-foreground">Relevance Rate</div>
              </div>
              <div className="text-center p-6 rounded-2xl bg-card border animate-in fade-in-50 duration-1000 delay-450 hover:shadow-lg transition-all">
                <div className="text-4xl font-bold gradient-text mb-2">40%</div>
                <div className="text-muted-foreground">Time Saved</div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20">
            <div className="text-center mb-16 animate-in fade-in-50">
              <h2 className="text-3xl font-bold mb-4">Powered by Advanced RAG Technology</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our system combines state-of-the-art retrieval and generation to provide accurate, context-aware responses.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-card border hover:shadow-lg transition-all group">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Intelligent Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced RAG system processes your documents with 95% accuracy for precise answers.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border hover:shadow-lg transition-all group">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Retrieval</h3>
                <p className="text-muted-foreground">
                  Context-aware document retrieval with semantic understanding of your content.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border hover:shadow-lg transition-all group">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Source Attribution</h3>
                <p className="text-muted-foreground">
                  Transparent source referencing and attribution for all retrieved information.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20 bg-secondary/30 -mx-4 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">How RAG AI Works</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Experience the power of intelligent document processing in four simple steps.
                </p>
              </div>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center group">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Upload Documents</h3>
                  <p className="text-sm text-muted-foreground">Upload your documents in any format</p>
                </div>
                <div className="text-center group">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">AI Processing</h3>
                  <p className="text-sm text-muted-foreground">Our RAG system analyzes and indexes your content</p>
                </div>
                <div className="text-center group">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Ask Questions</h3>
                  <p className="text-sm text-muted-foreground">Get instant, accurate answers from your materials</p>
                </div>
                <div className="text-center group">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">Monitor insights and document processing</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Document Processing?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of users who are already using RAG AI for intelligent document analysis.
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/auth/signup">
                  <Button size="lg" className="rounded-full px-8 hover:scale-105 transition-transform">
                    Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
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
