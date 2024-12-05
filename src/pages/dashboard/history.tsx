import React from 'react';
import { Calendar } from 'lucide-react';
import { Card } from '../../components/ui/card';

const mockHistory = [
  {
    id: '1',
    date: new Date('2024-03-10'),
    activity: 'Studied Biology',
    duration: '2 hours',
    topics: ['Photosynthesis', 'Cell Structure'],
  },
  {
    id: '2',
    date: new Date('2024-03-09'),
    activity: 'Practice Problems',
    duration: '1.5 hours',
    topics: ['Algebra', 'Calculus'],
  },
  {
    id: '3',
    date: new Date('2024-03-08'),
    activity: 'Reading Assignment',
    duration: '1 hour',
    topics: ['Literature', 'Poetry Analysis'],
  },
];

function StudyHistory() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Study History</h1>
      <div className="space-y-4">
        {mockHistory.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start space-x-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{item.activity}</h3>
                  <span className="text-sm text-muted-foreground">
                    {item.date.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Duration: {item.duration}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default StudyHistory;
