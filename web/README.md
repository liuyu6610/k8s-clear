## k8s-cleaner Dashboard (web)

一个面向 SRE 的轻量级前端控制台，用来可视化 k8s-cleaner 的运行状况、Cleaner 配置、报表和最近操作记录。

目前为静态示例数据，后续可以按你的需求接入：

- Kubernetes API（或中间 BFF 服务）读取 Cleaner / Report CR
- Prometheus 指标（例如 `k8s_cleaner_*` 系列）
- N9e 告警状态、业务域/集群视图

### 目录结构

- `web/package.json`：前端依赖与脚本（Vite + React + TypeScript）
- `web/vite.config.ts`：Vite 配置
- `web/index.html`：入口 HTML
- `web/src/main.tsx`：应用入口
- `web/src/App.tsx`：主界面（总览面板 + Cleaner 表格 + 时间线区域）
- `web/src/styles.css`：纯 CSS 风格，深色控制台风格 UI

### 开发方式（如需本地预览）

在有 Node.js 环境的机器上，你可以在 `web/` 目录执行：

```bash
cd web
npm install
npm run dev
```

然后访问 Vite 输出的本地地址（默认 `http://localhost:5173`）即可看到仪表盘界面。  
接入后端 / Prometheus / N9e 时，只需要在 React 组件中替换示例数据为真实接口即可。



