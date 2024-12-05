import React from 'react';
import { Book, File, Folder } from 'lucide-react';
import { Card } from '../../components/ui/card';

const mockResources = [
  {
    id: '1',
    type: 'folder',
    name: 'Biology',
    itemCount: 12,
  },
  {
    id: '2',
    type: 'folder',
    name: 'Physics',
    itemCount: 8,
  },
  {
    id: '3',
    type: 'file',
    name: 'Math Notes.pdf',
    size: '2.4 MB',
  },
  {
    id: '4',
    type: 'book',
    name: 'Chemistry Textbook',
    author: 'John Smith',
  },
];

function StudyResources() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Study Resources</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockResources.map((resource) => (
          <Card key={resource.id} className="p-4 hover:bg-muted/50 cursor-pointer">
            <div className="flex items-start space-x-4">
              {resource.type === 'folder' && <Folder className="h-6 w-6 text-blue-500" />}
              {resource.type === 'file' && <File className="h-6 w-6 text-green-500" />}
              {resource.type === 'book' && <Book className="h-6 w-6 text-purple-500" />}
              <div>
                <h3 className="font-medium">{resource.name}</h3>
                {resource.type === 'folder' && (
                  <p className="text-sm text-muted-foreground">{resource.itemCount} items</p>
                )}
                {resource.type === 'file' && (
                  <p className="text-sm text-muted-foreground">{resource.size}</p>
                )}
                {resource.type === 'book' && (
                  <p className="text-sm text-muted-foreground">By {resource.author}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default StudyResources;
