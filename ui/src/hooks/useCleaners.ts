import { useState, useEffect } from 'react';
import { api, type Cleaner } from '../lib/api';
import toast from 'react-hot-toast';

export function useCleaners() {
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCleaners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCleaners();
      setCleaners(response.items);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch cleaners');
      setError(error);
      toast.error(`加载 Cleaners 失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCleaners();
    // 每 30 秒自动刷新
    const interval = setInterval(fetchCleaners, 30000);
    return () => clearInterval(interval);
  }, []);

  return { cleaners, loading, error, refetch: fetchCleaners };
}

