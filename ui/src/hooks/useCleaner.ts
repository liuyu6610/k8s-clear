import { useState, useEffect } from 'react';
import { api, type Cleaner } from '../lib/api';
import toast from 'react-hot-toast';

export function useCleaner(name: string) {
  const [cleaner, setCleaner] = useState<Cleaner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCleaner = async () => {
    if (!name) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCleaner(name);
      setCleaner(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch cleaner');
      setError(error);
      toast.error(`加载 Cleaner 失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCleaner();
  }, [name]);

  return { cleaner, loading, error, refetch: fetchCleaner };
}

