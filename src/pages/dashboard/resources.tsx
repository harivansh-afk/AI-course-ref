import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { FileIcon, LinkIcon, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';

interface Resource {
  id: string;
  title: string;
  resource_type: 'file' | 'link';
  url?: string;
  file_path?: string;
  file_type?: string;
  created_at: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useSupabaseClient();
  const user = useUser();

  useEffect(() => {
    if (user) {
      fetchResources();
    }
  }, [user]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('study_resources')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (resource: Resource) => {
    if (resource.resource_type === 'file' && resource.file_path) {
      try {
        const { data, error } = await supabase.storage
          .from('study-materials')
          .download(resource.file_path);

        if (error) throw error;

        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = resource.file_path.split('/').pop() || 'download';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download error:', error);
        toast.error('Failed to download file');
      }
    } else if (resource.resource_type === 'link' && resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  const handleDelete = async (resource: Resource) => {
    try {
      if (resource.resource_type === 'file' && resource.file_path) {
        const { error: storageError } = await supabase.storage
          .from('study-materials')
          .remove([resource.file_path]);

        if (storageError) throw storageError;
      }

      const { error: dbError } = await supabase
        .from('study_resources')
        .delete()
        .eq('id', resource.id);

      if (dbError) throw dbError;

      setResources(resources.filter(r => r.id !== resource.id));
      toast.success('Resource deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete resource');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Study Resources</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="p-4 hover:bg-muted/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {resource.resource_type === 'file' ? (
                  <FileIcon className="h-5 w-5 text-primary" />
                ) : (
                  <LinkIcon className="h-5 w-5 text-primary" />
                )}
                <h3 className="font-medium truncate">{resource.title}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(resource)}
                className="text-destructive hover:text-destructive/90 h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              className="mt-4 w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => handleDownload(resource)}
            >
              {resource.resource_type === 'file' ? 'Download' : 'Open Link'}
            </Button>
          </Card>
        ))}

        {resources.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No resources found. Start by uploading some materials!
          </div>
        )}
      </div>
    </div>
  );
}
