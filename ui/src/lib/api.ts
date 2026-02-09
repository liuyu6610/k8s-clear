/*
 * API 服务层 - 统一管理所有 API 调用
 * 当前使用 mock 数据，后续可替换为真实后端接口
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证 token
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 统一错误处理
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export interface Cleaner {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    labels?: Record<string, string>;
    creationTimestamp?: string;
  };
  spec: {
    action: 'Delete' | 'Transform' | 'Scan';
    schedule: string;
    storeResourcePath?: string;
    notifications?: Array<{
      name: string;
      type: string;
      notificationRef?: {
        name: string;
        namespace?: string;
      };
    }>;
    resourcePolicySet: {
      resourceSelectors: Array<{
        namespace?: string;
        namespaceSelector?: string;
        group: string;
        version: string;
        kind: string;
        labelFilters?: Array<{
          key: string;
          operation: string;
          value: string;
        }>;
        excludeDeleted?: boolean;
        evaluate?: string;
      }>;
      aggregatedSelection?: string;
    };
    deleteOptions?: {
      gracePeriodSeconds?: number;
      propagationPolicy?: string;
    };
    transform?: string;
    startingDeadlineSeconds?: number;
  };
  status: {
    lastRunTime?: string;
    nextScheduleTime?: string;
    failureMessage?: string;
  };
}

export interface CleanerListResponse {
  items: Cleaner[];
  total: number;
}

export interface CleanerStats {
  totalCleaners: number;
  activeCleaners: number;
  resourcesDeleted24h: number;
  resourcesDeleted7d: number;
  failedOperations: number;
  successRate: number;
}

export interface ExecutionHistory {
  cleanerName: string;
  executionTime: string;
  action: string;
  matchedResources: number;
  processedResources: number;
  failedResources: number;
  status: 'success' | 'partial' | 'failed';
  duration: number;
}

// Mock 数据生成函数
const generateMockCleaners = (): Cleaner[] => {
  return [
    {
      apiVersion: 'apps.projectsveltos.io/v1alpha1',
      kind: 'Cleaner',
      metadata: {
        name: 'unused-configmaps',
        creationTimestamp: '2026-01-15T10:00:00Z',
        labels: { 'environment': 'prod' },
      },
      spec: {
        action: 'Delete',
        schedule: '0 3 * * *',
        storeResourcePath: '/data/cleaner/unused-configmaps',
        notifications: [
          { name: 'slack-cleaner', type: 'Slack' },
          { name: 'daily-report', type: 'CleanerReport' },
        ],
        resourcePolicySet: {
          resourceSelectors: [
            {
              namespace: '',
              namespaceSelector: 'environment=prod',
              group: '',
              version: 'v1',
              kind: 'ConfigMap',
              labelFilters: [
                { key: 'app', operation: 'Equal', value: 'legacy' },
              ],
              excludeDeleted: true,
            },
          ],
        },
      },
      status: {
        lastRunTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        nextScheduleTime: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      apiVersion: 'apps.projectsveltos.io/v1alpha1',
      kind: 'Cleaner',
      metadata: {
        name: 'completed-jobs-gc',
        creationTimestamp: '2026-01-10T08:00:00Z',
        labels: { 'environment': 'prod' },
      },
      spec: {
        action: 'Delete',
        schedule: '*/30 * * * *',
        notifications: [{ name: 'slack-cleaner', type: 'Slack' }],
        resourcePolicySet: {
          resourceSelectors: [
            {
              namespace: '',
              group: 'batch',
              version: 'v1',
              kind: 'Job',
              excludeDeleted: true,
            },
          ],
        },
      },
      status: {
        lastRunTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        nextScheduleTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
    },
    {
      apiVersion: 'apps.projectsveltos.io/v1alpha1',
      kind: 'Cleaner',
      metadata: {
        name: 'stale-deployments-scan',
        creationTimestamp: '2026-01-20T12:00:00Z',
        labels: { 'environment': 'dev' },
      },
      spec: {
        action: 'Scan',
        schedule: '0 */6 * * *',
        resourcePolicySet: {
          resourceSelectors: [
            {
              namespace: 'default',
              group: 'apps',
              version: 'v1',
              kind: 'Deployment',
              excludeDeleted: true,
            },
          ],
        },
      },
      status: {
        lastRunTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        nextScheduleTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      apiVersion: 'apps.projectsveltos.io/v1alpha1',
      kind: 'Cleaner',
      metadata: {
        name: 'orphaned-secrets',
        creationTimestamp: '2026-01-12T14:00:00Z',
        labels: { 'environment': 'prod' },
      },
      spec: {
        action: 'Delete',
        schedule: '0 2 * * *',
        resourcePolicySet: {
          resourceSelectors: [
            {
              namespace: '',
              group: '',
              version: 'v1',
              kind: 'Secret',
              excludeDeleted: true,
            },
          ],
        },
      },
      status: {
        lastRunTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        nextScheduleTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        failureMessage: '部分资源删除失败：权限不足',
      },
    },
  ];
};

