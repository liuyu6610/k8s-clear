const mockSeries = [
  { label: "删除数量", color: "#4ade80", points: [10, 35, 22, 48, 30, 60] },
  { label: "错误数量", color: "#f97373", points: [0, 3, 1, 4, 2, 1] },
];

export const Metrics = () => {
  return (
    <div className="card card-wide">
      <h2 className="card-title">k8s-cleaner 指标（示意）</h2>
      <p className="muted">
        这里以简单折线图示意 k8s_cleaner_* 指标的趋势。接入 Prometheus 后，可以换成真实数据：
        k8s_cleaner_deleted_resources_total、k8s_cleaner_error_resources_total 等，并按
        collect_mode / collect_source / resource_type 聚合。
      </p>
      <div className="chart">
        {mockSeries.map((s) => (
          <div key={s.label} className="chart-row">
            <div className="chart-label">
              <span
                className="chart-dot"
                style={{ backgroundColor: s.color }}
              />
              <span>{s.label}</span>
            </div>
            <div className="chart-bars">
              {s.points.map((p, idx) => (
                <div
                  key={idx}
                  className="chart-bar"
                  style={{ height: `${10 + p}px`, backgroundColor: s.color }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="muted">
        后续可以在这里透出：
        <br />
        - 最近 N 次 Cleaner 执行耗时直方图；
        <br />
        - 各类资源（ConfigMap/Secret/PVC 等）的清理量前 N 名；
        <br />
        - 不同集群/命名空间的 Hygiene Score。
      </p>
    </div>
  );
};


