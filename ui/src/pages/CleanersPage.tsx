import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Trash2,
  Play,
  MoreVertical,
} from "lucide-react";
import { SearchInput } from "../components/SearchInput";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { useCleaners } from "../hooks/useCleaners";
import toast from "react-hot-toast";
import { api } from "../lib/api";

type ActionFilter = "all" | "Delete" | "Scan" | "Transform";
type StatusFilter = "all" | "success" | "failed" | "pending";

export function CleanersPage() {
  const { cleaners, loading, refetch } = useCleaners();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<"name" | "lastRun" | "action">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 过滤和排序
  const filteredCleaners = useMemo(() => {
    let result = cleaners.filter((cleaner) => {
      // 搜索过滤
      const matchesSearch =
        searchQuery === "" ||
        cleaner.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cleaner.spec.schedule.toLowerCase().includes(searchQuery.toLowerCase());

      // Action 过滤
      const matchesAction =
        actionFilter === "all" || cleaner.spec.action === actionFilter;

      // Status 过滤
      const matchesStatus = (() => {
        if (statusFilter === "all") return true;
        if (!cleaner.status.lastRunTime) return statusFilter === "pending";
        if (cleaner.status.failureMessage) return statusFilter === "failed";
        return statusFilter === "success";
      })();

      return matchesSearch && matchesAction && matchesStatus;
    });

    // 排序
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.metadata.name.localeCompare(b.metadata.name);
          break;
        case "action":
          comparison = a.spec.action.localeCompare(b.spec.action);
          break;
        case "lastRun":
          const aTime = a.status.lastRunTime
            ? new Date(a.status.lastRunTime).getTime()
            : 0;
          const bTime = b.status.lastRunTime
            ? new Date(b.status.lastRunTime).getTime()
            : 0;
          comparison = aTime - bTime;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [cleaners, searchQuery, actionFilter, statusFilter, sortBy, sortOrder]);

  const handleTriggerScan = async (name: string) => {
    try {
      await api.triggerScan(name);
      toast.success(`已触发 ${name} 的 Scan 操作`);
      refetch();
    } catch (error) {
      toast.error(`触发 Scan 失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`确定要删除 Cleaner "${name}" 吗？`)) return;
    try {
      await api.deleteCleaner(name);
      toast.success(`已删除 ${name}`);
      refetch();
    } catch (error) {
      toast.error(`删除失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  };

  const getStatusBadge = (cleaner: typeof cleaners[0]) => {
    if (!cleaner.status.lastRunTime) {
      return <Badge variant="default">待执行</Badge>;
    }
    if (cleaner.status.failureMessage) {
      return <Badge variant="danger">失败</Badge>;
    }
    return <Badge variant="success">正常</Badge>;
  };

  const getActionBadge = (action: string) => {
    const variants = {
      Delete: "danger" as const,
      Scan: "info" as const,
      Transform: "warning" as const,
    };
    return <Badge variant={variants[action as keyof typeof variants] || "default"}>{action}</Badge>;
  };

  if (loading) {
    return <Loading text="加载 Cleaners 列表..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Cleaners 规则列表
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            管理和监控所有集群清理规则，查看执行状态和历史记录
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            icon={RefreshCw}
            variant="ghost"
            onClick={() => refetch()}
          >
            刷新
          </Button>
          <Button icon={Plus} variant="primary">
            新建 Cleaner
          </Button>
        </div>
      </header>

      {/* 搜索和过滤栏 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="搜索 Cleaner 名称或 Schedule..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
            className="px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">所有 Action</option>
            <option value="Delete">Delete</option>
            <option value="Scan">Scan</option>
            <option value="Transform">Transform</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">所有状态</option>
            <option value="success">成功</option>
            <option value="failed">失败</option>
            <option value="pending">待执行</option>
          </select>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <span>共 {filteredCleaners.length} 个 Cleaner</span>
        <span>•</span>
        <span>
          活跃: {cleaners.filter((c) => c.status.lastRunTime && !c.status.failureMessage).length}
        </span>
        <span>•</span>
        <span>
          失败: {cleaners.filter((c) => c.status.failureMessage).length}
        </span>
      </div>

      {/* Cleaners 表格 */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => {
                      if (sortBy === "name") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortBy("name");
                        setSortOrder("asc");
                      }
                    }}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium"
                  >
                    Name
                    {sortBy === "name" && (
                      <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => {
                      if (sortBy === "action") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortBy("action");
                        setSortOrder("asc");
                      }
                    }}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium"
                  >
                    Action
                    {sortBy === "action" && (
                      <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">
                  Schedule
                </th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">
                  Targets
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => {
                      if (sortBy === "lastRun") {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortBy("lastRun");
                        setSortOrder("desc");
                      }
                    }}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium"
                  >
                    上次执行
                    {sortBy === "lastRun" && (
                      <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">
                  状态
                </th>
                <th className="px-4 py-3 text-right text-slate-400 font-medium">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCleaners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    没有找到匹配的 Cleaner
                  </td>
                </tr>
              ) : (
                filteredCleaners.map((cleaner) => {
                  const lastRun = cleaner.status.lastRunTime
                    ? formatDistanceToNow(new Date(cleaner.status.lastRunTime), {
                        addSuffix: true,
                        locale: zhCN,
                      })
                    : "从未执行";

                  const targets = cleaner.spec.resourcePolicySet.resourceSelectors
                    .map((rs) => `${rs.group || "core"}/${rs.version}/${rs.kind}`)
                    .join(", ");

                  return (
                    <tr
                      key={cleaner.metadata.name}
                      className="hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/cleaners/${cleaner.metadata.name}`}
                          className="text-slate-100 hover:text-brand-300 font-medium transition-colors"
                        >
                          {cleaner.metadata.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {getActionBadge(cleaner.spec.action)}
                      </td>
                      <td className="px-4 py-3">
                        <code className="rounded bg-slate-900/80 px-2 py-1 text-xs text-slate-200">
                          {cleaner.spec.schedule}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-slate-300 max-w-xs truncate">
                        {targets}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {lastRun}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(cleaner)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {cleaner.spec.action === "Scan" && (
                            <Button
                              icon={Play}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTriggerScan(cleaner.metadata.name)}
                            >
                              触发
                            </Button>
                          )}
                          <Button
                            icon={Trash2}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cleaner.metadata.name)}
                          >
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
