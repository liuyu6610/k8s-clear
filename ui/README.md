# k8s-cleaner 超级前端控制台

## 🚀 功能特性

### ✨ 核心功能
- **实时仪表盘**：可视化展示集群卫生状况，包含运行耗时分布、资源清理趋势等图表
- **Cleaner 管理**：完整的列表、搜索、过滤、详情查看功能
- **报告审计**：清理报告查看、资源详情、合规审计视图
- **实时刷新**：自动刷新数据，保持信息最新

### 🎨 UI/UX 亮点
- **现代化设计**：深色主题 + 渐变效果 + 玻璃态风格
- **流畅动画**：页面切换、卡片悬停、加载状态等动画效果
- **响应式布局**：完美适配桌面、平板、移动设备
- **交互优化**：搜索、过滤、模态框、详情页等完整交互

## 📦 技术栈

- **React 18** + **TypeScript** - 现代化前端框架
- **Vite** - 极速构建工具
- **React Router** - 路由管理
- **Recharts** - 数据可视化图表库
- **Zustand** - 轻量级状态管理
- **date-fns** - 日期处理工具
- **clsx** - 条件类名工具

## 🛠️ 快速开始

### 安装依赖

```bash
cd ui
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:5173` 查看前端界面。

### 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
ui/
├── src/
│   ├── components/          # 可复用UI组件
│   │   ├── Card.tsx         # 卡片组件
│   │   ├── LoadingSpinner.tsx  # 加载动画
│   │   ├── SearchBar.tsx     # 搜索栏
│   │   ├── StatusBadge.tsx  # 状态徽章
│   │   ├── Modal.tsx        # 模态框
│   │   └── EmptyState.tsx   # 空状态
│   ├── modules/
│   │   ├── App.tsx          # 路由配置
│   │   ├── layout/
│   │   │   └── Layout.tsx   # 主布局
│   │   └── pages/
│   │       ├── DashboardPage.tsx      # 仪表盘
│   │       ├── CleanersPage.tsx       # Cleaner列表
│   │       ├── CleanerDetailPage.tsx  # Cleaner详情
│   │       ├── ReportsPage.tsx        # 报告列表
│   │       └── SettingsPage.tsx       # 设置页
│   ├── services/
│   │   └── api.ts           # API服务层（当前Mock数据）
│   ├── store/
│   │   └── useAppStore.ts   # 全局状态管理
│   ├── main.tsx             # 入口文件
│   └── styles.css           # 全局样式
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔌 对接真实后端

当前前端使用 Mock 数据，要对接真实后端，需要修改 `src/services/api.ts`：

1. **替换 API 函数**：将 Mock 数据替换为真实 HTTP 请求
2. **配置 API 地址**：在设置页或环境变量中配置后端地址
3. **添加认证**：根据后端要求添加 Token、Cookie 等认证方式

示例：

```typescript
// src/services/api.ts
export const api = {
  async getCleaners(): Promise<Cleaner[]> {
    const response = await fetch('/api/v1/cleaners', {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    return response.json();
  },
  // ... 其他API函数
};
```

## 🎯 页面说明

### 仪表盘 (`/dashboard`)
- 4个核心KPI卡片：集群数、Cleaner数、运行次数、失败率
- 3个资源统计卡片：已删除、已更新、已扫描
- 2个实时图表：运行耗时分布（P50/P95/P99）、资源清理趋势

### Cleaner列表 (`/cleaners`)
- 搜索功能：按名称或描述搜索
- 过滤器：按动作类型（Delete/Transform/Scan）和状态（Healthy/Degraded/Error）过滤
- 表格展示：名称、调度、动作、描述、运行时间、状态等
- 详情查看：点击行或"查看详情"按钮跳转到详情页

### Cleaner详情 (`/cleaners/:name`)
- 基本信息：名称、调度、动作、状态、描述、创建时间
- 运行信息：最近运行、下次运行、资源选择器、通知渠道
- 操作历史：预留接口，后续对接

### 报告列表 (`/reports`)
- 搜索功能：按Cleaner名称或动作搜索
- 表格展示：Cleaner实例、动作、影响资源数、生成时间、存储路径
- 详情查看：点击"查看详情"打开模态框，查看资源列表

### 设置页 (`/settings`)
- API配置：后端地址、Prometheus地址（预留）
- UI偏好：展示选项、主题设置（预留）

## 🎨 样式定制

所有样式在 `src/styles.css` 中定义，主要使用CSS变量和渐变效果。可以修改以下内容：

- **主题色**：搜索 `#38bdf8`、`#22c55e` 等颜色值
- **背景渐变**：修改 `background: radial-gradient(...)` 
- **动画时长**：调整 `transition` 和 `animation` 的时间值

## 📝 开发建议

1. **组件复用**：优先使用已有组件（Card、Modal、SearchBar等）
2. **状态管理**：使用 `useAppStore` 管理全局状态
3. **API调用**：统一通过 `api` 服务层调用，便于后续替换
4. **类型安全**：充分利用 TypeScript 类型定义
5. **响应式**：注意移动端适配，使用响应式类名

## 🐛 已知问题

- 当前使用 Mock 数据，需要对接真实后端
- 设置页功能为占位，待实现
- Cleaner详情页的操作历史功能待开发

## 📄 License

与主项目保持一致（Apache 2.0）

