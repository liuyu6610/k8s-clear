import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { Card } from "../../components/Card";
import { SearchBar } from "../../components/SearchBar";
import { LoadingOverlay } from "../../components/LoadingSpinner";
import { EmptyState } from "../../components/EmptyState";
import { Modal } from "../../components/Modal";
import { format } from "date-fns";
import { Report } from "../../services/api";

export function ReportsPage() {
  const navigate = useNavigate();
  const { reports, loading, refreshReports, lastRefresh } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    refreshReports();
    
    // 每60秒自动刷新
    const interval = setInterval(() => {
      refreshReports();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) =>
      report.cleanerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.action.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reports, searchQuery]);

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  if (loading.reports && reports.length === 0) {
    return <LoadingOverlay message="加载报告列表..." />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-top">
          <h1>清理报告 & 审计视图</h1>
          {lastRefresh.reports && (
            <div className="page-header-meta">
              最后更新: {format(new Date(lastRefresh.reports), "HH:mm:ss")}
            </div>
          )}
        </div>
        <p>
          汇总 CleanerReport CR、通知通道结果以及本地存储的资源快照，方便做合规审计和变更追踪。
        </p>
      </div>

      <Card>
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar
              placeholder="搜索报告..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="search-bar-large"
            />
          </div>
          <div className="table-toolbar-right">
            <button
              className="button button-secondary"
              onClick={() => refreshReports()}
              disabled={loading.reports}
            >
              {loading.reports ? "刷新中..." : "🔄 刷新"}
            </button>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <EmptyState
            title={reports.length === 0 ? "暂无报告" : "未找到匹配的报告"}
            description={
              reports.length === 0
                ? "当前还没有生成任何清理报告"
                : "尝试调整搜索条件"
            }
          />
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Cleaner 实例</th>
                    <th>动作</th>
                    <th>影响资源数</th>
                    <th>生成时间</th>
                    <th>存储路径</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id}>
                      <td className="mono font-semibold">{report.cleanerName}</td>
                      <td>
                        <span className={`pill pill-${report.action.toLowerCase()}`}>
                          {report.action}
                        </span>
                      </td>
                      <td className="font-semibold">{report.affectedResources}</td>
                      <td>{format(new Date(report.generatedAt), "yyyy-MM-dd HH:mm:ss")}</td>
                      <td className="mono">
                        {report.storePath ? (
                          <span className="text-link">{report.storePath}</span>
                        ) : (
                          <span className="muted">无（仅逻辑报告）</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="button-link"
                          onClick={() => handleViewDetails(report)}
                        >
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredReports.length > 0 && (
              <div className="table-footer">
                显示 {filteredReports.length} / {reports.length} 个报告
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`报告详情 - ${selectedReport?.cleanerName}`}
        size="lg"
      >
        {selectedReport && (
          <div className="modal-content">
            <div className="detail-list">
              <div className="detail-item">
                <span className="detail-label">Cleaner 实例</span>
                <span className="detail-value mono">{selectedReport.cleanerName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">动作</span>
                <span>
                  <span className={`pill pill-${selectedReport.action.toLowerCase()}`}>
                    {selectedReport.action}
                  </span>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">影响资源数</span>
                <span className="detail-value font-semibold">{selectedReport.affectedResources}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">生成时间</span>
                <span className="detail-value">
                  {format(new Date(selectedReport.generatedAt), "yyyy-MM-dd HH:mm:ss")}
                </span>
              </div>
              {selectedReport.storePath && (
                <div className="detail-item">
                  <span className="detail-label">存储路径</span>
                  <span className="detail-value mono">{selectedReport.storePath}</span>
                </div>
              )}
            </div>

            {selectedReport.resources && selectedReport.resources.length > 0 && (
              <div className="modal-section">
                <h3 className="modal-section-title">影响的资源列表</h3>
                <div className="table-wrapper">
                  <table className="table table-compact">
                    <thead>
                      <tr>
                        <th>命名空间</th>
                        <th>名称</th>
                        <th>类型</th>
                        <th>API 版本</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.resources.map((resource, idx) => (
                        <tr key={idx}>
                          <td className="mono">{resource.namespace || "-"}</td>
                          <td className="mono">{resource.name}</td>
                          <td>{resource.kind}</td>
                          <td className="mono">{resource.apiVersion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
