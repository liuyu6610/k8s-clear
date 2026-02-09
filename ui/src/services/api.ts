/**
 * API 服务层 - 为后续对接真实后端预留接口
 * 当前使用 Mock 数据，后续可以替换为真实 HTTP 请求
 */

export interface Cleaner {
  name: string;
  schedule: string;
  action: "Delete" | "Transform" | "Scan";
  description: string;
  lastRun: string;
  nextRun?: string;
  status: "Healthy" | "Degraded" | "Error";
  resourceSelectors: number;
  notifications: string[];
  createdAt: string;
}

export interface Report {
  id: string;
  cleanerName: string;
  action: string;
  affectedResources: number;
  generatedAt: string;
  storePath?: string;
  resources?: Array<{
    namespace: string;
    name: string;
    kind: string;
    apiVersion: string;
  }>;
}

export interface DashboardStats {
  clusters: number;
  cleaners: number;
  last24hRuns: number;
  errorRate: number;
  deletedResources: number;
  updatedResources: number;
  scannedResources: number;
}

export interface RunDurationData {
  timestamp: string;
  p50: number;
  p95: number;
  p99: number;
}

export interface ResourceTrendData {
  timestamp: string;
  deleted: number;
  updated: number;
  scanned: number;
}

// Mock 数据生成器
const generateMockCleaners = (): Cleaner[] => [
  {
    name: "unused-configmaps",
    schedule: "0 */1 * * *",
    action: "Delete",
    description: "删除未被任何工作负载引用的 ConfigMap",
    lastRun: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
    status: "Healthy",
    resourceSelectors: 1,
    notifications: ["Slack", "Report"],
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    name: "orphaned-secrets",
    schedule: "15 */2 * * *",
    action: "Delete",
    description: "清理孤儿 Secret（未挂载 / 未被引用）",
    lastRun: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 102 * 60 * 1000).toISOString(),
    status: "Healthy",
    resourceSelectors: 1,
    notifications: ["Report"],
    createdAt: "2024-01-20T08:30:00Z"
  },
  {
    name: "pods-with-expired-certs",
    schedule: "*/30 * * * *",
    action: "Scan",
    description: "扫描使用过期证书的 Pod，仅上报不删除",
    lastRun: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 28 * 60 * 1000).toISOString(),
    status: "Degraded",
    resourceSelectors: 1,
    notifications: ["Slack", "SMTP"],
    createdAt: "2024-02-01T14:20:00Z"
  },
  {
    name: "deployments-with-zero-replicas",
    schedule: "0 3 * * *",
    action: "Transform",
    description: "定时将 0 副本但带特定标签的 Deployment 缩容并加标记",
    lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(),
    status: "Error",
    resourceSelectors: 2,
    notifications: ["Report", "Event"],
    createdAt: "2024-01-10T12:00:00Z"
  },
  {
    name: "completed-jobs-cleanup",
    schedule: "0 */6 * * *",
    action: "Delete",
    description: "清理超过 7 天的已完成 Job",
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: "Healthy",
    resourceSelectors: 1,
    notifications: ["Report"],
    createdAt: "2024-01-25T09:15:00Z"
  },
  {
    name: "unused-pvcs",
    schedule: "0 2 * * *",
    action: "Delete",
    description: "删除未绑定的 PersistentVolumeClaim",
    lastRun: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: "Healthy",
    resourceSelectors: 1,
    notifications: ["Slack"],
    createdAt: "2024-01-18T11:00:00Z"
  },
  {
    name: "stale-service-accounts",
    schedule: "0 4 * * 0",
    action: "Scan",
    description: "每周扫描未被使用的 ServiceAccount",
    lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Healthy",
    resourceSelectors: 1,
    notifications: ["Report"],
    createdAt: "2024-01-05T10:00:00Z"
  },
  {
    name: "outdated-secret-pods",
    schedule: "*/15 * * * *",
    action: "Scan",
    description: "检测使用过期 Secret 数据的 Pod",
    lastRun: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    status: "Degraded",
    resourceSelectors: 1,
    notifications: ["Slack", "SMTP", "Report"],
    createdAt: "2024-02-05T16:30:00Z"
  }
];

const generateMockReports = (): Report[] => [
  {
    id: "1",
    cleanerName: "unused-configmaps",
    action: "Delete",
    affectedResources: 42,
    generatedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    storePath: "/var/run/k8s-cleaner/unused-configmaps",
    resources: Array.from({ length: 5 }, (_, i) => ({
      namespace: `ns-${i % 3}`,
      name: `configmap-${i}`,
      kind: "ConfigMap",
      apiVersion: "v1"
    }))
  },
  {
    id: "2",
    cleanerName: "pods-with-expired-certs",
    action: "Scan",
    affectedResources: 5,
    generatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: "3",
    cleanerName: "completed-jobs-cleanup",
    action: "Delete",
    affectedResources: 120,
    generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    storePath: "/var/run/k8s-cleaner/completed-jobs"
  }
];

// API 函数
export const api = {
  // 获取 Dashboard 统计数据
  async getDashboardStats(): Promise<DashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 300)); // 模拟网络延迟
    return {
      clusters: 1,
      cleaners: 8,
      last24hRuns: 132,
      errorRate: 0.007,
      deletedResources: 2847,
      updatedResources: 156,
      scannedResources: 892
    };
  },

  // 获取所有 Cleaner
  async getCleaners(): Promise<Cleaner[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return generateMockCleaners();
  },

  // 获取单个 Cleaner 详情
  async getCleaner(name: string): Promise<Cleaner | null> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const cleaners = generateMockCleaners();
    return cleaners.find(c => c.name === name) || null;
  },

  // 获取所有 Report
  async getReports(): Promise<Report[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return generateMockReports();
  },

  // 获取单个 Report 详情
  async getReport(id: string): Promise<Report | null> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const reports = generateMockReports();
    return reports.find(r => r.id === id) || null;
  },

  // 获取运行耗时分布数据
  async getRunDurationData(): Promise<RunDurationData[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const now = Date.now();
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(now - (23 - i) * 60 * 60 * 1000).toISOString(),
      p50: 0.5 + Math.random() * 0.3,
      p95: 1.2 + Math.random() * 0.5,
      p99: 2.0 + Math.random() * 0.8
    }));
  },

  // 获取资源清理趋势数据
  async getResourceTrendData(): Promise<ResourceTrendData[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const now = Date.now();
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(now - (23 - i) * 60 * 60 * 1000).toISOString(),
      deleted: Math.floor(50 + Math.random() * 100),
      updated: Math.floor(5 + Math.random() * 20),
      scanned: Math.floor(20 + Math.random() * 50)
    }));
  }
};

