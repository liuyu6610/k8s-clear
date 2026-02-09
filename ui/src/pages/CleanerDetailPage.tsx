import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  ArrowLeft,
  RefreshCw,
  Play,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Code,
  Settings,
  History,
  FileText,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { useCleaner } from "../hooks/useCleaner";
import { api, type ExecutionHistory } from "../lib/api";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function CleanerDetailPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { cleaner, loading, error, refetch } = useCleaner(name || "");
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "config">("overview");
  const [history, setHistory] = useState<ExecutionHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadHistory = async () => {
    if (!name) return;
    try {
      setLoadingHistory(true);
      const data = await api.getExecutionHistory(name, 20);
      setHistory(data);
    } catch (err) {
      toast.error(`加载执行历史失败: ${err instanceof Error ? err.message : "未知错误"}`);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleTriggerScan = async () => {
    if (!name) return;
    try {
      await api.triggerScan(name);
      toast.success(`已触发 ${name} 的 Scan 操作`);
      refetch();
      loadHistory();
    } catch (error) {
      toast.error(`触发 Scan 失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  };

  const handleDelete = async () => {
    if (!name) return;
    if (!confirm(`确定要删除 Cleaner "${name}" 吗？此操作不可恢复。`)) return;
    try {
      await api.deleteCleaner(name);
      toast.success(`已删除 ${name}`);
      navigate("/cleaners");
    } catch (error) {
      toast.error(`删除失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <Loading text="加载 Cleaner 详情..." />;
  }

  if (error || !cleaner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">加载失败</h2>
        <p className="text-slate-400 mb-4">{error?.message || "Cleaner 不存在"}</p>
        <Button icon={ArrowLeft} onClick={() => navigate("/cleaners")}>
          返回列表
        </Button>
      </div>
    );
  }

  const statusBadge =
    !cleaner.status.lastRunTime ? (
      <Badge variant="default">待执行</Badge>
    ) : cleaner.status.failureMessage ? (
      <Badge variant="danger">失败</Badge>
    ) : (
      <Badge variant="success">正常</Badge>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 头部 */}
      <header>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Link to="/cleaners" className="hover:text-brand-300 transition-colors">
            Cleaners
          </Link>
          <span>/</span>
          <span className="text-slate-300">{cleaner.metadata.name}</span>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {cleaner.metadata.name}
              </h1>
              {statusBadge}
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              {cleaner.metadata.labels?.["environment"] && (
                <Badge variant="info" className="mr-2">
                  {cleaner.metadata.labels.environment}
                </Badge>
              )}
              创建于{" "}
              {cleaner.metadata.creationTimestamp
                ? format(new Date(cleaner.metadata.creationTimestamp), "yyyy-MM-dd HH:mm", {
                    locale: zhCN,
                  })
                : "未知"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button icon={RefreshCw} variant="ghost" onClick={() => refetch()}>
              刷新
            </Button>
            {cleaner.spec.action === "Scan" && (
              <Button icon={Play} variant="primary" onClick={handleTriggerScan}>
                触发 Scan
              </Button>
            )}
            <Button icon={Trash2} variant="danger" onClick={handleDelete}>
              删除
            </Button>
          </div>
        </div>
      </header>

      {/* 标签页 */}
      <div className="border-b border-slate-800">
        <nav className="flex gap-4">
          {[
            { id: "overview", label: "概览", icon: Settings },
            { id: "history", label: "执行历史", icon: History },
            { id: "config", label: "配置", icon: Code },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id as typeof activeTab);
                if (id === "history" && history.length === 0) {
                  loadHistory();
                }
              }}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === id
                  ? "border-brand-500 text-brand-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区域 */}
      <div>
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 基本信息 */}
            <div className="lg:col-span-2 space-y-4">
              <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  基本信息
                </h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Action" value={cleaner.spec.action} />
                  <InfoRow
                    label="Schedule (Cron)"
                    value={
                      <code className="rounded bg-slate-950/80 px-2 py-1 text-xs text-slate-200">
                        {cleaner.spec.schedule}
                      </code>
                    }
                  />
                  <InfoRow
                    label="StoreResourcePath"
                    value={cleaner.spec.storeResourcePath || "未配置"}
                  />
                  <InfoRow
                    label="Notifications"
                    value={
                      cleaner.spec.notifications && cleaner.spec.notifications.length > 0
                        ? cleaner.spec.notifications.map((n) => (
                            <Badge key={n.name} variant="info" className="mr-1">
                              {n.type}
                            </Badge>
                          ))
                        : "未配置"
                    }
                  />
                </dl>
              </section>

              {/* ResourcePolicySet */}
              <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  资源选择器
                </h2>
                <div className="space-y-3">
                  {cleaner.spec.resourcePolicySet.resourceSelectors.map((rs, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800 bg-slate-950/70 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="info">
                          {rs.group || "core"}/{rs.version} · {rs.kind}
                        </Badge>
                        {rs.namespace && (
                          <Badge variant="default">ns={rs.namespace}</Badge>
                        )}
                        {rs.excludeDeleted && (
                          <Badge variant="success">ExcludeDeleted</Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-slate-300">
                        {rs.namespaceSelector && (
                          <div>
                            <span className="text-slate-400 mr-2">NamespaceSelector:</span>
                            <code className="rounded bg-slate-900/80 px-2 py-1 text-xs">
                              {rs.namespaceSelector}
                            </code>
                          </div>
                        )}
                        {rs.labelFilters && rs.labelFilters.length > 0 && (
                          <div>
                            <span className="text-slate-400 mr-2">LabelFilters:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {rs.labelFilters.map((f, i) => (
                                <code
                                  key={i}
                                  className="rounded bg-slate-900/80 px-2 py-1 text-xs"
                                >
                                  {f.key} {f.operation} {f.value}
                                </code>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* 侧边栏 */}
            <aside className="space-y-4">
              {/* 执行状态 */}
              <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  执行状态
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-slate-400 mb-1">LastRunTime</div>
                    <div className="text-slate-200">
                      {cleaner.status.lastRunTime
                        ? format(new Date(cleaner.status.lastRunTime), "yyyy-MM-dd HH:mm:ss", {
                            locale: zhCN,
                          })
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">NextScheduleTime</div>
                    <div className="text-slate-200">
                      {cleaner.status.nextScheduleTime
                        ? format(
                            new Date(cleaner.status.nextScheduleTime),
                            "yyyy-MM-dd HH:mm:ss",
                            { locale: zhCN }
                          )
                        : "N/A"}
                    </div>
                  </div>
                  {cleaner.status.failureMessage && (
                    <div>
                      <div className="text-slate-400 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Failure
                      </div>
                      <div className="text-amber-300 text-xs bg-amber-500/10 rounded p-2">
                        {cleaner.status.failureMessage}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* 快速操作 */}
              <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="text-sm font-semibold text-slate-100 mb-3">快速操作</h2>
                <div className="space-y-2">
                  <Button
                    icon={Copy}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => copyToClipboard(JSON.stringify(cleaner, null, 2))}
                  >
                    {copied ? "已复制" : "复制配置"}
                  </Button>
                </div>
              </section>
            </aside>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            {loadingHistory ? (
              <Loading text="加载执行历史..." />
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无执行历史</p>
              </div>
            ) : (
              <>
                {/* 图表 */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                  <h2 className="text-lg font-semibold text-slate-100 mb-4">
                    执行趋势
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={history.slice(0, 10).reverse()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="executionTime"
                        stroke="#94a3b8"
                        tickFormatter={(value) =>
                          format(new Date(value), "MM-dd HH:mm")
                        }
                      />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                          color: "#e2e8f0",
                        }}
                        labelFormatter={(value) =>
                          format(new Date(value), "yyyy-MM-dd HH:mm:ss")
                        }
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="matchedResources"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="匹配资源"
                      />
                      <Line
                        type="monotone"
                        dataKey="processedResources"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="处理资源"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 历史记录表格 */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-900/80 border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-slate-400 font-medium">
                          执行时间
                        </th>
                        <th className="px-4 py-3 text-left text-slate-400 font-medium">
                          Action
                        </th>
                        <th className="px-4 py-3 text-left text-slate-400 font-medium">
                          匹配资源
                        </th>
                        <th className="px-4 py-3 text-left text-slate-400 font-medium">
                          处理资源
                        </th>
                        <th className="px-4 py-3 text-left text-slate-400 font-medium">
                          失败
                        </th>
                        <th className="px-4 py-3 text-left text-slate-400 font-medium">
                          耗时
                        </th>
                        <th className="px-4 py-3 text-left text-slate-400 font-medium">
                          状态
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {history.map((h, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/60">
                          <td className="px-4 py-3 text-slate-300">
                            {format(new Date(h.executionTime), "yyyy-MM-dd HH:mm:ss", {
                              locale: zhCN,
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="info">{h.action}</Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{h.matchedResources}</td>
                          <td className="px-4 py-3 text-slate-300">{h.processedResources}</td>
                          <td className="px-4 py-3 text-slate-300">
                            {h.failedResources > 0 ? (
                              <span className="text-red-400">{h.failedResources}</span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {(h.duration / 1000).toFixed(2)}s
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                h.status === "success"
                                  ? "success"
                                  : h.status === "failed"
                                  ? "danger"
                                  : "warning"
                              }
                            >
                              {h.status === "success"
                                ? "成功"
                                : h.status === "failed"
                                ? "失败"
                                : "部分失败"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "config" && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Code className="w-5 h-5" />
                完整配置
              </h2>
              <Button
                icon={Copy}
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(cleaner, null, 2))}
              >
                {copied ? "已复制" : "复制"}
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-slate-950/80 p-4 text-xs text-slate-300 border border-slate-800">
              <code>{JSON.stringify(cleaner, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1 uppercase tracking-wide">{label}</div>
      <div className="text-sm text-slate-200">{value}</div>
    </div>
  );
}
