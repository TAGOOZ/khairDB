export function debounce<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  let promise: Promise<any> | null = null;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    
    // Return existing promise if one is in flight
    if (promise) return;

    promise = new Promise((resolve) => {
      timeout = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolve(result);
        } catch (error) {
          console.error('Debounced function error:', error);
          resolve(null);
        } finally {
          promise = null;
        }
      }, wait);
    });
  };
}
