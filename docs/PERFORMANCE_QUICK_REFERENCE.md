# k8s-cleaner 性能调优快速参考

## 🚀 快速选择配置

根据集群规模选择对应的 values 文件：

```bash
# 小型集群 (< 50 nodes)
make helm-install-small
# 或
helm install k8s-cleaner ./charts/k8s-cleaner -f charts/k8s-cleaner/values-small.yaml

# 中型集群 (50-200 nodes)
make helm-install-medium
# 或
helm install k8s-cleaner ./charts/k8s-cleaner -f charts/k8s-cleaner/values-medium.yaml

# 大型集群 (200-500 nodes)
make helm-install-large
# 或
helm install k8s-cleaner ./charts/k8s-cleaner -f charts/k8s-cleaner/values-large.yaml

# 超大型集群 (> 500 nodes)
make helm-install-xlarge
# 或
helm install k8s-cleaner ./charts/k8s-cleaner -f charts/k8s-cleaner/values-xlarge.yaml
```

## 📊 配置对比表

| 参数 | 小型 | 中型 | 大型 | 超大型 |
|------|------|------|------|--------|
| **concurrent-reconciles** | 5 | 10 | 20 | 50 |
| **worker-number** | 3 | 5 | 10 | 20 |
| **kube-api-qps** | 20 | 40 | 50 | 80 |
| **kube-api-burst** | 30 | 60 | 100 | 150 |
| **CPU Request** | 50m | 100m | 200m | 500m |
| **CPU Limit** | 200m | 500m | 1000m | 2000m |
| **Memory Request** | 64Mi | 128Mi | 256Mi | 512Mi |
| **Memory Limit** | 256Mi | 512Mi | 1Gi | 2Gi |
| **Replicas** | 1 | 1 | 1-2 | 2 |

## 🔧 性能调优工具

### 1. 自动推荐配置

```bash
make performance-tune
# 或
./scripts/performance-tune.sh
```

脚本会自动分析集群规模并推荐配置。

### 2. 性能基准测试

```bash
make performance-benchmark
# 或
./scripts/performance-benchmark.sh

# 自定义测试时长（默认600秒）
DURATION=300 ./scripts/performance-benchmark.sh
```

### 3. 实时监控

```bash
# 端口转发
kubectl port-forward -n projectsveltos svc/k8s-cleaner 8443:8443

# 查看指标
curl http://localhost:8443/metrics | grep k8s_cleaner

# 查看资源使用
kubectl top pod -n projectsveltos -l app.kubernetes.io/name=k8s-cleaner
```

## 📈 关键性能指标

### 健康指标范围

| 指标 | 优秀 | 良好 | 需关注 | 告警 |
|------|------|------|--------|------|
| CPU 使用率 | < 50% | 50-70% | 70-80% | > 80% |
| 内存使用率 | < 60% | 60-75% | 75-85% | > 85% |
| P95 延迟 | < 5s | 5-15s | 15-30s | > 30s |
| 错误率 | < 1% | 1-3% | 3-5% | > 5% |
| API 延迟 P95 | < 100ms | 100-300ms | 300-500ms | > 500ms |

## 🎯 调优决策树

```
开始
  ↓
检查 CPU 使用率
  ├─ > 80% → 增加 CPU limit 或降低并发
  └─ < 80% → 继续
      ↓
检查内存使用率
  ├─ > 85% → 增加内存 limit
  └─ < 85% → 继续
      ↓
检查 P95 延迟
  ├─ > 30s → 增加 worker-number
  └─ < 30s → 继续
      ↓
检查 API 延迟
  ├─ > 500ms → 降低 QPS/Burst
  └─ < 500ms → 继续
      ↓
检查错误率
  ├─ > 5% → 降低并发或检查配置
  └─ < 5% → 性能良好 ✓
```

## 🔍 常见调优场景

### 场景 1: CPU 瓶颈

**症状：** CPU 使用率 > 80%，Pod 可能被限流

**解决方案：**
```yaml
# 方案 A: 增加 CPU
resources:
  limits:
    cpu: 1000m  # 从 500m 增加

# 方案 B: 降低并发
args:
  concurrent-reconciles: "15"  # 从 20 降低
  worker-number: "8"  # 从 10 降低
```

### 场景 2: 内存不足

**症状：** OOMKilled，内存使用率 > 90%

**解决方案：**
```yaml
resources:
  limits:
    memory: 1Gi  # 从 512Mi 增加
```

### 场景 3: API Server 过载

**症状：** API 延迟高，429 错误

**解决方案：**
```yaml
args:
  kube-api-qps: "30"  # 从 50 降低
  kube-api-burst: "50"  # 从 100 降低
```

### 场景 4: 处理延迟高

**症状：** P95 延迟 > 30秒

**解决方案：**
```yaml
args:
  worker-number: "15"  # 从 10 增加
  concurrent-reconciles: "30"  # 从 20 增加
```

## 📝 调优检查清单

- [ ] 基线测量完成
- [ ] 识别性能瓶颈
- [ ] 选择合适的配置模板
- [ ] 调整资源限制
- [ ] 调整并发参数
- [ ] 调整 API 限流
- [ ] 运行性能测试
- [ ] 验证性能改善
- [ ] 设置监控告警
- [ ] 文档化最终配置

## 🔗 相关资源

- [详细性能调优指南](PERFORMANCE_TUNING.md)
- [部署指南](DEPLOYMENT.md)
- [最佳实践](BEST_PRACTICES.md)

