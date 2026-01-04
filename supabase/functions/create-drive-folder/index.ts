import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { google } from 'npm:googleapis@153.0.0';
import { JWT } from 'npm:google-auth-library@10.1.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    // 1. Verify Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Create a Supabase client with the Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the user from the token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError }),
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Parse Request Body
    const { individualId, firstName, lastName } = await req.json();

    if (!individualId || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // 3. Initialize Google Drive client with service account
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
    const INDIVIDUALS_FOLDER_ID = Deno.env.get('GOOGLE_DRIVE_INDIVIDUALS_FOLDER_ID');

    if (!INDIVIDUALS_FOLDER_ID) {
      return new Response(
        JSON.stringify({ error: 'Missing parent folder ID' }),
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }

    // Create folder name in the format: individualId_firstName_lastName
    const folderName = `${individualId}_${firstName}_${lastName}`;

    // Create the folder in Google Drive
    const folder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [INDIVIDUALS_FOLDER_ID],
      },
      fields: 'id, webViewLink',
    });

    if (!folder.data.id) {
      return new Response(
        JSON.stringify({ error: 'Failed to create folder in Google Drive' }),
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }

    // Return folder ID and URL
    return new Response(
      JSON.stringify({
        folderId: folder.data.id,
        folderUrl: folder.data.webViewLink || '',
      }),
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