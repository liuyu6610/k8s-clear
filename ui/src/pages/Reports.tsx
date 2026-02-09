type ReportMock = {
  cleaner: string;
  ts: string;
  deleted: number;
  updated: number;
  errors: number;
};

const mockReports: ReportMock[] = [
  {
    cleaner: "cleanup-orphaned-configmaps",
    ts: "2026-02-09 10:03",
    deleted: 42,
    updated: 0,
    errors: 0,
  },
  {
    cleaner: "scan-unused-pvcs",
    ts: "2026-02-09 06:01",
    deleted: 0,
    updated: 0,
    errors: 3,
  },
  {
    cleaner: "transform-expired-cert-pods",
    ts: "2026-02-09 10:15",
    deleted: 0,
    updated: 7,
    errors: 1,
  },
];

export const Reports = () => {
  return (
    <div className="card card-wide">
      <h2 className="card-title">清理报告（Mock 数据）</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Cleaner</th>
            <th>执行时间</th>
            <th>Deleted</th>
            <th>Updated</th>
            <th>Errors</th>
          </tr>
        </thead>
        <tbody>
          {mockReports.map((r, idx) => (
            <tr key={`${r.cleaner}-${idx}`}>
              <td>{r.cleaner}</td>
              <td>{r.ts}</td>
              <td>{r.deleted}</td>
              <td>{r.updated}</td>
              <td className={r.errors > 0 ? "danger" : ""}>{r.errors}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted">
        对齐 Report CR（apps.projectsveltos.io/v1alpha1 Report）后，可以在这里支持：
        点击一行展开本次清理/变更的资源明细，甚至直接生成 N9e 告警链接和 Grafana 跳转。
      </p>
    </div>
  );
};


