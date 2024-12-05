import { useState, ChangeEvent } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/card';

type UploadType = 'file' | 'link';

export default function UploadPage() {
  const [uploadType, setUploadType] = useState<UploadType>('file');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const supabase = useSupabaseClient();
  const user = useUser();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsUploading(true);

      if (uploadType === 'file' && file) {
        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('study-materials')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create database entry
        const { error: dbError } = await supabase
          .from('study_resources')
          .insert({
            user_id: user.id,
            title,
            resource_type: 'file',
            file_path: filePath,
            file_type: file.type,
            file_size: file.size
          });

        if (dbError) throw dbError;
      } else if (uploadType === 'link') {
        // Create database entry for link
        const { error: dbError } = await supabase
          .from('study_resources')
          .insert({
            user_id: user.id,
            title,
            resource_type: 'link',
            url
          });

        if (dbError) throw dbError;
      }

      toast.success('Resource uploaded successfully!');
      // Reset form
      setTitle('');
      setUrl('');
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload resource');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Study Materials</h1>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex space-x-4">
            <Button
              variant={uploadType === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadType('file')}
            >
              Upload File
            </Button>
            <Button
              variant={uploadType === 'link' ? 'default' : 'outline'}
              onClick={() => setUploadType('link')}
            >
              Add Link
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                required
                placeholder="Enter resource title"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {uploadType === 'file' ? (
              <div>
                <label className="text-sm font-medium text-muted-foreground">File</label>
                <div className="mt-1.5">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                    required
                    className="flex w-full rounded-md border border-input bg-background text-sm ring-offset-background file:mr-4 file:py-2.5 file:px-4 file:mt-0 file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-muted-foreground">URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                  required
                  placeholder="Enter resource URL"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Upload Resource'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
