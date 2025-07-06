import React, { useState } from 'react';
import { setupStorageBuckets, enableAnonymousUploads } from '../../setup/setupStorage';

/**
 * Admin component for setting up storage buckets and permissions
 * Only administrators with proper permissions should have access to this component
 */
export function StorageSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [success, setSuccess] = useState<boolean | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const handleSetupStorage = async () => {
    setIsLoading(true);
    setSuccess(null);
    addLog('Starting storage setup...');
    
    try {
      // Override console.log to capture logs
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      
      console.log = (message: any, ...args: any[]) => {
        originalConsoleLog(message, ...args);
        addLog(typeof message === 'string' ? message : JSON.stringify(message));
      };
      
      console.error = (message: any, ...args: any[]) => {
        originalConsoleError(message, ...args);
        addLog(`ERROR: ${typeof message === 'string' ? message : JSON.stringify(message)}`);
      };
      
      const result = await setupStorageBuckets();
      setSuccess(result);
      
      // Restore original console functions
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      
    } catch (error) {
      addLog(`Setup failed: ${error instanceof Error ? error.message : String(error)}`);
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableAnonymous = async () => {
    if (!confirm("Warning: This will allow anyone to upload files without authentication. Are you sure?")) {
      return;
    }
    
    setIsLoading(true);
    addLog('Enabling anonymous uploads...');
    
    try {
      // Override console.log to capture logs
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      
      console.log = (message: any, ...args: any[]) => {
        originalConsoleLog(message, ...args);
        addLog(typeof message === 'string' ? message : JSON.stringify(message));
      };
      
      console.error = (message: any, ...args: any[]) => {
        originalConsoleError(message, ...args);
        addLog(`ERROR: ${typeof message === 'string' ? message : JSON.stringify(message)}`);
      };
      
      const result = await enableAnonymousUploads();
      
      // Restore original console functions
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      
      addLog(result ? '✅ Anonymous uploads enabled' : '❌ Failed to enable anonymous uploads');
    } catch (error) {
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Storage Setup for Production</h2>
      
      <div className="p-4 border-l-4 border-blue-500 bg-blue-50 mb-4">
        <h3 className="font-medium text-blue-800">Administrator Access Required</h3>
        <p className="text-blue-700 text-sm">
          This tool sets up proper Supabase storage buckets and permissions for production use.
          You must have administrator privileges to use these functions.
        </p>
      </div>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleSetupStorage}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
        >
          {isLoading ? 'Setting up...' : 'Setup Storage for Production'}
        </button>
        
        <button
          onClick={handleEnableAnonymous}
          disabled={isLoading}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-yellow-300"
        >
          Enable Anonymous Uploads
        </button>
      </div>
      
      {success === true && (
        <div className="p-4 border-l-4 border-green-500 bg-green-50 mb-4">
          <p className="text-green-700">
            ✅ Storage has been successfully set up for production use!
          </p>
        </div>
      )}
      
      {success === false && (
        <div className="p-4 border-l-4 border-red-500 bg-red-50 mb-4">
          <p className="text-red-700">
            ❌ Storage setup failed. Check the logs for details.
          </p>
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Setup Logs</h3>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-64 font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet</p>
          ) : (
            logs.map((entry, i) => <div key={i} className="mb-1">{entry}</div>)
          )}
        </div>
      </div>
    </div>
  );
} 