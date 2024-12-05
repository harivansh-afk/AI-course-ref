import React from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/card';

function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold">Profile Settings</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">
              Display Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="your@email.com"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold">Notification Settings</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Receive updates about your study progress
              </p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold">Account Settings</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Button variant="outline" className="text-destructive">
              Delete Account
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Settings;
