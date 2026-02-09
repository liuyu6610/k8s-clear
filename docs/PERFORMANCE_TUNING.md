# k8s-cleaner 性能调优指南

## 📋 目录

- [性能参数说明](#性能参数说明)
- [集群规模推荐配置](#集群规模推荐配置)
- [性能调优步骤](#性能调优步骤)
- [监控关键指标](#监控关键指标)
- [常见性能问题](#常见性能问题)
- [性能测试](#性能测试)

## 性能参数说明

### 核心参数

| 参数 | 默认值 | 说明 | 影响 |
|------|--------|------|------|
| `concurrent-reconciles` | 10 | 并发协调数，控制同时处理的 Cleaner 实例数 | 影响 CPU 和 API 调用频率 |
| `worker-number` | 5 | 后台工作线程数，处理实际的清理任务 | 影响并发清理能力 |
| `kube-api-qps` | 40 | Kubernetes API 每秒查询数 | 影响 API Server 负载 |
| `kube-api-burst` | 60 | Kubernetes API 突发请求数 | 影响峰值处理能力 |
| `jitter-window` | 15 | 调度抖动窗口（秒），避免同时执行 | 影响调度分布 |
| `sync-period` | 10m | 资源同步周期 | 影响缓存刷新频率 |

### 资源限制

| 资源类型 | 默认值 | 说明 |
|----------|--------|------|
| CPU Request | 100m | 保证的最小 CPU |
| CPU Limit | 500m | 最大 CPU 使用 |
| Memory Request | 128Mi | 保证的最小内存 |
| Memory Limit | 512Mi | 最大内存使用 |

## 集群规模推荐配置

### 小型集群 (< 50 nodes, < 1000 resources)

**特点：** 资源较少，负载较低

```yaml
controller:
  args:
    concurrent-reconciles: "5"
    worker-number: "3"
    kube-api-qps: "20"
    kube-api-burst: "30"
    jitter-window: "10"
  resources:
    requests:
      cpu: 50m
      memory: 64Mi
    limits:
      cpu: 200m
      memory: 256Mi
replicaCount: 1
```

**预期性能：**
- 处理延迟：< 5秒
- API 调用：< 100 req/min
- CPU 使用：10-30%
- 内存使用：50-100Mi

---

### 中型集群 (50-200 nodes, 1000-10000 resources)

**特点：** 中等负载，需要平衡性能和资源

```yaml
controller:
  args:
    concurrent-reconciles: "10"
    worker-number: "5"
    kube-api-qps: "40"
    kube-api-burst: "60"
    jitter-window: "15"
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
replicaCount: 1
```

**预期性能：**
- 处理延迟：< 10秒
- API 调用：200-500 req/min
- CPU 使用：20-50%
- 内存使用：100-300Mi

---

### 大型集群 (200-500 nodes, 10000-50000 resources)

**特点：** 高负载，需要更多并发和资源

```yaml
controller:
  args:
    concurrent-reconciles: "20"
    worker-number: "10"
    kube-api-qps: "50"
    kube-api-burst: "100"
    jitter-window: "20"
  resources:
    requests:
      cpu: 200m
      memory: 256Mi
    limits:
      cpu: 1000m
      memory: 1Gi
replicaCount: 1  # 或 2（高可用）
```

**预期性能：**
- 处理延迟：< 20秒
- API 调用：500-1000 req/min
- CPU 使用：30-70%
- 内存使用：200-600Mi

---

### 超大型集群 (> 500 nodes, > 50000 resources)

**特点：** 极高负载，需要高并发和充足资源

```yaml
controller:
  args:
    concurrent-reconciles: "50"
    worker-number: "20"
    kube-api-qps: "80"
    kube-api-burst: "150"
    jitter-window: "30"
  resources:
    requests:
      cpu: 500m
      memory: 512Mi
    limits:
      cpu: 2000m
      memory: 2Gi
replicaCount: 2  # 高可用
```

**预期性能：**
- 处理延迟：< 30秒
- API 调用：1000-2000 req/min
- CPU 使用：50-90%
- 内存使用：400-1.5Gi

---

## 性能调优步骤

### 步骤 1: 基线测量

```bash
# 1. 部署默认配置
helm install k8s-cleaner ./charts/k8s-cleaner -f values.yaml

# 2. 等待稳定运行（至少30分钟）
sleep 1800

# 3. 收集指标
kubectl port-forward -n projectsveltos svc/k8s-cleaner 8443:8443 &
curl http://localhost:8443/metrics > baseline-metrics.txt

# 4. 检查关键指标
# - k8s_cleaner_run_duration_seconds (P95, P99)
# - k8s_cleaner_runs_total
# - k8s_cleaner_error_resources_total
# - API Server 延迟
```

### 步骤 2: 识别瓶颈

**检查指标：**

```promql
# CPU 使用率
rate(container_cpu_usage_seconds_total{container="controller"}[5m])

# 内存使用率
container_memory_usage_bytes{container="controller"} / container_spec_memory_limit_bytes{container="controller"}

# API 调用延迟
histogram_quantile(0.95, sum(rate(apiserver_request_duration_seconds_bucket{resource="*"}[5m])) by (le))

# Cleaner 运行延迟
histogram_quantile(0.95, sum(rate(k8s_cleaner_run_duration_seconds_bucket[5m])) by (le))

# 错误率
sum(rate(k8s_cleaner_error_resources_total[5m])) / sum(rate(k8s_cleaner_runs_total[5m]))
```

**瓶颈判断：**

| 指标 | 阈值 | 可能原因 | 解决方案 |
|------|------|----------|----------|
| CPU 使用率 | > 80% | 并发过高或资源不足 | 增加 CPU limit 或降低并发 |
| 内存使用率 | > 85% | 内存不足 | 增加内存 limit |
| API 延迟 P95 | > 500ms | API Server 过载 | 降低 QPS/Burst |
| Cleaner 延迟 P95 | > 30s | 工作线程不足 | 增加 worker-number |
| 错误率 | > 5% | 资源竞争或超时 | 调整并发和超时 |

### 步骤 3: 渐进式调优

**原则：** 一次只调整一个参数，观察效果

```bash
# 示例：增加并发数
helm upgrade k8s-cleaner ./charts/k8s-cleaner \
  --set controller.args.concurrent-reconciles=20 \
  --wait

# 等待15分钟，观察指标
# 如果改善，继续增加；如果恶化，回退
```

**调优顺序建议：**

1. **先调资源限制**（CPU/Memory）
   - 确保有足够资源
   - 观察资源使用率

2. **再调并发参数**（concurrent-reconciles, worker-number）
   - 逐步增加
   - 监控 API 调用频率

3. **最后调 API 限流**（QPS/Burst）
   - 根据 API Server 能力调整
   - 避免影响其他组件

### 步骤 4: 验证和监控

```bash
# 1. 验证性能改善
# 对比调优前后的指标

# 2. 压力测试
# 创建多个 Cleaner 实例，观察性能

# 3. 持续监控
# 设置告警，及时发现性能问题
```

## 监控关键指标

### 1. 运行性能指标

```promql
# 运行次数（QPS）
sum(rate(k8s_cleaner_runs_total[5m])) by (cleaner_instance, action)

# 运行耗时分布
histogram_quantile(0.50, sum(rate(k8s_cleaner_run_duration_seconds_bucket[5m])) by (le, cleaner_instance))  # P50
histogram_quantile(0.95, sum(rate(k8s_cleaner_run_duration_seconds_bucket[5m])) by (le, cleaner_instance))  # P95
histogram_quantile(0.99, sum(rate(k8s_cleaner_run_duration_seconds_bucket[5m])) by (le, cleaner_instance))  # P99

# 错误率
sum(rate(k8s_cleaner_error_resources_total[5m])) / sum(rate(k8s_cleaner_runs_total[5m]))
```

### 2. 资源使用指标

```promql
# CPU 使用率
rate(container_cpu_usage_seconds_total{container="controller"}[5m])

# 内存使用
container_memory_usage_bytes{container="controller"}

# 资源使用率
rate(container_cpu_usage_seconds_total{container="controller"}[5m]) / container_spec_cpu_quota{container="controller"} * 100
```

### 3. API 调用指标

```promql
# API 调用频率
sum(rate(apiserver_request_total{resource="*"}[5m])) by (verb, resource)

# API 延迟
histogram_quantile(0.95, sum(rate(apiserver_request_duration_seconds_bucket[5m])) by (le, verb, resource))

# API 错误率
sum(rate(apiserver_request_total{code=~"5.."}[5m])) / sum(rate(apiserver_request_total[5m]))
```

### 4. 队列和延迟指标

```promql
# 队列长度（如果有）
k8s_cleaner_queue_length

# 等待时间
k8s_cleaner_wait_duration_seconds

# 处理中任务数
k8s_cleaner_in_progress_tasks
```

## 常见性能问题

### 问题 1: CPU 使用率过高

**症状：**
- CPU 使用率 > 80%
- Pod 可能被限流
- 处理延迟增加

**解决方案：**
```yaml
# 方案1: 增加 CPU limit
resources:
  limits:
    cpu: 1000m  # 从 500m 增加到 1000m

# 方案2: 降低并发数
args:
  concurrent-reconciles: "15"  # 从 20 降低到 15
  worker-number: "8"  # 从 10 降低到 8
```

### 问题 2: 内存不足

**症状：**
- OOMKilled
- 内存使用率 > 90%
- 频繁 GC

**解决方案：**
```yaml
# 增加内存 limit
resources:
  limits:
    memory: 1Gi  # 从 512Mi 增加到 1Gi

# 如果问题持续，检查是否有内存泄漏
```

### 问题 3: API Server 过载

**症状：**
- API 调用延迟高
- 429 Too Many Requests
- 其他组件受影响

**解决方案：**
```yaml
# 降低 API 调用频率
args:
  kube-api-qps: "30"  # 从 50 降低到 30
  kube-api-burst: "50"  # 从 100 降低到 50

# 增加同步周期，减少 List 操作
sync-period: "15m"  # 从 10m 增加到 15m
```

### 问题 4: 处理延迟过高

**症状：**
- P95 延迟 > 30秒
- Cleaner 执行超时
- 资源清理不及时

**解决方案：**
```yaml
# 增加工作线程数
args:
  worker-number: "15"  # 从 10 增加到 15

# 增加并发协调数
args:
  concurrent-reconciles: "30"  # 从 20 增加到 30

# 确保有足够资源
resources:
  requests:
    cpu: 300m
    memory: 256Mi
  limits:
    cpu: 1500m
    memory: 1Gi
```

### 问题 5: 错误率过高

**症状：**
- 错误率 > 5%
- 大量失败任务
- 资源清理不完整

**解决方案：**
```yaml
# 降低并发，减少竞争
args:
  concurrent-reconciles: "15"
  worker-number: "8"

# 增加超时时间（如果支持）
# 检查 Cleaner 配置，优化 Lua 脚本
```

## 性能测试

### 测试脚本

创建性能测试脚本（见 `scripts/performance-test.sh`）：

```bash
#!/bin/bash
# 性能测试脚本

# 1. 创建测试 Cleaner
kubectl apply -f test/performance/cleaners.yaml

# 2. 等待运行
sleep 300

# 3. 收集指标
kubectl port-forward -n projectsveltos svc/k8s-cleaner 8443:8443 &
PF_PID=$!

sleep 10
curl -s http://localhost:8443/metrics > /tmp/metrics.txt
kill $PF_PID

# 4. 分析结果
echo "=== Performance Test Results ==="
grep "k8s_cleaner_runs_total" /tmp/metrics.txt
grep "k8s_cleaner_run_duration_seconds" /tmp/metrics.txt
```

### 压力测试

```bash
# 创建多个 Cleaner 实例
for i in {1..50}; do
  kubectl apply -f - <<EOF
apiVersion: apps.projectsveltos.io/v1alpha1
kind: Cleaner
metadata:
  name: stress-test-$i
spec:
  schedule: "*/5 * * * *"
  resourcePolicySet:
    resourceSelectors:
      - group: ""
        version: v1
        kind: ConfigMap
  action: Scan
EOF
done

# 监控性能指标
watch -n 5 'kubectl top pod -n projectsveltos -l app.kubernetes.io/name=k8s-cleaner'
```

## 调优检查清单

- [ ] 基线测量完成
- [ ] 识别性能瓶颈
- [ ] 调整资源限制
- [ ] 调整并发参数
- [ ] 调整 API 限流
- [ ] 验证性能改善
- [ ] 设置监控告警
- [ ] 文档化配置

## 参考

- [Kubernetes 性能调优最佳实践](https://kubernetes.io/docs/concepts/cluster-administration/cluster-management/)
- [Prometheus 查询语言](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Go 性能优化](https://go.dev/doc/diagnostics)