const generateMockStats = (): CleanerStats => {
  return {
    totalCleaners: 12,
    activeCleaners: 10,
    resourcesDeleted24h: 348,
    resourcesDeleted7d: 2156,
    failedOperations: 3,
    successRate: 97.5,
  };
};

const generateMockHistory = (cleanerName: string): ExecutionHistory[] => {
  const history: ExecutionHistory[] = [];
  const now = Date.now();
  for (let i = 0; i < 20; i++) {
    const time = new Date(now - i * 6 * 60 * 60 * 1000);
    history.push({
      cleanerName,
      executionTime: time.toISOString(),
      action: i % 3 === 0 ? 'Scan' : 'Delete',
      matchedResources: Math.floor(Math.random() * 200) + 10,
      processedResources: Math.floor(Math.random() * 200) + 10,
      failedResources: i % 7 === 0 ? Math.floor(Math.random() * 5) : 0,
      status: i % 7 === 0 ? (i % 14 === 0 ? 'failed' : 'partial') : 'success',
      duration: Math.floor(Math.random() * 5000) + 500,
    });
  }
  return history;
};

// API 函数
export const api = {
  // 获取所有 Cleaners
  async getCleaners(): Promise<CleanerListResponse> {
    // TODO: 替换为真实 API
    // return apiClient.get<CleanerListResponse>('/cleaners');
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      items: generateMockCleaners(),
      total: generateMockCleaners().length,
    };
  },

  // 获取单个 Cleaner
  async getCleaner(name: string): Promise<Cleaner> {
    // TODO: 替换为真实 API
    // return apiClient.get<Cleaner>(`/cleaners/${name}`);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const cleaners = generateMockCleaners();
    const cleaner = cleaners.find((c) => c.metadata.name === name);
    if (!cleaner) {
      throw new Error(`Cleaner ${name} not found`);
    }
    return cleaner;
  },

  // 获取统计信息
  async getStats(): Promise<CleanerStats> {
    // TODO: 替换为真实 API
    // return apiClient.get<CleanerStats>('/stats');
    await new Promise((resolve) => setTimeout(resolve, 200));
    return generateMockStats();
  },

  // 获取执行历史
  async getExecutionHistory(cleanerName: string, limit = 50): Promise<ExecutionHistory[]> {
    // TODO: 替换为真实 API
    // return apiClient.get<ExecutionHistory[]>(`/cleaners/${cleanerName}/history`, { params: { limit } });
    await new Promise((resolve) => setTimeout(resolve, 200));
    return generateMockHistory(cleanerName).slice(0, limit);
  },

  // 触发 Scan（DryRun）
  async triggerScan(name: string): Promise<{ message: string }> {
    // TODO: 替换为真实 API
    // return apiClient.post(`/cleaners/${name}/scan`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { message: `Scan triggered for ${name}` };
  },

  // 删除 Cleaner
  async deleteCleaner(name: string): Promise<void> {
    // TODO: 替换为真实 API
    // return apiClient.delete(`/cleaners/${name}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  },
};

