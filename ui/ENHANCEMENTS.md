# k8s-cleaner UI 炫酷增强说明

## 🎨 新增炫酷效果

### 1. 动态背景动画
- **粒子连线效果** (`AnimatedBackground.tsx`)
  - 50 个动态粒子在背景中移动
  - 粒子之间根据距离自动连线
  - 流畅的动画效果，低性能消耗

### 2. 玻璃态卡片组件
- **GlowCard** - 带发光效果的卡片
  - 4 种发光颜色：blue、green、purple、orange
  - 悬停时增强发光效果
  - 流畅的过渡动画

### 3. 动画效果库
- **Framer Motion** 集成
  - 页面进入动画（stagger children）
  - 卡片悬停动画（scale、translate）
  - 按钮点击反馈
  - 路由切换动画

### 4. 视觉增强

#### 统计卡片
- 图标旋转动画
- 数值渐入动画
- 趋势指示器脉冲效果
- 悬停时轻微上浮

#### 图表优化
- AreaChart 替代 LineChart（更美观）
- 渐变填充效果
- 自定义 Tooltip 样式（玻璃态）
- 更柔和的网格线

#### 导航栏
- Logo 悬停旋转和缩放
- 活动标签页高亮动画（layoutId）
- 侧边栏折叠/展开动画
- 导航项悬停效果

### 5. 交互反馈

#### 按钮
- 悬停时缩放和阴影增强
- 点击时缩放反馈
- 渐变背景
- 发光效果

#### 链接
- 悬停时颜色变化
- 轻微位移效果
- 箭头动画

### 6. 状态指示器

#### PulseDot
- 脉冲动画效果
- 4 种颜色变体
- 3 种尺寸

#### Badge
- 增强的视觉样式
- 平滑的颜色过渡

## 🎯 技术实现

### 动画库
- **Framer Motion** - 主要动画库
  - `motion` 组件用于动画
  - `AnimatePresence` 用于进入/退出动画
  - `useSpring` 和 `useTransform` 用于数值动画

### CSS 动画
- 自定义 keyframes
- CSS 变量控制
- 性能优化的 transform 动画

### 性能优化
- 使用 `transform` 和 `opacity` 进行动画（GPU 加速）
- 减少重绘和回流
- 合理的动画时长和缓动函数

## 📦 新增组件

1. **AnimatedBackground** - 动态粒子背景
2. **GlowCard** - 发光卡片容器
3. **NumberCounter** - 数字计数动画
4. **PulseDot** - 脉冲状态指示器

## 🎨 样式增强

### 渐变效果
- 文本渐变（`.text-gradient`）
- 背景渐变
- 按钮渐变

### 发光效果
- `.glow-blue`、`.glow-green`、`.glow-purple`
- 多层阴影实现
- 悬停时增强

### 玻璃态效果
- `.glass` - 基础玻璃态
- `.glass-strong` - 强化玻璃态
- backdrop-filter 实现

### 动画类
- `.animate-in` - 渐入动画
- `.animate-slide-in` - 滑入动画
- `.animate-scale-in` - 缩放进入
- `.animate-float` - 浮动效果
- `.animate-glow` - 发光脉冲
- `.shimmer` - 闪光效果

## 🚀 使用示例

### GlowCard
```tsx
<GlowCard glowColor="blue" className="p-6">
  <YourContent />
</GlowCard>
```

### PulseDot
```tsx
<PulseDot color="green" size="md" />
```

### Motion 动画
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

## 🎭 视觉效果预览

- ✨ 流畅的页面过渡
- 🌟 卡片悬停发光效果
- 💫 粒子连线背景
- 🎯 精确的交互动画
- 🌈 丰富的渐变色彩
- 🔮 玻璃态 UI 元素
- ⚡ 实时状态指示器

## 📱 响应式设计

所有动画效果都经过响应式优化：
- 移动端减少动画复杂度
- 保持流畅的用户体验
- 适配不同屏幕尺寸

## 🔧 自定义配置

可以通过修改 CSS 变量和 Tailwind 配置来自定义：
- 动画时长
- 颜色主题
- 发光强度
- 粒子数量

## 🎉 效果展示

运行 `npm run dev` 查看所有炫酷效果！

