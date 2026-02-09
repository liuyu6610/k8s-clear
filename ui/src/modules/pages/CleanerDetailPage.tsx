import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { Card, CardHeader } from "../../components/Card";
import { StatusBadge } from "../../components/StatusBadge";
import { LoadingOverlay } from "../../components/LoadingSpinner";
import { api, Cleaner } from "../../services/api";
import { format } from "date-fns";
import clsx from "clsx";

export function CleanerDetailPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [cleaner, setCleaner] = useState<Cleaner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) {
      navigate("/cleaners");
      return;
    }

    loadCleaner();
  }, [name]);

  const loadCleaner = async () => {
    if (!name) return;
    setLoading(true);
    try {
      const data = await api.getCleaner(name);
      if (data) {
        setCleaner(data);
      } else {
        navigate("/cleaners");
      }
    } catch (err) {
      console.error("Failed to load cleaner:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !cleaner) {
    return <LoadingOverlay message="加载 Cleaner 详情..." />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-top">
          <button className="button-link" onClick={() => navigate("/cleaners")}>
            ← 返回列表
          </button>
          <h1>{cleaner.name}</h1>
        </div>
        <p>查看 Cleaner 实例的详细配置和运行状态</p>
      </div>

      <div className="grid-2">
        <Card>
          <CardHeader title="基本信息" />
          <div className="detail-list">
            <div className="detail-item">
              <span className="detail-label">名称</span>
              <span className="detail-value mono">{cleaner.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">调度表达式</span>
              <span className="detail-value mono">{cleaner.schedule}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">动作类型</span>
              <span>
                <span className={clsx("pill", `pill-${cleaner.action.toLowerCase()}`)}>
                  {cleaner.action}
                </span>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">状态</span>
              <StatusBadge status={cleaner.status} />
            </div>
            <div className="detail-item">
              <span className="detail-label">描述</span>
              <span className="detail-value">{cleaner.description}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">创建时间</span>
              <span className="detail-value">
                {format(new Date(cleaner.createdAt), "yyyy-MM-dd HH:mm:ss")}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="运行信息" />
          <div className="detail-list">
            <div className="detail-item">
              <span className="detail-label">最近运行</span>
              <span className="detail-value">
                {format(new Date(cleaner.lastRun), "yyyy-MM-dd HH:mm:ss")}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">下次运行</span>
              <span className="detail-value">
                {cleaner.nextRun
                  ? format(new Date(cleaner.nextRun), "yyyy-MM-dd HH:mm:ss")
                  : "未计划"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">资源选择器数量</span>
              <span className="detail-value">{cleaner.resourceSelectors}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">通知渠道</span>
              <div className="detail-value">
                {cleaner.notifications.length > 0 ? (
                  <div className="tag-group">
                    {cleaner.notifications.map((notif) => (
                      <span key={notif} className="tag">
                        {notif}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="muted">无</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-lg">
        <CardHeader title="操作历史" />
        <div className="card-desc">最近的操作记录和运行结果</div>
        <div className="empty-state-small">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-description">
            操作历史功能开发中，后续将对接 CleanerReport CR 和 Prometheus 指标
          </div>
        </div>
      </Card>
    </div>
  );
}

