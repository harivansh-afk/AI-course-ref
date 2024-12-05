import React from 'react';
import { Users, CreditCard, Activity, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { QuestionList } from '../../components/dashboard/QuestionList';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { Card } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';

const mockQuestions = [
  {
    id: '1',
    text: 'How does photosynthesis work?',
    timestamp: new Date('2024-03-10'),
  },
  {
    id: '2',
    text: 'Explain the concept of supply and demand in economics.',
    timestamp: new Date('2024-03-09'),
  },
];

function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/dashboard/ask">
          <Button className="gap-2">
            <PlusCircle className="h-5 w-5" />
            Ask a Question
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Questions"
          value="156"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: "+12%", label: "from last month" }}
        />
        <StatsCard
          title="Study Sessions"
          value="32"
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: "+8", label: "from last week" }}
        />
        <StatsCard
          title="Active Streak"
          value="7 days"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: "+2", label: "days" }}
        />
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold">Recent Questions</h2>
          <p className="text-sm text-muted-foreground">
            Your most recent study questions and their status.
          </p>
        </div>
        <Separator />
        <div className="p-6">
          <QuestionList questions={mockQuestions} />
        </div>
      </Card>
    </div>
  );
}

export default Dashboard;
