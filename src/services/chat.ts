import { supabase } from '../lib/supabase';
import { ChatResponse, Resource } from '../types/chat';
import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error(
    'OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your .env file'
  );
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class ChatService {
  private static async getResourceContext(resourceIds: string[]): Promise<string> {
    console.log('Fetching resources with IDs:', resourceIds);
    
    const { data: resources, error } = await supabase
      .from('study_resources')
      .select('*')
      .in('id', resourceIds);

    if (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }

    if (!resources || resources.length === 0) {
      console.log('No resources found with the provided IDs');
      return '';
    }

    console.log('Found resources:', resources);

    // Process each resource to get its content
    const processedResources = await Promise.all(
      resources.map(async (resource) => {
        console.log('Processing resource:', resource);
        
        if (resource.resource_type === 'file' && resource.file_path) {
          try {
            console.log('Downloading file from path:', resource.file_path);
            
            // Download file content from storage
            const { data, error: downloadError } = await supabase.storage
              .from('study-materials')
              .download(resource.file_path);

            if (downloadError) {
              console.error('Error downloading file:', downloadError);
              throw downloadError;
            }

            if (!data) {
              console.error('No data received from storage');
              throw new Error('No data received from storage');
            }

            // Convert file content to text
            const text = await data.text();
            console.log('Successfully read file content, length:', text.length);
            
            // Extract file extension for context
            const fileExt = resource.file_path.split('.').pop()?.toLowerCase();
            let fileType = 'document';
            if (fileExt === 'pdf') fileType = 'PDF document';
            else if (['doc', 'docx'].includes(fileExt || '')) fileType = 'Word document';
            else if (['ppt', 'pptx'].includes(fileExt || '')) fileType = 'PowerPoint presentation';
            else if (['txt', 'md'].includes(fileExt || '')) fileType = 'text document';

            // Store the content in Supabase for caching
            await supabase
              .from('study_resources')
              .update({ content: text })
              .eq('id', resource.id);

            return `[${resource.title || resource.file_path}] (${fileType})
Content:
${text}
---`;
          } catch (err) {
            console.error(`Error processing file resource ${resource.id}:`, err);
            // Try to get cached content if available
            if (resource.content) {
              console.log('Using cached content for resource:', resource.id);
              return `[${resource.title || resource.file_path}] (cached)
Content:
${resource.content}
---`;
            }
            return `[${resource.title || resource.file_path}]
Error: Could not load file content. Error: ${err instanceof Error ? err.message : 'Unknown error'}
---`;
          }
        } else if (resource.resource_type === 'link' && resource.url) {
          return `[${resource.title || 'Link'}]
Type: Web Resource
URL: ${resource.url}
---`;
        }
        return '';
      })
    );

    const finalContext = processedResources.join('\n\n');
    console.log('Final context length:', finalContext.length);
    return finalContext;
  }

  private static async getAllResources(userId: string): Promise<Resource[]> {
    const { data: resources, error } = await supabase
      .from('study_resources')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return resources;
  }

  static async sendMessage(message: string, sessionId: string, resourceIds?: string[]): Promise<ChatResponse> {
    console.log('Sending message with resourceIds:', resourceIds);
    
    try {
      // Get user ID from session
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        throw sessionError;
      }

      if (!session?.user_id) {
        console.error('No user_id found in session');
        throw new Error('No user_id associated with this chat session');
      }

      // Get context from resources if provided
      let context = '';
      if (resourceIds && resourceIds.length > 0) {
        context = await this.getResourceContext(resourceIds);
      }

      console.log('Retrieved context length:', context.length);

      // Construct the system message with enhanced instructions
      const systemMessage = `You are a knowledgeable AI assistant with access to the user's study materials. Here are the available documents:

${context}

Instructions for handling study materials:
1. Analyze and use the provided documents to answer questions accurately
2. If a question cannot be answered using the available documents, clearly state this
3. When referencing information, cite the specific document it came from using its title in square brackets
4. For file content:
   - Understand and interpret the content based on the file type
   - Consider the context and format of different document types (PDF, Word, PowerPoint, etc.)
5. For web resources:
   - Reference the URL when relevant
   - Mention if the information comes from a web resource
6. Keep responses focused and educational
7. If appropriate, suggest how other available resources might be relevant to the topic`;

      // Get chat history
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('sessionId', sessionId)
        .order('createdAt', { ascending: true });

      // Create completion with OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemMessage },
          ...(messages?.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          })) || []),
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const response = completion.choices[0].message.content || '';

      // Save messages to Supabase
      await supabase.from('messages').insert([
        {
          sessionId,
          role: 'user',
          content: message,
          resourceIds
        },
        {
          sessionId,
          role: 'assistant',
          content: response,
          resourceIds
        }
      ]);

      // Find related resources based on the response
      const allResources = session?.user_id 
        ? await this.getAllResources(session.user_id)
        : [];
        
      const relatedResources = allResources.filter(resource =>
        response.toLowerCase().includes((resource.title || '').toLowerCase()) ||
        (resourceIds && resourceIds.includes(resource.id))
      );

      return {
        message: response,
        relatedResources
      };
    } catch (error) {
      console.error('Error in chat service:', error);
      throw error;
    }
  }

  static async createSession(title: string, userId: string): Promise<string> {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert([{ 
        title,
        user_id: userId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  static async getSession(sessionId: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select(`
        *,
        messages:messages(*)
      `)
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return data;
  }
}
