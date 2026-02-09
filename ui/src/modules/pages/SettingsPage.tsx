export function SettingsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>设置</h1>
        <p>
          用于管理前端展示偏好和后端连接配置（例如 API
          网关地址、Prometheus 查询入口、认证方式等）。
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">后端 API 配置（占位）</div>
          <div className="card-desc">
            未来可以在这里配置一个统一的后端：
            <br />
            - 暴露 Cleaner / CleanerReport CR 查询接口
            <br />- 代理 Prometheus 查询接口
          </div>
          <form className="form">
            <label className="form-field">
              <span>API 网关地址</span>
              <input
                className="input"
                placeholder="例如：https://cleaner-api.example.com"
              />
            </label>
            <label className="form-field">
              <span>Prometheus 查询地址</span>
              <input
                className="input"
                placeholder="例如：https://prometheus.example.com"
              />
            </label>
            <button type="button" className="button button-primary" disabled>
              保存（示意，后续接入真实配置）
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-title">UI 偏好</div>
          <div className="form">
            <label className="form-field-inline">
              <input type="checkbox" defaultChecked />
              <span>默认展示集群级 Overview（推荐）</span>
            </label>
            <label className="form-field-inline">
              <input type="checkbox" />
              <span>启用深色模式（Dark Mode）</span>
            </label>
            <label className="form-field-inline">
              <input type="checkbox" defaultChecked />
              <span>展示高级指标（P95/P99 延迟等）</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}




