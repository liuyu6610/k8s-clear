# k8s-cleaner 部署指南

## 📋 目录

- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [Helm 部署](#helm-部署)
- [Kustomize 部署](#kustomize-部署)
- [配置说明](#配置说明)
- [监控配置](#监控配置)
- [故障排查](#故障排查)

## 前置要求

- Kubernetes 1.28+ 集群
- kubectl 已配置并可以访问集群
- Helm 3.x（如果使用 Helm 部署）
- 集群管理员权限（用于安装 CRD 和 RBAC）

## 快速开始

### 使用 Helm（推荐）

```bash
# 添加 Helm repo（如果已发布）
helm repo add k8s-cleaner https://charts.example.com/k8s-cleaner
helm repo update

# 安装
helm install k8s-cleaner k8s-cleaner/k8s-cleaner \
  --namespace projectsveltos \
  --create-namespace

# 或使用本地 chart
helm install k8s-cleaner ./charts/k8s-cleaner \
  --namespace projectsveltos \
  --create-namespace
```

### 使用 Kustomize

```bash
# 安装 CRD
make install

# 部署控制器
make deploy
```

## Helm 部署

### 基础配置

```yaml
# values.yaml
controller:
  image:
    tag: "v0.17.1"
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
  args:
    disable-telemetry: "true"  # 默认关闭遥测
```

### 生产环境推荐配置

```yaml
# values-production.yaml
replicaCount: 2  # 高可用

controller:
  image:
    tag: "v0.17.1"
  resources:
    requests:
      cpu: 200m
      memory: 256Mi
    limits:
      cpu: 1000m
      memory: 1Gi
  args:
    disable-telemetry: "true"
    concurrent-reconciles: "20"
    worker-number: "10"
    kube-api-qps: "50"
    kube-api-burst: "100"

# 启用监控
serviceMonitor:
  enabled: true
  namespace: monitoring
  labels:
    prometheus: kube-prometheus

# Pod 安全配置
podSecurityContext:
  enabled: true
  runAsNonRoot: true
  runAsUser: 65532
  fsGroup: 65532
  seccompProfile:
    type: RuntimeDefault

# 节点选择
nodeSelector:
  kubernetes.io/os: linux
  node-role.kubernetes.io/worker: ""

# 容忍度
tolerations:
  - key: "node-role.kubernetes.io/control-plane"
    operator: "Exists"
    effect: "NoSchedule"

# 亲和性（分散部署）
topologySpreadConstraints:
  - maxSkew: 1
    topologyKey: kubernetes.io/hostname
    whenUnsatisfiable: DoNotSchedule
    labelSelector:
      matchLabels:
        app.kubernetes.io/name: k8s-cleaner
```

### 安装命令

```bash
helm install k8s-cleaner ./charts/k8s-cleaner \
  -f values-production.yaml \
  --namespace projectsveltos \
  --create-namespace \
  --wait \
  --timeout 5m
```

### 升级

```bash
helm upgrade k8s-cleaner ./charts/k8s-cleaner \
  -f values-production.yaml \
  --namespace projectsveltos \
  --wait
```

### 卸载

```bash
helm uninstall k8s-cleaner --namespace projectsveltos
```

## Kustomize 部署

### 基础部署

```bash
# 1. 安装 CRD
make install

# 2. 构建并部署
make deploy
```

### 自定义配置

编辑 `config/default/kustomization.yaml` 和相关的 patch 文件：

```bash
# 修改镜像
cd config/manager
kustomize edit set image controller=your-registry/k8s-cleaner:v0.17.1

# 构建
kustomize build config/default | kubectl apply -f -
```

## 配置说明

### 关键参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--concurrent-reconciles` | 10 | 并发协调数 |
| `--worker-number` | 5 | 后台工作线程数 |
| `--kube-api-qps` | 40 | Kubernetes API QPS |
| `--kube-api-burst` | 60 | Kubernetes API Burst |
| `--jitter-window` | 15 | 调度抖动窗口（秒） |
| `--disable-telemetry` | false | 禁用遥测（生产环境建议 true） |

### 环境变量

| 变量名 | 说明 |
|--------|------|
| `CLEANER_TELEMETRY_ENDPOINT` | 自定义遥测端点（如果启用） |
| `NAMESPACE` | Pod 命名空间（自动注入） |

### 资源限制建议

| 环境 | CPU Request | Memory Request | CPU Limit | Memory Limit |
|------|-------------|----------------|-----------|--------------|
| 开发 | 50m | 64Mi | 200m | 256Mi |
| 测试 | 100m | 128Mi | 500m | 512Mi |
| 生产 | 200m | 256Mi | 1000m | 1Gi |

## 监控配置

### 1. 启用 ServiceMonitor

```yaml
serviceMonitor:
  enabled: true
  namespace: monitoring  # Prometheus Operator 所在命名空间
  labels:
    prometheus: kube-prometheus
```

### 2. 安装 Prometheus 告警规则

```bash
kubectl apply -f monitoring/prometheus-rules.yaml
```

### 3. 导入 Grafana Dashboard

```bash
# 方式1: 通过 ConfigMap
kubectl create configmap k8s-cleaner-dashboard \
  --from-file=monitoring/grafana-dashboard.json \
  -n monitoring

# 方式2: 在 Grafana UI 中导入
# 复制 monitoring/grafana-dashboard.json 内容到 Grafana
```

### 4. 关键指标

- `k8s_cleaner_runs_total`: Cleaner 运行总数
- `k8s_cleaner_run_duration_seconds`: 运行耗时分布
- `k8s_cleaner_deleted_resources_total`: 删除的资源数
- `k8s_cleaner_updated_resources_total`: 更新的资源数
- `k8s_cleaner_scan_resources_total`: 扫描的资源数
- `k8s_cleaner_error_resources_total`: 错误数

## 故障排查

### 检查 Pod 状态

```bash
kubectl get pods -n projectsveltos -l app.kubernetes.io/name=k8s-cleaner
```

### 查看日志

```bash
kubectl logs -n projectsveltos -l app.kubernetes.io/name=k8s-cleaner --tail=100 -f
```

### 检查 CRD

```bash
kubectl get crd cleaners.apps.projectsveltos.io
kubectl get crd reports.apps.projectsveltos.io
```

### 检查 RBAC

```bash
kubectl get clusterrole | grep k8s-cleaner
kubectl get clusterrolebinding | grep k8s-cleaner
```

### 常见问题

#### 1. Pod 无法启动

- 检查资源限制是否足够
- 检查 RBAC 权限
- 查看 Pod 事件：`kubectl describe pod -n projectsveltos`

#### 2. Cleaner 不执行

- 检查 Cleaner CR 的 schedule 格式
- 查看控制器日志
- 检查 `NextScheduleTime` 状态

#### 3. 指标无法采集

- 确认 ServiceMonitor 已创建
- 检查 Prometheus 是否配置了正确的 selector
- 验证 Service 端口配置

#### 4. 权限不足

- 确认 ClusterRole 包含所需权限
- 检查 ClusterRoleBinding 是否正确绑定 ServiceAccount

## 安全最佳实践

1. **禁用遥测**：生产环境设置 `disable-telemetry: "true"`
2. **使用非 root 用户**：已默认配置 `runAsNonRoot: true`
3. **限制权限**：遵循最小权限原则
4. **资源限制**：设置合理的 requests 和 limits
5. **网络策略**：配置 NetworkPolicy 限制网络访问
6. **镜像扫描**：定期扫描镜像漏洞

## 升级指南

### 从旧版本升级

1. **备份配置**
   ```bash
   kubectl get cleaner -A -o yaml > cleaners-backup.yaml
   ```

2. **升级 CRD**
   ```bash
   kubectl apply -f config/crd/bases/
   ```

3. **升级控制器**
   ```bash
   helm upgrade k8s-cleaner ./charts/k8s-cleaner -f values.yaml
   ```

4. **验证**
   ```bash
   kubectl get pods -n projectsveltos
   kubectl get cleaner -A
   ```

## 参考

- [官方文档](https://gianlucam76.github.io/k8s-cleaner/)
- [示例配置](../examples-unused-resources/)
- [GitHub Issues](https://github.com/gianlucam76/k8s-cleaner/issues)

