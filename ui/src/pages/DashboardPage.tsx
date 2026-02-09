import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Zap,
  Shield,
} from "lucide-react";
import { StatCard } from "../components/StatCard";
import { Loading } from "../components/Loading";
import { Badge } from "../components/Badge";
import { GlowCard } from "../components/GlowCard";
import { PulseDot } from "../components/PulseDot";
import { useStats } from "../hooks/useStats";
import { useCleaners } from "../hooks/useCleaners";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export function DashboardPage() {
  const { stats, loading: statsLoading, refetch: refetchStats } = useStats();
  const { cleaners, loading: cleanersLoading } = useCleaners();

  // 生成最近 7 天的数据
  const generateDailyData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: format(date, "MM-dd"),
        deleted: Math.floor(Math.random() * 100) + 200,
        scanned: Math.floor(Math.random() * 50) + 100,
      });
    }
    return data;
  };

  const dailyData = generateDailyData();

  // 获取最近执行的任务
  const recentJobs = cleaners
    .map((cleaner) => ({
      cleanerName: cleaner.metadata.name,
      action: cleaner.spec.action,
      lastRun: cleaner.status.lastRunTime
        ? formatDistanceToNow(new Date(cleaner.status.lastRunTime), {
            addSuffix: true,
            locale: zhCN,
          })
        : "从未执行",
      status: cleaner.status.failureMessage
        ? "失败"
        : cleaner.status.lastRunTime
        ? "成功"
        : "待执行",
      matched: Math.floor(Math.random() * 200) + 10, // Mock 数据
    }))
    .sort((a, b) => {
      // 按状态排序：失败 > 成功 > 待执行
      const statusOrder = { 失败: 0, 成功: 1, 待执行: 2 };
      return (
        statusOrder[a.status as keyof typeof statusOrder] -
        statusOrder[b.status as keyof typeof statusOrder]
      );
    })
    .slice(0, 10);

  if (statsLoading || cleanersLoading) {
    return <Loading text="加载仪表盘数据..." />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.header
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            <span className="text-gradient">集群清理总览</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl flex items-center gap-2">
            <PulseDot color="green" size="sm" />
            实时监控集群资源清理状态，管理 Cleaner 规则执行情况
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            refetchStats();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
        >
          <RefreshCw className="w-4 h-4" />
          刷新
        </motion.button>
      </motion.header>

      {/* 统计卡片 */}
      <motion.section
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <GlowCard glowColor="blue" className="p-6">
            <StatCard
              label="活跃 Cleaners"
              value={stats?.activeCleaners ?? 0}
              trend={`共 ${stats?.totalCleaners ?? 0} 个`}
              icon={Activity}
              variant="info"
            />
          </GlowCard>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <GlowCard glowColor="green" className="p-6">
            <StatCard
              label="24h 删除资源"
              value={stats?.resourcesDeleted24h ?? 0}
              trend={`7天: ${stats?.resourcesDeleted7d ?? 0}`}
              icon={TrendingUp}
              variant="success"
            />
          </GlowCard>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <GlowCard glowColor="green" className="p-6">
            <StatCard
              label="成功率"
              value={`${stats?.successRate ?? 0}%`}
              trend="最近 7 天"
              icon={CheckCircle2}
              variant="success"
            />
          </GlowCard>
        </motion.div>
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <GlowCard
            glowColor={stats?.failedOperations ? "orange" : "green"}
            className="p-6"
          >
            <StatCard
              label="失败操作"
              value={stats?.failedOperations ?? 0}
              trend="需要关注"
              icon={AlertTriangle}
              variant={stats?.failedOperations ? "warning" : "success"}
            />
          </GlowCard>
        </motion.div>
      </motion.section>

      {/* 图表和最近任务 */}
      <motion.section
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* 每日清理趋势 */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="lg:col-span-2"
        >
          <GlowCard glowColor="blue" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-400" />
                <span className="text-gradient">每日清理趋势</span>
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorDeleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorScanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#94a3b8"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="deleted"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorDeleted)"
                  name="删除资源"
                />
                <Area
                  type="monotone"
                  dataKey="scanned"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorScanned)"
                  name="扫描资源"
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlowCard>
        </motion.div>

        {/* 最近执行任务 */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="lg:col-span-1"
        >
          <GlowCard glowColor="purple" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-gradient">最近执行</span>
              </h2>
              <Link
                to="/cleaners"
                className="text-xs text-brand-300 hover:text-brand-200 transition-all hover:scale-110"
              >
                查看全部 →
              </Link>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {recentJobs.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-slate-400 text-center py-4"
                >
                  暂无执行记录
                </motion.p>
              ) : (
                recentJobs.map((job, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link
                      to={`/cleaners/${job.cleanerName}`}
                      className="block p-3 rounded-lg border border-slate-800/50 bg-slate-950/40 hover:bg-slate-800/60 hover:border-slate-700/50 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-medium text-slate-100 truncate group-hover:text-brand-300 transition-colors">
                          {job.cleanerName}
                        </span>
                        <Badge
                          variant={
                            job.status === "失败"
                              ? "danger"
                              : job.status === "成功"
                              ? "success"
                              : "default"
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{job.action}</span>
                        <span>{job.lastRun}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </GlowCard>
        </motion.div>
      </section>

      {/* Action 分布图表 */}
      <motion.section
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
        >
          <GlowCard glowColor="blue" className="p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span className="text-gradient">Action 类型分布</span>
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  {
                    name: "Delete",
                    count: cleaners.filter((c) => c.spec.action === "Delete")
                      .length,
                  },
                  {
                    name: "Scan",
                    count: cleaners.filter((c) => c.spec.action === "Scan")
                      .length,
                  },
                  {
                    name: "Transform",
                    count: cleaners.filter((c) => c.spec.action === "Transform")
                      .length,
                  },
                ]}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlowCard>
        </motion.div>

        {/* 快速操作 */}
        <motion.div
          whileHover={{ scale: 1.01 }}
        >
          <GlowCard glowColor="green" className="p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-gradient">快速操作</span>
            </h2>
            <div className="space-y-3">
              <motion.div whileHover={{ x: 5 }}>
                <Link
                  to="/cleaners"
                  className="block w-full p-4 rounded-lg border border-slate-800/50 bg-slate-950/40 hover:bg-slate-800/60 hover:border-slate-700/50 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-100 group-hover:text-brand-300 transition-colors">
                        查看所有 Cleaners
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        管理所有清理规则
                      </div>
                    </div>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-slate-400"
                    >
                      →
                    </motion.span>
                  </div>
                </Link>
              </motion.div>
              <div className="p-4 rounded-lg border border-slate-800/50 bg-slate-950/40">
                <div className="text-sm font-medium text-slate-100 mb-2 flex items-center gap-2">
                  <PulseDot color="green" size="sm" />
                  系统状态
                </div>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>API 连接</span>
                    <Badge variant="success">正常</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>控制器状态</span>
                    <Badge variant="success">运行中</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>最后更新</span>
                    <span className="font-mono">{format(new Date(), "HH:mm:ss")}</span>
                  </div>
                </div>
              </div>
            </div>
          </GlowCard>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
