# k8s-cleaner UI 快速启动指南

## 🚀 快速开始

### 1. 安装依赖

```bash
cd ui
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 4. 预览生产构建

```bash
npm run preview
```

## 📋 功能特性

- ✅ **实时仪表盘** - 集群清理状态总览
- ✅ **Cleaners 管理** - 完整的规则列表和管理
- ✅ **详情查看** - 详细的配置和执行历史
- ✅ **数据可视化** - 图表展示清理趋势
- ✅ **搜索过滤** - 强大的搜索和过滤功能
- ✅ **实时刷新** - 自动更新数据

## 🔧 配置

### 环境变量

创建 `.env` 文件（可选）：

```env
# API 基础 URL（默认: /api）
VITE_API_BASE_URL=http://localhost:8080/api
```

### API 代理

开发模式下，Vite 会自动代理 `/api` 请求到后端服务器。配置在 `vite.config.ts` 中。

## 📁 项目结构

```
ui/
├── src/
│   ├── components/      # 通用组件
│   ├── hooks/          # 自定义 Hooks
│   ├── lib/            # 工具库（API 服务）
│   ├── pages/          # 页面组件
│   └── styles.css      # 全局样式
├── index.html          # HTML 模板
├── package.json        # 依赖配置
├── vite.config.ts     # Vite 配置
└── tailwind.config.cjs # Tailwind 配置
```

## 🔌 API 集成

当前版本使用 Mock 数据。要接入真实后端：

1. 修改 `src/lib/api.ts` 中的 API 函数
2. 将 Mock 数据替换为真实的 HTTP 请求
3. 确保后端提供以下端点：
   - `GET /api/cleaners` - 获取所有 Cleaners
   - `GET /api/cleaners/:name` - 获取单个 Cleaner
   - `GET /api/stats` - 获取统计信息
   - `GET /api/cleaners/:name/history` - 获取执行历史
   - `POST /api/cleaners/:name/scan` - 触发 Scan
   - `DELETE /api/cleaners/:name` - 删除 Cleaner

## 🐛 故障排除

### 端口被占用

修改 `vite.config.ts` 中的端口号：

```typescript
server: {
  port: 5174, // 改为其他端口
}
```

### 样式不生效

确保 `tailwind.config.cjs` 中的 `content` 路径正确：

```javascript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
```

### API 请求失败

检查：
1. 后端服务是否运行
2. `VITE_API_BASE_URL` 环境变量是否正确
3. CORS 配置是否正确

## 📚 更多信息

查看 [README.md](./README.md) 获取完整文档。

