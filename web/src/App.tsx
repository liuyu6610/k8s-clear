import type React from "react";

const App: React.FC = () => {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-dot" />
          <span className="logo-text">k8s-cleaner</span>
        </div>
        <nav className="app-nav">
          <button className="nav-item nav-item-active">Overview</button>
          <button className="nav-item">Cleaners</button>
          <button className="nav-item">Reports</button>
          <button className="nav-item">Notifications</button>
          <button className="nav-item">Settings</button>
        </nav>
      </header>

      <main className="app-main">
        <section className="section">
          <div className="section-header">
            <h1>Cluster Hygiene Overview</h1>
            <p>
              High-level view of unused / unhealthy resources detected by
              k8s-cleaner. 后面可以在这里接入真实 Prometheus / k8s API。
            </p>
          </div>

          <div className="grid-3">
            <div className="card metric-card accent-blue">
              <div className="metric-label">Unused Resources</div>
              <div className="metric-value">128</div>
              <div className="metric-sub">Last scan: 5 minutes ago</div>
            </div>
            <div className="card metric-card accent-green">
              <div className="metric-label">Unhealthy Objects</div>
              <div className="metric-value">9</div>
              <div className="metric-sub">Pods / Deployments / Jobs</div>
            </div>
            <div className="card metric-card accent-purple">
              <div className="metric-label">Automation Coverage</div>
              <div className="metric-value">82%</div>
              <div className="metric-sub">namespaces protected by Cleaner</div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Cleaner Schedules</h2>
            <p>最近的 Cleaner 任务及其 cron 调度情况。</p>
          </div>

          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Target</th>
                  <th>Schedule</th>
                  <th>Mode</th>
                  <th>DryRun</th>
                  <th>Last Run</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>unused-configmaps</td>
                  <td>ns=prod-* / ConfigMap</td>
                  <td>0 */2 * * *</td>
                  <td>delete</td>
                  <td>off</td>
                  <td>2026-02-09 10:21</td>
                  <td>
                    <span className="badge badge-success">OK</span>
                  </td>
                </tr>
                <tr>
                  <td>orphaned-secrets</td>
                  <td>ns=all / Secret</td>
                  <td>15 * * * *</td>
                  <td>report</td>
                  <td>on</td>
                  <td>2026-02-09 10:05</td>
                  <td>
                    <span className="badge badge-warning">DryRun</span>
                  </td>
                </tr>
                <tr>
                  <td>stale-pvcs</td>
                  <td>ns=prod / PVC</td>
                  <td>0 3 * * *</td>
                  <td>delete</td>
                  <td>off</td>
                  <td>2026-02-09 03:01</td>
                  <td>
                    <span className="badge badge-danger">Attention</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section two-column">
          <div className="card">
            <div className="section-header small">
              <h3>Recent Actions</h3>
              <p>最近自动清理 / 变更记录（示例数据）。</p>
            </div>
            <ul className="timeline">
              <li>
                <span className="timeline-dot success" />
                <div className="timeline-content">
                  <div className="timeline-title">
                    Deleted 23 unused ConfigMaps
                  </div>
                  <div className="timeline-sub">
                    ns=prod-order, prod-payment · cleaner=unused-configmaps
                  </div>
                  <div className="timeline-meta">2 minutes ago</div>
                </div>
              </li>
              <li>
                <span className="timeline-dot warning" />
                <div className="timeline-content">
                  <div className="timeline-title">
                    Report: 4 pods with outdated secrets
                  </div>
                  <div className="timeline-sub">
                    ns=prod-auth · cleaner=pods-with-outdated-secrets
                  </div>
                  <div className="timeline-meta">18 minutes ago</div>
                </div>
              </li>
              <li>
                <span className="timeline-dot danger" />
                <div className="timeline-content">
                  <div className="timeline-title">
                    Skipped deletion: PVC bound to active workload
                  </div>
                  <div className="timeline-sub">
                    ns=prod-reporting · pvc=data-reporting-01
                  </div>
                  <div className="timeline-meta">43 minutes ago</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="card">
            <div className="section-header small">
              <h3>Next Steps</h3>
              <p>可以按你的规范进一步接入：Prometheus、N9e、Sveltos 多集群等。</p>
            </div>
            <ol className="next-steps">
              <li>
                接入 Prometheus API，展示真实的{" "}
                <code>k8s_cleaner_*</code> 指标（当前后端已经暴露）。
              </li>
              <li>
                接入 Kubernetes API（或中间 BFF 服务），实时列出 Cleaner CR
                与 Report CR。
              </li>
              <li>
                做成多集群视图（通过 Sveltos 或你现有的多集群配置中心）。
              </li>
              <li>对接 N9e 告警状态，在页面上高亮 P0/P1 事件。</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;



