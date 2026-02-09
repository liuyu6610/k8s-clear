import { useEffect, useState } from "react";
import { useAppStore } from "../../store/useAppStore";
import { Card, CardHeader, CardValue } from "../../components/Card";
import { LoadingOverlay } from "../../components/LoadingSpinner";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { api, RunDurationData, ResourceTrendData } from "../../services/api";

export function DashboardPage() {
  const { dashboardStats, loading, refreshDashboard, lastRefresh } = useAppStore();
  const [durationData, setDurationData] = useState<RunDurationData[]>([]);
  const [trendData, setTrendData] = useState<ResourceTrendData[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    refreshDashboard();
    loadChartData();
    
    // 每30秒自动刷新
    const interval = setInterval(() => {
      refreshDashboard();
      loadChartData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadChartData = async () => {
    setLoadingCharts(true);
    try {
      const [duration, trend] = await Promise.all([
        api.getRunDurationData(),
        api.getResourceTrendData()
      ]);
      setDurationData(duration);
      setTrendData(trend);
    } finally {
      setLoadingCharts(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), "HH:mm");
  };

  if (loading.dashboard && !dashboardStats) {
    return <LoadingOverlay message="加载仪表盘数据..." />;
  }

  const stats = dashboardStats || {
    clusters: 0,
    cleaners: 0,
    last24hRuns: 0,
    errorRate: 0,
    deletedResources: 0,
    updatedResources: 0,
    scannedResources: 0
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-top">
          <h1>总览仪表盘</h1>
          {lastRefresh.dashboard && (
            <div className="page-header-meta">
              最后更新: {format(new Date(lastRefresh.dashboard), "HH:mm:ss")}
            </div>
          )}
        </div>
        <p>
          从 SRE 视角快速感知集群"卫生"状况：Cleaner 运行频率、失败率、资源清理量等。
        </p>
      </div>

      <div className="grid-4">
        <Card animated>
          <CardHeader title="接入集群数" />
          <CardValue value={stats.clusters} />
          <div className="card-desc">未来可扩展到多集群 / 多环境视图</div>
        </Card>

        <Card animated>
          <CardHeader title="已配置 Cleaner 数" />
          <CardValue value={stats.cleaners} />
          <div className="card-desc">覆盖未使用资源、异常 Pod、证书过期等场景</div>
        </Card>

        <Card animated>
          <CardHeader title="近 24 小时运行次数" />
          <CardValue value={stats.last24hRuns} />
          <div className="card-desc">来自 k8s_cleaner_runs_total 的聚合</div>
        </Card>

        <Card animated>
          <CardHeader title="近 24 小时失败率" />
          <CardValue 
            value={(stats.errorRate * 100).toFixed(2)} 
            unit="%"
            trend={{
              value: stats.errorRate < 0.01 ? -15 : 5,
              label: "vs 昨日"
            }}
          />
          <div className="card-desc">基于 runs_total + error_resources_total 计算</div>
        </Card>
      </div>

      <div className="grid-3 mt-lg">
        <Card animated>
          <CardHeader title="已删除资源" />
          <CardValue value={stats.deletedResources.toLocaleString()} />
          <div className="card-desc">累计删除的资源总数</div>
        </Card>

        <Card animated>
          <CardHeader title="已更新资源" />
          <CardValue value={stats.updatedResources.toLocaleString()} />
          <div className="card-desc">累计更新的资源总数</div>
        </Card>

        <Card animated>
          <CardHeader title="已扫描资源" />
          <CardValue value={stats.scannedResources.toLocaleString()} />
          <div className="card-desc">累计扫描的资源总数</div>
        </Card>
      </div>

      <div className="grid-2 mt-lg">
        <Card animated>
          <CardHeader title="Cleaner 运行耗时分布" />
          <div className="card-desc">
            Prometheus 指标: k8s_cleaner_run_duration_seconds (P50/P95/P99)
          </div>
          {loadingCharts ? (
            <div className="chart-placeholder">加载图表数据...</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="#94a3b8"
                  style={{ fontSize: "11px" }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: "11px" }}
                  label={{ value: "秒", angle: -90, position: "insideLeft", style: { fill: "#94a3b8" } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    borderRadius: "8px"
                  }}
                  labelFormatter={(label) => format(new Date(label), "yyyy-MM-dd HH:mm")}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="p50" 
                  stroke="#38bdf8" 
                  strokeWidth={2}
                  dot={false}
                  name="P50"
                />
                <Line 
                  type="monotone" 
                  dataKey="p95" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={false}
                  name="P95"
                />
                <Line 
                  type="monotone" 
                  dataKey="p99" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={false}
                  name="P99"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card animated>
          <CardHeader title="资源清理量趋势" />
          <div className="card-desc">
            基于 deleted/updated/scan 三类 Counter，按资源类型聚合展示
          </div>
          {loadingCharts ? (
            <div className="chart-placeholder">加载图表数据...</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorDeleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorUpdated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorScanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  stroke="#94a3b8"
                  style={{ fontSize: "11px" }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  style={{ fontSize: "11px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.3)",
                    borderRadius: "8px"
                  }}
                  labelFormatter={(label) => format(new Date(label), "yyyy-MM-dd HH:mm")}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="deleted" 
                  stackId="1"
                  stroke="#ef4444" 
                  fill="url(#colorDeleted)"
                  name="已删除"
                />
                <Area 
                  type="monotone" 
                  dataKey="updated" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="url(#colorUpdated)"
                  name="已更新"
                />
                <Area 
                  type="monotone" 
                  dataKey="scanned" 
                  stackId="1"
                  stroke="#22c55e" 
                  fill="url(#colorScanned)"
                  name="已扫描"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
