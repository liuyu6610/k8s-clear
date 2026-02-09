import { useState, useEffect } from 'react';
import { api, type CleanerStats } from '../lib/api';
import toast from 'react-hot-toast';

export function useStats() {
  const [stats, setStats] = useState<CleanerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch stats');
      setError(error);
      toast.error(`加载统计信息失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // 每 60 秒自动刷新
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}

