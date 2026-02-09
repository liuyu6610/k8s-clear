# k8s-cleaner UI 更新日志

## [0.1.0] - 2026-02-09

### ✨ 新增功能

#### 核心功能
- **仪表盘页面** - 完整的集群清理状态总览
  - 统计卡片（活跃 Cleaners、24h 删除资源、成功率、失败操作）
  - 每日清理趋势图表（LineChart）
  - Action 类型分布图表（BarChart）
  - 最近执行任务列表
  - 实时刷新功能

- **Cleaners 列表页** - 完整的规则管理界面
  - 搜索功能（按名称和 Schedule）
  - 多维度过滤（Action 类型、状态）
  - 排序功能（按名称、Action、执行时间）
  - 操作按钮（触发 Scan、删除）
  - 状态标识和统计信息

- **Cleaner 详情页** - 详细的配置和执行历史
  - 标签页设计（概览、执行历史、配置）
  - 执行历史图表展示
  - 完整配置 JSON 查看
  - 快速操作（复制配置、触发 Scan、删除）

#### 组件库
- `StatCard` - 统计卡片组件（支持多种变体）
- `Badge` - 徽章组件（success/warning/danger/info/default）
- `Button` - 按钮组件（多种样式和尺寸，支持 loading 状态）
- `SearchInput` - 搜索输入框（带清除按钮）
- `Loading` - 加载状态组件（支持全屏模式）
- `ErrorBoundary` - 错误边界组件

#### Hooks
- `useCleaners` - Cleaners 列表数据获取和自动刷新
- `useCleaner` - 单个 Cleaner 数据获取
- `useStats` - 统计信息获取和自动刷新

#### API 服务层
- 统一的 API 调用管理（`src/lib/api.ts`）
- Mock 数据支持（便于开发和测试）
- 类型安全的 API 接口定义
- 错误处理和拦截器

### 🎨 UI/UX 优化

- **现代化设计**
  - 暗色主题配色方案
  - 流畅的动画效果（fade-in、slide-in）
  - 响应式设计（移动端适配）
  - 玻璃态效果和阴影

- **交互体验**
  - Toast 通知（操作反馈）
  - 加载状态提示
  - 错误处理和提示
  - 自动刷新数据
  - 复制到剪贴板功能

- **图标系统**
  - 使用 Lucide React 图标库
  - 统一的图标风格

### 📊 数据可视化

- **图表库集成**
  - Recharts 图表库
  - LineChart（趋势图）
  - BarChart（分布图）
  - 响应式图表设计

- **数据展示**
  - 每日清理趋势
  - Action 类型分布
  - 执行历史趋势

### 🔧 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 6
- **样式框架**: TailwindCSS 3.4
- **路由**: React Router 6
- **图表**: Recharts 2.12
- **图标**: Lucide React 0.344
- **通知**: React Hot Toast 2.4
- **HTTP**: Axios 1.7
- **日期**: date-fns 3.3

### 📝 文档

- `README.md` - 完整项目文档
- `QUICKSTART.md` - 快速启动指南
- `CHANGELOG.md` - 更新日志

### 🐛 修复

- 修复了组件导入路径问题
- 优化了类型定义
- 改进了错误处理

### 🔄 改进

- 优化了代码结构和组织
- 改进了性能（使用 useMemo 优化过滤和排序）
- 增强了类型安全
- 统一了代码风格

### 📦 配置

- 添加了 TailwindCSS 配置
- 配置了 Vite 代理（API 请求）
- 添加了 ESLint 配置
- 创建了 .gitignore 文件

### 🚀 部署

- 支持生产构建（`npm run build`）
- 支持预览模式（`npm run preview`）
- 优化了构建产物大小

---

## 下一步计划

- [ ] 接入真实后端 API
- [ ] 添加单元测试
- [ ] 添加 E2E 测试
- [ ] 国际化支持（i18n）
- [ ] 主题切换功能
- [ ] 更多图表类型
- [ ] 导出功能（PDF/CSV）

