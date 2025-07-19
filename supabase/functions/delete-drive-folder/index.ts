import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { google } from 'npm:googleapis@153.0.0';
import { JWT } from 'npm:google-auth-library@10.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    const { folderId } = await req.json();

    if (!folderId) {
      return new Response(
        JSON.stringify({ error: 'Missing folder ID' }),
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Initialize Google Drive client with service account
    const auth = new JWT({
      email: Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
      key: Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    if (!auth.email || !auth.key) {
      return new Response(
        JSON.stringify({ error: 'Missing Google service account credentials' }),
        { 
          status: 500,
          headers: corsHeaders
        }
      );
    }

    const drive = google.drive({ version: 'v3', auth });

    // Delete the folder
    await drive.files.delete({
      fileId: folderId,
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error
      }),
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}); 