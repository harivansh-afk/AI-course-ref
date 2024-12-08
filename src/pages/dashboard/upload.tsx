import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';

function UploadMaterials() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Study Materials</h1>
      <div className="rounded-lg bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h2 className="text-lg font-semibold">Drop your files here</h2>
            <p className="text-sm text-muted-foreground">
              or click to browse from your computer
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.open('https://drive.google.com/drive/folders/1UVn905Gfxh7tCo2bZxjpOtGzwNAquwnI?dmr=1&ec=wgc-drive-globalnav-goto', '_blank')}
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UploadMaterials;
