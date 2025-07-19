import { supabase } from '../lib/supabase';

interface CreateFolderResponse {
  folderId: string;
  folderUrl: string;
}

export async function createIndividualFolderAPI(
  individualId: string,
  firstName: string,
  lastName: string
): Promise<CreateFolderResponse> {
  try {
    // Get the session token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    const { data, error } = await supabase.functions.invoke('create-drive-folder', {
      body: {
        individualId,
        firstName,
        lastName
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      throw new Error(`Failed to create folder: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating Google Drive folder:', error);
    throw error;
  }
}

export async function deleteIndividualFolderAPI(folderId: string): Promise<void> {
  try {
    // Get the session token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session');
    }

    const { error } = await supabase.functions.invoke('delete-drive-folder', {
      body: { folderId },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      throw new Error(`Failed to delete folder: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting Google Drive folder:', error);
    throw error;
  }
} 