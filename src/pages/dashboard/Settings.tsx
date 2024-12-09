import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/Switch';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { Trash2 } from 'lucide-react';

function Settings() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteResources = async () => {
    // Add confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete all resources? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      // Delete all records from documents table
      const { error: documentsError } = await supabase
        .from('documents')
        .delete()
        .neq('id', '0'); // Delete all records

      if (documentsError) throw documentsError;

      // Delete all records from n8n_chat_histories table
      const { error: chatHistoryError } = await supabase
        .from('n8n_chat_histories')
        .delete()
        .neq('id', '0'); // Delete all records

      if (chatHistoryError) throw chatHistoryError;

      alert('All resources have been deleted successfully');
    } catch (error) {
      console.error('Error deleting resources:', error);
      alert('Failed to delete resources. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="space-y-6">
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Enable dark color theme</p>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-400 data-[state=checked]:to-purple-500"
            />
          </div>

          <div className="border-t border-border pt-6">
            <div className="space-y-4">
              <div>
                <Label className="text-destructive">Danger Zone</Label>
                <p className="text-sm text-muted-foreground">Delete all resources from the database</p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteResources}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete All Resources'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Settings;
