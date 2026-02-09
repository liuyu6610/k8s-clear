# k8s-cleaner 超级升级总结

## 📋 升级概览

本次升级为 k8s-cleaner 添加了企业级功能，包括增强的 Prometheus 指标、安全保护机制、执行时间追踪等。

## ✨ 新增功能

### 1. 增强的 Prometheus 指标

#### 新增指标类型

- **执行耗时直方图** (`k8s_cleaner_execution_duration_seconds`)
  - 记录每个 Cleaner 的执行耗时
  - 标签：`cleaner_instance`, `action`, `result`, `collect_mode`, `collect_source`
  - 桶范围：0.1s 到 ~102.4s（指数分布）

- **Lua 脚本执行耗时** (`k8s_cleaner_lua_execution_duration_seconds`)
  - 记录 Lua 脚本（evaluate/transform）的执行时间
  - 标签：`cleaner_instance`, `script_type`, `collect_mode`, `collect_source`
  - 桶范围：1ms 到 ~4s（指数分布）

- **队列长度指标** (`k8s_cleaner_queue_length`)
  - 实时监控待处理的 Cleaner 数量
  - 标签：`collect_mode`, `collect_source`

- **处理中数量指标** (`k8s_cleaner_in_progress_total`)
  - 实时监控正在处理的 Cleaner 数量
  - 标签：`collect_mode`, `collect_source`

- **匹配资源计数** (`k8s_cleaner_matched_resources_total`)
  - 统计被选择器匹配到的资源数量
  - 标签：`cleaner_instance`, `resource_apiversion`, `resource_type`, `collect_mode`, `collect_source`

- **受保护资源计数** (`k8s_cleaner_protected_resources_total`)
  - 统计因保护机制而跳过的资源数量
  - 标签：`cleaner_instance`, `resource_apiversion`, `resource_type`, `protection_reason`, `collect_mode`, `collect_source`

- **增强的错误指标**
  - 错误指标现在包含 `error_type` 标签，用于区分不同类型的错误

#### 指标命名规范

所有指标遵循 Prometheus 命名规范：
- 使用 `k8s_cleaner` 作为命名空间前缀
- 使用下划线分隔单词
- 计数器使用 `_total` 后缀
- 直方图使用 `_seconds` 后缀

### 2. 安全保护机制

#### 资源保护

新增 `internal/controller/executor/safety.go` 模块，提供多层保护：

1. **注解保护**
   - 资源可以通过添加 `cleaner.projectsveltos.io/protect=true` 注解来防止被删除/更新
   - 示例：
     ```yaml
     metadata:
       annotations:
         cleaner.projectsveltos.io/protect: "true"
     ```

2. **命名空间保护**
   - 默认保护：`kube-system`, `kube-public`, `kube-node-lease`
   - 可通过环境变量 `K8S_CLEANER_PROTECTED_NAMESPACES` 自定义
   - 格式：逗号分隔的命名空间列表

3. **资源类型保护**
   - 可通过环境变量 `K8S_CLEANER_PROTECTED_KINDS` 保护特定资源类型
   - 格式：逗号分隔的资源类型列表
   - 示例：`Secret,ConfigMap,PersistentVolume`

4. **严格模式**
   - 通过环境变量 `K8S_CLEANER_STRICT_MODE=true` 启用
   - 严格模式下只允许 `Scan` 操作，禁止 `Delete` 和 `Transform`
   - 适用于生产环境的安全策略

#### 保护原因追踪

保护机制会记录保护原因，并在指标中体现：
- `annotation` - 由注解保护
- `namespace` - 由命名空间保护
- `kind` - 由资源类型保护

### 3. 执行时间追踪

- Cleaner 执行时间自动记录到 Prometheus 直方图
- Lua 脚本执行时间单独追踪
- 支持按 action 和 result 维度分析性能

### 4. 队列和并发监控

- 实时监控队列长度
- 实时监控处理中的任务数量
- 便于识别性能瓶颈和资源需求

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `K8S_CLEANER_PROTECTED_NAMESPACES` | 受保护的命名空间列表 | `kube-system,kube-public,kube-node-lease` | `prod,staging,kube-system` |
| `K8S_CLEANER_PROTECTED_KINDS` | 受保护的资源类型列表 | 无 | `Secret,ConfigMap,PersistentVolume` |
| `K8S_CLEANER_STRICT_MODE` | 严格模式（仅允许 Scan） | `false` | `true` |

### Helm Chart 配置示例

```yaml
controller:
  env:
    - name: K8S_CLEANER_PROTECTED_NAMESPACES
      value: "kube-system,kube-public,prod,staging"
    - name: K8S_CLEANER_PROTECTED_KINDS
      value: "Secret,ConfigMap"
    - name: K8S_CLEANER_STRICT_MODE
      value: "false"
```

## 📊 监控和告警建议

### Prometheus 查询示例

```promql
# 平均执行时间
rate(k8s_cleaner_execution_duration_seconds_sum[5m]) / rate(k8s_cleaner_execution_duration_seconds_count[5m])

# 失败率
rate(k8s_cleaner_error_resources_total[5m]) / rate(k8s_cleaner_matched_resources_total[5m])

# 队列长度
k8s_cleaner_queue_length

# 受保护资源数量（最近1小时）
increase(k8s_cleaner_protected_resources_total[1h])
```

### Grafana 面板建议

1. **执行概览面板**
   - 执行耗时趋势
   - 成功率趋势
   - 队列长度

2. **资源统计面板**
   - 删除/更新/扫描资源数量
   - 受保护资源数量
   - 错误类型分布

3. **性能分析面板**
   - Lua 脚本执行时间
   - 各 Cleaner 执行耗时对比

## 🚀 升级步骤

1. **更新代码**
   ```bash
   git pull origin main
   ```

2. **构建新版本**
   ```bash
   make docker-build
   ```

3. **更新 Helm Chart**
   - 更新 `charts/k8s-cleaner/values.yaml` 中的镜像版本
   - 添加环境变量配置（如需要）

4. **部署**
   ```bash
   helm upgrade k8s-cleaner ./charts/k8s-cleaner
   ```

5. **验证指标**
   ```bash
   curl http://localhost:8443/metrics | grep k8s_cleaner
   ```

## 🔒 安全建议

1. **生产环境配置**
   - 启用严格模式或至少保护关键命名空间
   - 保护敏感资源类型（Secret、ConfigMap 等）
   - 使用 RBAC 限制 Cleaner 权限

2. **监控告警**
   - 设置队列长度告警（>10）
   - 设置失败率告警（>5%）
   - 设置执行耗时告警（>30s）

3. **审计日志**
   - 所有受保护资源的操作都会被记录
   - 建议集成日志聚合系统（如 ELK）

## 📝 向后兼容性

- ✅ 所有新增功能都是可选的，不影响现有功能
- ✅ 默认行为保持不变
- ✅ 现有 Cleaner CR 无需修改
- ✅ 指标命名遵循标准，不会与现有指标冲突

## 🐛 已知限制

1. Lua 执行时间追踪中的 `cleanerName` 目前使用 "unknown"，后续版本会改进
2. 保护机制在资源匹配阶段生效，不会影响已匹配的资源计数

## 📚 相关文档

- [Prometheus 指标文档](./metrics.md)
- [安全配置指南](./security.md)
- [Helm Chart 配置](./helm-config.md)

## 🤝 贡献

如有问题或建议，请提交 Issue 或 PR。

