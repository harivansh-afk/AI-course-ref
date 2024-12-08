import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/card';

function UploadMaterials() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upload Study Materials</h1>
          <p className="text-muted-foreground">Upload your documents to Google Drive</p>
        </div>
      </div>

      <Card className="p-12">
        <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto text-center">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400/25 to-purple-500/25 blur" />
            <div className="relative rounded-full bg-purple-50 p-6">
              <Upload className="h-12 w-12 text-purple-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Ready to upload?</h2>
            <p className="text-sm text-muted-foreground">
              Click below to open Google Drive and upload your study materials
            </p>
          </div>

          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white px-8"
            onClick={() => window.open('https://drive.google.com/drive/folders/1UVn905Gfxh7tCo2bZxjpOtGzwNAquwnI?dmr=1&ec=wgc-drive-globalnav-goto', '_blank')}
          >
            Open Google Drive
          </Button>

          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, DOCX, DOC, and TXT files up to 10MB
          </p>
        </div>
      </Card>
    </div>
  );
}

export default UploadMaterials;
