import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { Message, Resource } from '../../types/chat';
import { supabase } from '../../lib/supabase';
import { useUser } from '@supabase/auth-helpers-react';

export function ChatInterface() {
  const { currentSession, loading, error, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [availableResources, setAvailableResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useUser();

  useEffect(() => {
    // Fetch available resources
    const fetchResources = async () => {
      if (!user) return;
      
      try {
        setResourcesLoading(true);
        setResourceError(null);
        const { data, error } = await supabase
          .from('study_resources')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAvailableResources(data || []);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setResourceError('Failed to load study resources');
      } finally {
        setResourcesLoading(false);
      }
    };

    fetchResources();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const handleResourceToggle = (resourceId: string) => {
    console.log('Toggling resource:', resourceId);
    setSelectedResources(prev => {
      const newResources = prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId];
      console.log('Selected resources after toggle:', newResources);
      return newResources;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    console.log('Submitting message with selected resources:', selectedResources);
    const message = input;
    setInput('');
    
    try {
      await sendMessage(message, selectedResources.length > 0 ? selectedResources : undefined);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[70%] rounded-lg p-4 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.resourceIds && message.resourceIds.length > 0 && (
            <div className="mt-2 text-sm opacity-75">
              Referenced resources: {message.resourceIds.join(', ')}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {currentSession?.messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="p-2 border-t dark:border-gray-700">
        {/* Debug information */}
        <div className="text-sm mb-2">
          <div>User logged in: {user ? 'Yes' : 'No'}</div>
          <div>Resources loading: {resourcesLoading ? 'Yes' : 'No'}</div>
          <div>Available resources: {availableResources.length}</div>
          <div>Selected resources: {selectedResources.length}</div>
        </div>
        
        {/* Resource selection */}
        <div className="flex flex-wrap gap-2 mb-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="w-full text-lg font-semibold mb-2">
            Study Resources
          </div>
          
          {resourcesLoading ? (
            <div className="text-sm text-muted-foreground">Loading resources...</div>
          ) : resourceError ? (
            <div className="text-sm text-red-500">{resourceError}</div>
          ) : availableResources.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No study resources found. Please add some resources in the Resources section first.
            </div>
          ) : (
            <>
              <div className="w-full mb-2 text-sm">
                <span className="font-medium">Instructions:</span> Click on resources below to include them in your question.
                {selectedResources.length > 0 && (
                  <div className="mt-1 text-blue-600 dark:text-blue-400">
                    Selected {selectedResources.length} resource(s)
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableResources.map(resource => {
                  const isSelected = selectedResources.includes(resource.id);
                  return (
                    <button
                      key={resource.id}
                      onClick={() => handleResourceToggle(resource.id)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-500'
                      }`}
                    >
                      {/* Icon for resource type */}
                      <span className="text-lg">
                        {resource.resource_type === 'file' ? '📄' : '🔗'}
                      </span>
                      {/* Resource name */}
                      <span>
                        {resource.title || resource.file_path?.split('/').pop() || 'Untitled'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
