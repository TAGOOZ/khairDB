import React, { useState, FormEvent, useRef } from 'react';
import { uploadIdCardImage, deleteFile } from '../../services/storage';
import { supabase } from '../../lib/supabase';

/**
 * Test component for verifying MCP uploads
 * This can be used for debugging the MCP upload functionality
 */
export function TestMCPUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ path: string, url: string } | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [fileStats, setFileStats] = useState<{ originalSize: number, filename: string } | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [idNumber, setIdNumber] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileSize = file.size;
    setFileStats({
      originalSize: fileSize,
      filename: file.name
    });
    
    addLog(`Selected file: ${file.name} (${(fileSize / 1024).toFixed(2)} KB, ${file.type})`);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const fileInput = fileInputRef.current;
    if (!fileInput?.files || fileInput.files.length === 0) {
      addLog('No file selected');
      return;
    }
    
    const file = fileInput.files[0];
    
    try {
      setIsUploading(true);
      setError(null);
      addLog('Starting upload with compression...');
      
      if (firstName && idNumber) {
        addLog(`Using naming convention: ${firstName}_personalinfo_${idNumber.substring(0, 5)}`);
      }
      
      // Test the upload with the new parameters
      const result = await uploadIdCardImage(file, firstName, idNumber, 'test-user');
      
      addLog(`Upload successful! Path: ${result.path}`);
      addLog(`URL: ${result.url}`);
      setUploadedFile(result);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error 
        ? `${error.message}\n${error.stack || ''}`
        : JSON.stringify(error, null, 2);
        
      setError(errorMessage);
      addLog(`Error: ${errorMessage}`);
      
      // If it's a StorageError with details, log those too
      if (error instanceof Error && 'details' in error) {
        const details = JSON.stringify((error as any).details, null, 2);
        addLog(`Error details: ${details}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!uploadedFile) return;
    
    try {
      addLog(`Deleting file at path: ${uploadedFile.path}`);
      await deleteFile(uploadedFile.path);
      addLog('File deleted successfully');
      setUploadedFile(null);
    } catch (error) {
      console.error('Delete error:', error);
      addLog(`Delete error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testSupabaseConnection = async () => {
    setIsTesting(true);
    try {
      addLog('Testing Supabase connection...');
      
      // Test 1: Check if we can connect to Supabase
      if (!supabase) {
        addLog('❌ Supabase client is not initialized');
        return;
      }
      addLog('✅ Supabase client is initialized');
      
      // Test 2: Check if storage is available
      if (!supabase.storage) {
        addLog('❌ Supabase storage is not available');
        return;
      }
      addLog('✅ Supabase storage is available');
      
      // Test 3: Try to list buckets
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (bucketsError) {
          addLog(`❌ Failed to list buckets: ${bucketsError.message}`);
        } else {
          const bucketNames = buckets?.map(b => b.name).join(', ') || 'No buckets found';
          addLog(`✅ Listed buckets: ${bucketNames}`);
          
          if (buckets && buckets.length > 0) {
            // Test 4: Check if we can list files in the first bucket
            const firstBucket = buckets[0].name;
            addLog(`Testing file listing in bucket: ${firstBucket}`);
            
            try {
              const { data: files, error: filesError } = await supabase.storage
                .from(firstBucket)
                .list();
                
              if (filesError) {
                addLog(`❌ Cannot list files in bucket: ${filesError.message}`);
              } else {
                const fileCount = files?.length || 0;
                addLog(`✅ Successfully listed files in bucket: ${fileCount} files found`);
              }
            } catch (error) {
              addLog(`❌ Error listing files: ${error instanceof Error ? error.message : String(error)}`);
            }
          } else {
            addLog('⚠️ No buckets visible in listing - will try direct access to idcard bucket');
            
            // Even if no buckets are listed, try directly accessing the idcard bucket
            try {
              const { data: files, error: filesError } = await supabase.storage
                .from('idcard')
                .list();
                
              if (filesError) {
                addLog(`❌ Cannot access idcard bucket: ${filesError.message}`);
              } else {
                const fileCount = files?.length || 0;
                addLog(`✅ Successfully accessed idcard bucket: ${fileCount} files found`);
              }
            } catch (error) {
              addLog(`❌ Error accessing idcard bucket: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
      } catch (error) {
        addLog(`❌ Error listing buckets: ${error instanceof Error ? error.message : String(error)}`);
        
        // Even if listing buckets fails, try direct access to idcard bucket
        try {
          addLog('Trying direct access to idcard bucket...');
          const { data: files, error: filesError } = await supabase.storage
            .from('idcard')
            .list();
            
          if (filesError) {
            addLog(`❌ Cannot access idcard bucket: ${filesError.message}`);
          } else {
            const fileCount = files?.length || 0;
            addLog(`✅ Successfully accessed idcard bucket: ${fileCount} files found`);
          }
        } catch (error) {
          addLog(`❌ Error accessing idcard bucket: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    } catch (error) {
      addLog(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testAllBuckets = async () => {
    setIsTesting(true);
    addLog('Testing all possible buckets...');
    
    // Possible bucket names to try (case variations included)
    const possibleBuckets = [
      'idcard'
    ];
    
    let foundAnyBucket = false;
    
    for (const bucketName of possibleBuckets) {
      try {
        addLog(`Testing bucket: ${bucketName}`);
        const { data: files, error: filesError } = await supabase.storage
          .from(bucketName)
          .list();
          
        if (filesError) {
          addLog(`❌ Cannot access '${bucketName}': ${filesError.message}`);
        } else {
          const fileCount = files?.length || 0;
          addLog(`✅ SUCCESS: Bucket '${bucketName}' is accessible (${fileCount} files)`);
          foundAnyBucket = true;
          
          // Test upload permission with a tiny file
          try {
            const testFile = new File([new Uint8Array([0, 1, 2, 3])], 'test.bin', { type: 'application/octet-stream' });
            const { error: uploadError } = await supabase.storage
              .from(bucketName)
              .upload(`test_${Date.now()}.bin`, testFile, { upsert: true });
              
            if (uploadError) {
              addLog(`❌ Cannot upload to '${bucketName}': ${uploadError.message}`);
            } else {
              addLog(`✅ SUCCESS: Can upload to '${bucketName}'`);
              addLog(`👉 USE THIS BUCKET: '${bucketName}'`);
            }
          } catch (err) {
            addLog(`❌ Error testing upload to '${bucketName}': ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      } catch (err) {
        addLog(`❌ Error testing '${bucketName}': ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    if (!foundAnyBucket) {
      addLog('❌ No accessible buckets found. Please check your Supabase storage permissions.');
    }
    
    setIsTesting(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Test Image Upload with Compression</h2>
      
      <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 mb-4">
        <h3 className="font-medium text-yellow-800">Storage Notice</h3>
        <p className="text-yellow-700 text-sm">
          The app detected that you don't have write permissions to Supabase storage buckets. 
          A localStorage fallback has been enabled for testing. 
          Images will be stored in your browser's localStorage instead of Supabase.
          <br /><br />
          <strong>Note:</strong> This is for testing only. In production, contact your Supabase administrator 
          to create a properly configured storage bucket with appropriate permissions.
        </p>
      </div>
      
      <div className="mb-4 flex space-x-3">
        <button
          onClick={testSupabaseConnection}
          disabled={isTesting}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300"
        >
          {isTesting ? 'Testing...' : 'Test Supabase Connection'}
        </button>
        
        <button
          onClick={testAllBuckets}
          disabled={isTesting}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
        >
          {isTesting ? 'Testing...' : 'Test All Buckets'}
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 text-sm font-medium">
              First Name:
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">
              ID Number:
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter ID number"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Select an image to upload:
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        <button
          type="submit"
          disabled={isUploading}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isUploading ? 'Uploading...' : 'Submit Form & Upload'}
        </button>
        
        {error && <p className="mt-2 text-red-500">{error}</p>}

        {fileStats && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium">Original File</h4>
            <p>Name: {fileStats.filename}</p>
            <p>Size: {(fileStats.originalSize / 1024).toFixed(2)} KB</p>
            <p className="text-xs text-gray-500 mt-2">
              Images over 200KB will be compressed automatically with a quality of 70% and max dimensions of 1200x1200px
            </p>
          </div>
        )}
      </form>
      
      {uploadedFile && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h3 className="font-semibold mb-2">Uploaded File</h3>
          <p><span className="font-medium">Path:</span> {uploadedFile.path}</p>
          <p className="mb-3"><span className="font-medium">URL:</span> {uploadedFile.url}</p>
          
          {uploadedFile.url && (
            <div className="mb-3">
              <a 
                href={uploadedFile.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View File
              </a>
            </div>
          )}
          
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete File
          </button>
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Logs</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-64 font-mono text-sm">
          {log.length === 0 ? (
            <p className="text-gray-500">No logs yet</p>
          ) : (
            log.map((entry, i) => <div key={i} className="mb-1">{entry}</div>)
          )}
        </div>
      </div>
    </div>
  );
} 