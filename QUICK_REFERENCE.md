# k8s-cleaner 快速参考

## 🚀 快速命令

### 开发
```bash
make help              # 查看所有命令
make dev-setup         # 设置开发环境
make build             # 构建二进制
make test              # 运行测试
make lint              # 代码检查
make check             # 运行所有检查
```

### 构建
```bash
make docker-build-local    # 本地构建（带版本信息）
make docker-buildx         # 多架构构建并推送
```

### 部署
```bash
# Helm
make helm-install      # 安装
make helm-upgrade      # 升级
make helm-uninstall    # 卸载

# Kustomize
make install           # 安装 CRD
make deploy            # 部署控制器
make undeploy          # 卸载控制器
```

### 前端
```bash
cd ui
npm install            # 安装依赖
npm run dev            # 开发模式
npm run build          # 构建生产版本
npm run preview        # 预览构建
```

### 监控
```bash
make install-monitoring    # 安装监控配置
kubectl apply -f monitoring/prometheus-rules.yaml
```

## 📋 关键配置

### Helm Values 关键项
```yaml
controller:
  args:
    disable-telemetry: "true"      # 禁用遥测
    concurrent-reconciles: "20"    # 并发协调数
    worker-number: "10"            # 工作线程数
  resources:
    requests:
      cpu: 200m
      memory: 256Mi
    limits:
      cpu: 1000m
      memory: 1Gi

serviceMonitor:
  enabled: true                    # 启用监控
```

### 环境变量
```bash
CLEANER_TELEMETRY_ENDPOINT=https://your-endpoint.com
NAMESPACE=projectsveltos
```

## 🔍 常用检查命令

```bash
# 检查 Pod
kubectl get pods -n projectsveltos -l app.kubernetes.io/name=k8s-cleaner

# 查看日志
kubectl logs -n projectsveltos -l app.kubernetes.io/name=k8s-cleaner -f

# 检查 Cleaner
kubectl get cleaner -A

# 检查指标
kubectl port-forward -n projectsveltos svc/k8s-cleaner 8443:8443
curl http://localhost:8443/metrics | grep k8s_cleaner
```

## 📊 关键指标

- `k8s_cleaner_runs_total` - 运行总数
- `k8s_cleaner_run_duration_seconds` - 运行耗时
- `k8s_cleaner_deleted_resources_total` - 删除的资源
- `k8s_cleaner_error_resources_total` - 错误数

## 🐛 故障排查

```bash
# 检查 Pod 状态
kubectl describe pod -n projectsveltos -l app.kubernetes.io/name=k8s-cleaner

# 检查事件
kubectl get events -n projectsveltos --sort-by='.lastTimestamp'

# 检查 RBAC
kubectl get clusterrole | grep k8s-cleaner
kubectl get clusterrolebinding | grep k8s-cleaner
```

## ⚡ 性能调优

```bash
# 获取调优建议
make performance-tune

# 运行性能测试
make performance-benchmark

# 按集群规模安装
make helm-install-small    # 小型集群
make helm-install-medium   # 中型集群
make helm-install-large    # 大型集群
make helm-install-xlarge   # 超大型集群
```

## 📚 文档链接

- [部署指南](docs/DEPLOYMENT.md)
- [最佳实践](docs/BEST_PRACTICES.md)
- [性能调优](docs/PERFORMANCE_TUNING.md)
- [性能快速参考](docs/PERFORMANCE_QUICK_REFERENCE.md)
- [升级总结](docs/UPGRADE_SUMMARY.md)
- [前端文档](ui/README.md)

