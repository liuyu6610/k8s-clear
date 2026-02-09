/**
 * 全局状态管理 - 使用 Zustand
 */

import { create } from "zustand";
import { Cleaner, Report, DashboardStats } from "../services/api";

interface AppState {
  // 数据
  cleaners: Cleaner[];
  reports: Report[];
  dashboardStats: DashboardStats | null;
  
  // 加载状态
  loading: {
    cleaners: boolean;
    reports: boolean;
    dashboard: boolean;
  };
  
  // 错误状态
  errors: {
    cleaners: string | null;
    reports: string | null;
    dashboard: string | null;
  };
  
  // 刷新时间戳
  lastRefresh: {
    cleaners: number | null;
    reports: number | null;
    dashboard: number | null;
  };
  
  // Actions
  setCleaners: (cleaners: Cleaner[]) => void;
  setReports: (reports: Report[]) => void;
  setDashboardStats: (stats: DashboardStats) => void;
  setLoading: (key: keyof AppState["loading"], value: boolean) => void;
  setError: (key: keyof AppState["errors"], error: string | null) => void;
  refreshCleaners: () => Promise<void>;
  refreshReports: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  cleaners: [],
  reports: [],
  dashboardStats: null,
  
  loading: {
    cleaners: false,
    reports: false,
    dashboard: false
  },
  
  errors: {
    cleaners: null,
    reports: null,
    dashboard: null
  },
  
  lastRefresh: {
    cleaners: null,
    reports: null,
    dashboard: null
  },
  
  setCleaners: (cleaners) => set({ cleaners }),
  setReports: (reports) => set({ reports }),
  setDashboardStats: (dashboardStats) => set({ dashboardStats }),
  
  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value }
    })),
  
  setError: (key, error) =>
    set((state) => ({
      errors: { ...state.errors, [key]: error }
    })),
  
  refreshCleaners: async () => {
    const { setLoading, setError, setCleaners } = get();
    setLoading("cleaners", true);
    setError("cleaners", null);
    
    try {
      const { api } = await import("../services/api");
      const cleaners = await api.getCleaners();
      setCleaners(cleaners);
      set({ lastRefresh: { ...get().lastRefresh, cleaners: Date.now() } });
    } catch (err) {
      setError("cleaners", err instanceof Error ? err.message : "Failed to load cleaners");
    } finally {
      setLoading("cleaners", false);
    }
  },
  
  refreshReports: async () => {
    const { setLoading, setError, setReports } = get();
    setLoading("reports", true);
    setError("reports", null);
    
    try {
      const { api } = await import("../services/api");
      const reports = await api.getReports();
      setReports(reports);
      set({ lastRefresh: { ...get().lastRefresh, reports: Date.now() } });
    } catch (err) {
      setError("reports", err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading("reports", false);
    }
  },
  
  refreshDashboard: async () => {
    const { setLoading, setError, setDashboardStats } = get();
    setLoading("dashboard", true);
    setError("dashboard", null);
    
    try {
      const { api } = await import("../services/api");
      const stats = await api.getDashboardStats();
      setDashboardStats(stats);
      set({ lastRefresh: { ...get().lastRefresh, dashboard: Date.now() } });
    } catch (err) {
      setError("dashboard", err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading("dashboard", false);
    }
  }
}));

