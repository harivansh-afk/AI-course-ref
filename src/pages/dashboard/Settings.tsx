import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Slider } from '../../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

function Settings() {
  // Chat & RAG Settings
  const [retainContext, setRetainContext] = useState(true);
  const [contextWindowSize, setContextWindowSize] = useState(10);
  const [showSourceAttribution, setShowSourceAttribution] = useState(true);
  const [relevanceThreshold, setRelevanceThreshold] = useState(0.8);

  // UI Settings
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [messageGrouping, setMessageGrouping] = useState(true);

  // Privacy Settings
  const [saveHistory, setSaveHistory] = useState(true);
  const [anonymizeData, setAnonymizeData] = useState(false);
  const [shareAnalytics, setShareAnalytics] = useState(true);

  const handleSliderChange = (values: number[]): number => {
    return values[0];
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="mb-4 bg-purple-50">
          <TabsTrigger
            value="chat"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            Chat & RAG
          </TabsTrigger>
          <TabsTrigger
            value="ui"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            UI
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Context Retention</Label>
                <p className="text-sm text-muted-foreground">Keep conversation context for more relevant responses</p>
              </div>
              <Switch
                checked={retainContext}
                onCheckedChange={setRetainContext}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-400 data-[state=checked]:to-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label>Context Window Size</Label>
              <p className="text-sm text-muted-foreground">Number of previous messages to consider (1-20)</p>
              <Slider
                value={[contextWindowSize]}
                onValueChange={(values: number[]) => setContextWindowSize(handleSliderChange(values))}
                max={20}
                min={1}
                step={1}
                className="[&_.SliderTrack]:bg-purple-200 [&_.SliderRange]:bg-gradient-to-r [&_.SliderRange]:from-purple-400 [&_.SliderRange]:to-purple-500 [&_.SliderThumb]:border-purple-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Source Attribution</Label>
                <p className="text-sm text-muted-foreground">Show source documents for responses</p>
              </div>
              <Switch
                checked={showSourceAttribution}
                onCheckedChange={setShowSourceAttribution}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-400 data-[state=checked]:to-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label>Relevance Threshold</Label>
              <p className="text-sm text-muted-foreground">Minimum relevance score for document retrieval (0-1)</p>
              <Slider
                value={[relevanceThreshold]}
                onValueChange={(values: number[]) => setRelevanceThreshold(handleSliderChange(values))}
                max={1}
                min={0}
                step={0.1}
                className="[&_.SliderTrack]:bg-purple-200 [&_.SliderRange]:bg-gradient-to-r [&_.SliderRange]:from-purple-400 [&_.SliderRange]:to-purple-500 [&_.SliderThumb]:border-purple-400"
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ui">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Enable dark color theme</p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-400 data-[state=checked]:to-purple-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Compact View</Label>
                <p className="text-sm text-muted-foreground">Reduce spacing in chat interface</p>
              </div>
              <Switch
                checked={compactView}
                onCheckedChange={setCompactView}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-400 data-[state=checked]:to-purple-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Message Grouping</Label>
                <p className="text-sm text-muted-foreground">Group consecutive messages from the same source</p>
              </div>
              <Switch
                checked={messageGrouping}
                onCheckedChange={setMessageGrouping}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-400 data-[state=checked]:to-purple-500"
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Save Chat History</Label>
                <p className="text-sm text-muted-foreground">Store conversation history locally</p>
              </div>
              <Switch
                checked={saveHistory}
                onCheckedChange={setSaveHistory}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-400 data-[state=checked]:to-purple-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Anonymize Data</Label>
                <p className="text-sm text-muted-foreground">Remove personal information from logs</p>
              </div>
              <Switch
                checked={anonymizeData}
                onCheckedChange={setAnonymizeData}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-400 data-[state=checked]:to-purple-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Share Analytics</Label>
                <p className="text-sm text-muted-foreground">Help improve the app by sharing usage data</p>
              </div>
              <Switch
                checked={shareAnalytics}
                onCheckedChange={setShareAnalytics}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-400 data-[state=checked]:to-purple-500"
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" className="hover:bg-purple-50">Reset to Defaults</Button>
        <Button className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white">Save Changes</Button>
      </div>
    </div>
  );
}

export default Settings;
