import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { Card } from "../../components/Card";
import { SearchBar } from "../../components/SearchBar";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingOverlay } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { format } from "date-fns";
import clsx from "clsx";

type ActionFilter = "All" | "Delete" | "Transform" | "Scan";
type StatusFilter = "All" | "Healthy" | "Degraded" | "Error";

export function CleanersPage() {
  const navigate = useNavigate();
  const { cleaners, loading, refreshCleaners, lastRefresh } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  useEffect(() => {
    refreshCleaners();
    
    // 每60秒自动刷新
    const interval = setInterval(() => {
      refreshCleaners();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredCleaners = useMemo(() => {
    return cleaners.filter((cleaner) => {
      const matchesSearch =
        cleaner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cleaner.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAction = actionFilter === "All" || cleaner.action === actionFilter;
      const matchesStatus = statusFilter === "All" || cleaner.status === statusFilter;
      
      return matchesSearch && matchesAction && matchesStatus;
    });
  }, [cleaners, searchQuery, actionFilter, statusFilter]);

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return format(date, "yyyy-MM-dd HH:mm");
  };

  const formatNextRun = (timestamp?: string) => {
    if (!timestamp) return "未计划";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 0) return "已过期";
    if (diffMins < 60) return `${diffMins} 分钟后`;
    if (diffHours < 24) return `${diffHours} 小时后`;
    return format(date, "MM-dd HH:mm");
  };

  if (loading.cleaners && cleaners.length === 0) {
    return <LoadingOverlay message="加载 Cleaner 列表..." />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-top">
          <h1>清理任务（Cleaner 实例）</h1>
          {lastRefresh.cleaners && (
            <div className="page-header-meta">
              最后更新: {format(new Date(lastRefresh.cleaners), "HH:mm:ss")}
            </div>
          )}
        </div>
        <p>
          以 CRD 维度展示所有 Cleaner 实例，支持搜索、过滤和详情查看。
        </p>
      </div>

      <Card>
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar
              placeholder="搜索 Cleaner 名称或描述..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="search-bar-large"
            />
            <div className="filter-group">
              <select
                className="filter-select"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
              >
                <option value="All">所有动作</option>
                <option value="Delete">Delete</option>
                <option value="Transform">Transform</option>
                <option value="Scan">Scan</option>
              </select>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="All">所有状态</option>
                <option value="Healthy">Healthy</option>
                <option value="Degraded">Degraded</option>
                <option value="Error">Error</option>
              </select>
            </div>
          </div>
          <div className="table-toolbar-right">
            <button
              className="button button-secondary"
              onClick={() => refreshCleaners()}
              disabled={loading.cleaners}
            >
              {loading.cleaners ? "刷新中..." : "🔄 刷新"}
            </button>
          </div>
        </div>

        {filteredCleaners.length === 0 ? (
          <EmptyState
            title={cleaners.length === 0 ? "暂无 Cleaner 实例" : "未找到匹配的 Cleaner"}
            description={
              cleaners.length === 0
                ? "当前集群中还没有配置任何 Cleaner 实例"
                : "尝试调整搜索条件或过滤器"
            }
          />
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>名称</th>
                  <th>调度表达式</th>
                  <th>动作</th>
                  <th>描述</th>
                  <th>最近运行</th>
                  <th>下次运行</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredCleaners.map((cleaner) => (
                  <tr
                    key={cleaner.name}
                    className="table-row-clickable"
                    onClick={() => navigate(`/cleaners/${cleaner.name}`)}
                  >
                    <td className="mono font-semibold">{cleaner.name}</td>
                    <td className="mono">{cleaner.schedule}</td>
                    <td>
                      <span className={clsx("pill", `pill-${cleaner.action.toLowerCase()}`)}>
                        {cleaner.action}
                      </span>
                    </td>
                    <td className="table-cell-desc">{cleaner.description}</td>
                    <td>{formatRelativeTime(cleaner.lastRun)}</td>
                    <td>{formatNextRun(cleaner.nextRun)}</td>
                    <td>
                      <StatusBadge status={cleaner.status} />
                    </td>
                    <td>
                      <button
                        className="button-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/cleaners/${cleaner.name}`);
                        }}
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredCleaners.length > 0 && (
          <div className="table-footer">
            显示 {filteredCleaners.length} / {cleaners.length} 个 Cleaner
          </div>
        )}
      </Card>
    </div>
  );
}
