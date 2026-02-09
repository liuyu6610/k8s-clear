# k8s-cleaner 性能调优总结

## 📋 概述

本文档总结了 k8s-cleaner 的性能调优方案，包括不同规模集群的推荐配置、调优工具和最佳实践。

## 🎯 核心优化内容

### 1. 预设配置模板

为不同规模的集群创建了 4 个预设配置：

- **values-small.yaml**: 小型集群 (< 50 nodes)
- **values-medium.yaml**: 中型集群 (50-200 nodes)  
- **values-large.yaml**: 大型集群 (200-500 nodes)
- **values-xlarge.yaml**: 超大型集群 (> 500 nodes)

每个配置都经过优化，包含：
- 并发参数（concurrent-reconciles, worker-number）
- API 限流（QPS, Burst）
- 资源限制（CPU, Memory）
- 高可用配置（大型集群）

### 2. 性能调优工具

#### 自动推荐脚本 (`scripts/performance-tune.sh`)
- 自动分析集群规模
- 推荐合适的配置
- 生成安装命令

#### 性能基准测试 (`scripts/performance-benchmark.sh`)
- 测量运行性能
- 收集资源使用情况
- 生成性能报告

### 3. 监控 Dashboard

#### Grafana Performance Dashboard
包含 9 个关键面板：
- CPU/内存使用率
- 运行速率和错误率
- 运行耗时分布（P50/P95/P99）
- API 调用频率和延迟
- 各 Cleaner 的操作统计

### 4. 详细文档

- **PERFORMANCE_TUNING.md**: 完整的性能调优指南
- **PERFORMANCE_QUICK_REFERENCE.md**: 快速参考卡片
- **配置对比表**: 一目了然的参数对比

## 📊 配置对比

| 集群规模 | Nodes | Resources | concurrent-reconciles | worker-number | CPU Limit | Memory Limit |
|----------|-------|-----------|---------------------|---------------|-----------|--------------|
| 小型 | < 50 | < 1K | 5 | 3 | 200m | 256Mi |
| 中型 | 50-200 | 1K-10K | 10 | 5 | 500m | 512Mi |
| 大型 | 200-500 | 10K-50K | 20 | 10 | 1000m | 1Gi |
| 超大型 | > 500 | > 50K | 50 | 20 | 2000m | 2Gi |

## 🚀 快速开始

### 1. 获取推荐配置

```bash
make performance-tune
```

### 2. 安装对应配置

```bash
# 根据推荐选择
make helm-install-medium  # 示例：中型集群
```

### 3. 运行性能测试

```bash
make performance-benchmark
```

### 4. 监控性能

导入 Grafana Dashboard：
- `monitoring/grafana-performance-dashboard.json`

## 🔍 调优流程

```
1. 基线测量
   ↓
2. 识别瓶颈
   ↓
3. 选择配置模板
   ↓
4. 渐进式调优
   ↓
5. 验证改善
   ↓
6. 持续监控
```

## 📈 关键指标

### 健康指标阈值

| 指标 | 优秀 | 良好 | 需关注 | 告警 |
|------|------|------|--------|------|
| CPU 使用率 | < 50% | 50-70% | 70-80% | > 80% |
| 内存使用率 | < 60% | 60-75% | 75-85% | > 85% |
| P95 延迟 | < 5s | 5-15s | 15-30s | > 30s |
| 错误率 | < 1% | 1-3% | 3-5% | > 5% |

## 🛠️ Makefile 命令

新增的性能相关命令：

```bash
make performance-tune          # 获取调优建议
make performance-benchmark      # 运行性能测试
make helm-install-small         # 小型集群安装
make helm-install-medium        # 中型集群安装
make helm-install-large         # 大型集群安装
make helm-install-xlarge        # 超大型集群安装
```

## 📝 文件清单

### 新增文件

1. **配置模板** (4个)
   - `charts/k8s-cleaner/values-small.yaml`
   - `charts/k8s-cleaner/values-medium.yaml`
   - `charts/k8s-cleaner/values-large.yaml`
   - `charts/k8s-cleaner/values-xlarge.yaml`

2. **脚本工具** (2个)
   - `scripts/performance-benchmark.sh`
   - `scripts/performance-tune.sh`

3. **监控配置** (1个)
   - `monitoring/grafana-performance-dashboard.json`

4. **文档** (2个)
   - `docs/PERFORMANCE_TUNING.md`
   - `docs/PERFORMANCE_QUICK_REFERENCE.md`

### 修改文件

1. `Makefile` - 新增性能相关命令
2. `QUICK_REFERENCE.md` - 添加性能调优快速参考

## 💡 最佳实践

1. **从默认配置开始**：先使用默认配置，观察性能
2. **渐进式调优**：一次只调整一个参数
3. **持续监控**：设置告警，及时发现问题
4. **定期测试**：定期运行性能测试，验证配置
5. **文档化**：记录调优过程和最终配置

## 🔗 相关资源

- [性能调优指南](PERFORMANCE_TUNING.md)
- [性能快速参考](PERFORMANCE_QUICK_REFERENCE.md)
- [部署指南](DEPLOYMENT.md)
- [最佳实践](BEST_PRACTICES.md)

---

**创建时间：** 2026-02-09  
**版本：** v0.17.1+ (Performance Tuned)

