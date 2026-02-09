# k8s-cleaner 最佳实践

## 📚 目录

- [Cleaner 配置最佳实践](#cleaner-配置最佳实践)
- [性能优化](#性能优化)
- [安全建议](#安全建议)
- [监控和告警](#监控和告警)
- [故障恢复](#故障恢复)

## Cleaner 配置最佳实践

### 1. Schedule 配置

**推荐做法：**
- 使用合理的 Cron 表达式，避免过于频繁的执行
- 核心资源清理：每小时或每 6 小时
- 非关键资源清理：每天或每周
- 使用 `StartingDeadlineSeconds` 防止错过执行时间

**示例：**
```yaml
apiVersion: apps.projectsveltos.io/v1alpha1
kind: Cleaner
metadata:
  name: cleanup-completed-jobs
spec:
  schedule: "0 */6 * * *"  # 每6小时执行一次
  startingDeadlineSeconds: 3600  # 允许1小时的延迟窗口
  # ...
```

### 2. DryRun 模式

**首次部署时使用 DryRun：**
```yaml
spec:
  action: Scan  # 先扫描，不删除
  # 或使用 DryRun 模式验证配置
```

**验证后切换到 Delete：**
```yaml
spec:
  action: Delete
```

### 3. 资源选择器优化

**使用 Label Filters：**
```yaml
spec:
  resourcePolicySet:
    resourceSelectors:
      - group: ""
        version: v1
        kind: ConfigMap
        labelFilters:
          - key: app.kubernetes.io/managed-by
            operation: Equal
            value: kustomize
```

**使用 NamespaceSelector：**
```yaml
spec:
  resourcePolicySet:
    resourceSelectors:
      - namespaceSelector: "environment=dev"
        # ...
```

### 4. Lua 脚本优化

**性能优化：**
- 避免复杂的嵌套循环
- 使用简单的条件判断
- 缓存常用计算结果

**示例：**
```lua
function evaluate(obj)
  -- 简单判断，避免复杂逻辑
  if obj.metadata.creationTimestamp ~= nil then
    local age = os.time() - obj.metadata.creationTimestamp
    if age > 86400 * 7 then  -- 7天
      return {matching = true, message = "Resource older than 7 days"}
    end
  end
  return {matching = false}
end
```

## 性能优化

### 1. 并发配置

**根据集群规模调整：**
```yaml
# 小集群 (< 100 nodes)
concurrent-reconciles: 10
worker-number: 5

# 中等集群 (100-500 nodes)
concurrent-reconciles: 20
worker-number: 10

# 大集群 (> 500 nodes)
concurrent-reconciles: 50
worker-number: 20
```

### 2. API 限流配置

```yaml
# 避免 API Server 过载
kube-api-qps: 50
kube-api-burst: 100
```

### 3. 资源限制

```yaml
resources:
  requests:
    cpu: 200m
    memory: 256Mi
  limits:
    cpu: 1000m
    memory: 1Gi
```

### 4. 批量操作优化

- 使用 `AggregatedSelection` 减少 API 调用
- 合理设置 `ExcludeDeleted` 避免处理已删除资源
- 使用 Label Selector 缩小资源范围

## 安全建议

### 1. RBAC 最小权限

**创建专用 ServiceAccount：**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: k8s-cleaner
  namespace: projectsveltos
```

**限制权限范围：**
```yaml
# 只授予必要的权限
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: k8s-cleaner-limited
rules:
  - apiGroups: [""]
    resources: ["configmaps", "secrets"]
    verbs: ["get", "list", "delete"]
  # 避免使用 "*" 通配符
```

### 2. 网络策略

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: k8s-cleaner-netpol
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: k8s-cleaner
  policyTypes:
    - Ingress
    - Egress
  egress:
    - to:
        - namespaceSelector: {}  # 允许访问所有命名空间
      ports:
        - protocol: TCP
          port: 443  # Kubernetes API
```

### 3. 敏感信息处理

- 使用 Secret 存储通知凭证
- 避免在 Cleaner CR 中硬编码敏感信息
- 定期轮换凭证

### 4. 审计日志

启用 Kubernetes 审计日志，记录所有清理操作：
```yaml
# 在 Cleaner 中添加注释
metadata:
  annotations:
    audit.k8s.io/enabled: "true"
```

## 监控和告警

### 1. 关键指标监控

**运行健康度：**
- `k8s_cleaner_runs_total`: 运行次数
- `k8s_cleaner_run_duration_seconds`: 运行耗时
- `k8s_cleaner_error_resources_total`: 错误数

**资源清理效果：**
- `k8s_cleaner_deleted_resources_total`: 删除的资源
- `k8s_cleaner_updated_resources_total`: 更新的资源

### 2. 告警规则

**高错误率告警：**
```yaml
- alert: CleanerHighErrorRate
  expr: |
    sum(rate(k8s_cleaner_error_resources_total[5m])) 
    / 
    sum(rate(k8s_cleaner_runs_total[5m])) > 0.05
  for: 5m
```

**运行超时告警：**
```yaml
- alert: CleanerRunDurationHigh
  expr: |
    histogram_quantile(0.95, 
      sum(rate(k8s_cleaner_run_duration_seconds_bucket[5m])) by (le)
    ) > 30
  for: 10m
```

### 3. 通知配置

**多通道通知：**
```yaml
spec:
  notifications:
    - name: slack-alert
      type: Slack
      notificationRef:
        name: slack-secret
        namespace: projectsveltos
    - name: email-report
      type: SMTP
      notificationRef:
        name: smtp-secret
        namespace: projectsveltos
```

## 故障恢复

### 1. 备份策略

**定期备份 Cleaner 配置：**
```bash
# 备份所有 Cleaner
kubectl get cleaner -A -o yaml > cleaners-backup-$(date +%Y%m%d).yaml

# 备份 Report
kubectl get report -A -o yaml > reports-backup-$(date +%Y%m%d).yaml
```

### 2. 回滚步骤

**1. 停止所有 Cleaner：**
```bash
kubectl patch cleaner <name> -p '{"spec":{"schedule":"9999-12-31T23:59:59Z"}}'
```

**2. 恢复配置：**
```bash
kubectl apply -f cleaners-backup-YYYYMMDD.yaml
```

**3. 验证：**
```bash
kubectl get cleaner -A
kubectl logs -n projectsveltos -l app.kubernetes.io/name=k8s-cleaner
```

### 3. 紧急停止

**快速停止所有清理操作：**
```bash
# 方法1: 删除所有 Cleaner
kubectl delete cleaner --all -A

# 方法2: 暂停控制器
kubectl scale deployment k8s-cleaner-controller -n projectsveltos --replicas=0
```

## 多集群管理

### 1. 使用 Sveltos

参考 [Sveltos 多集群部署文档](https://gianlucam76.github.io/k8s-cleaner/getting_started/install/install_on_multiple_cluster/)

### 2. GitOps 方式

使用 ArgoCD 或 Flux 管理多集群配置：
```yaml
# argocd-application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: k8s-cleaner-prod
spec:
  source:
    repoURL: https://github.com/your-org/k8s-cleaner-configs
    path: clusters/prod
  destination:
    server: https://prod-cluster.example.com
```

## 常见场景

### 1. 清理未使用的 ConfigMap

```yaml
apiVersion: apps.projectsveltos.io/v1alpha1
kind: Cleaner
metadata:
  name: cleanup-unused-configmaps
spec:
  schedule: "0 2 * * *"  # 每天凌晨2点
  resourcePolicySet:
    resourceSelectors:
      - group: ""
        version: v1
        kind: ConfigMap
        evaluate: |
          function evaluate(obj)
            -- 检查是否被引用
            if obj.metadata.annotations and obj.metadata.annotations["k8s-cleaner/keep"] then
              return {matching = false}
            end
            return {matching = true, message = "Unused ConfigMap"}
          end
  action: Delete
```

### 2. 清理过期的 Job

```yaml
apiVersion: apps.projectsveltos.io/v1alpha1
kind: Cleaner
metadata:
  name: cleanup-completed-jobs
spec:
  schedule: "0 */6 * * *"
  resourcePolicySet:
    resourceSelectors:
      - group: batch
        version: v1
        kind: Job
        evaluate: |
          function evaluate(obj)
            if obj.status and obj.status.completionTime then
              local age = os.time() - obj.status.completionTime
              if age > 86400 * 7 then  -- 7天
                return {matching = true, message = "Job completed more than 7 days ago"}
              end
            end
            return {matching = false}
          end
  action: Delete
```

### 3. 扫描过期证书

```yaml
apiVersion: apps.projectsveltos.io/v1alpha1
kind: Cleaner
metadata:
  name: scan-expired-certs
spec:
  schedule: "*/30 * * * *"  # 每30分钟
  resourcePolicySet:
    resourceSelectors:
      - group: ""
        version: v1
        kind: Pod
        evaluate: |
          function evaluate(obj)
            -- 检查证书过期逻辑
            -- 这里只是示例，实际需要解析证书
            return {matching = false}
          end
  action: Scan  # 只扫描，不删除
  notifications:
    - name: cert-alert
      type: Slack
```

## 参考资源

- [官方文档](https://gianlucam76.github.io/k8s-cleaner/)
- [示例配置](../examples-unused-resources/)
- [Lua 脚本指南](https://gianlucam76.github.io/k8s-cleaner/getting_started/features/)

