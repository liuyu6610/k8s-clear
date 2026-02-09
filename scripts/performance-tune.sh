#!/bin/bash
# k8s-cleaner 性能调优辅助脚本
# 根据当前集群规模自动推荐配置

set -euo pipefail

NAMESPACE="${NAMESPACE:-default}"

echo "=========================================="
echo "k8s-cleaner Performance Tuning Assistant"
echo "=========================================="
echo ""

# 检查 kubectl
command -v kubectl >/dev/null 2>&1 || { echo "kubectl is required but not installed. Aborting." >&2; exit 1; }

# 获取集群信息
echo "Analyzing cluster..."
NODE_COUNT=$(kubectl get nodes --no-headers 2>/dev/null | wc -l || echo "0")
POD_COUNT=$(kubectl get pods --all-namespaces --no-headers 2>/dev/null | wc -l || echo "0")
NAMESPACE_COUNT=$(kubectl get namespaces --no-headers 2>/dev/null | wc -l || echo "0")

echo "Cluster Information:"
echo "  Nodes: $NODE_COUNT"
echo "  Pods: $POD_COUNT"
echo "  Namespaces: $NAMESPACE_COUNT"
echo ""

# 估算资源数量（粗略）
ESTIMATED_RESOURCES=$((POD_COUNT * 3))  # 假设每个 Pod 平均关联 3 个资源

# 推荐配置
echo "=========================================="
echo "Recommended Configuration"
echo "=========================================="

if [ "$NODE_COUNT" -lt 50 ] && [ "$ESTIMATED_RESOURCES" -lt 1000 ]; then
    CONFIG_FILE="values-small.yaml"
    echo "Cluster Size: SMALL (< 50 nodes, < 1000 resources)"
    echo "Config File: charts/k8s-cleaner/$CONFIG_FILE"
    echo ""
    echo "Recommended Settings:"
    echo "  concurrent-reconciles: 5"
    echo "  worker-number: 3"
    echo "  kube-api-qps: 20"
    echo "  kube-api-burst: 30"
    echo "  CPU Request: 50m, Limit: 200m"
    echo "  Memory Request: 64Mi, Limit: 256Mi"
elif [ "$NODE_COUNT" -lt 200 ] && [ "$ESTIMATED_RESOURCES" -lt 10000 ]; then
    CONFIG_FILE="values-medium.yaml"
    echo "Cluster Size: MEDIUM (50-200 nodes, 1000-10000 resources)"
    echo "Config File: charts/k8s-cleaner/$CONFIG_FILE"
    echo ""
    echo "Recommended Settings:"
    echo "  concurrent-reconciles: 10"
    echo "  worker-number: 5"
    echo "  kube-api-qps: 40"
    echo "  kube-api-burst: 60"
    echo "  CPU Request: 100m, Limit: 500m"
    echo "  Memory Request: 128Mi, Limit: 512Mi"
elif [ "$NODE_COUNT" -lt 500 ] && [ "$ESTIMATED_RESOURCES" -lt 50000 ]; then
    CONFIG_FILE="values-large.yaml"
    echo "Cluster Size: LARGE (200-500 nodes, 10000-50000 resources)"
    echo "Config File: charts/k8s-cleaner/$CONFIG_FILE"
    echo ""
    echo "Recommended Settings:"
    echo "  concurrent-reconciles: 20"
    echo "  worker-number: 10"
    echo "  kube-api-qps: 50"
    echo "  kube-api-burst: 100"
    echo "  CPU Request: 200m, Limit: 1000m"
    echo "  Memory Request: 256Mi, Limit: 1Gi"
else
    CONFIG_FILE="values-xlarge.yaml"
    echo "Cluster Size: EXTRA LARGE (> 500 nodes, > 50000 resources)"
    echo "Config File: charts/k8s-cleaner/$CONFIG_FILE"
    echo ""
    echo "Recommended Settings:"
    echo "  concurrent-reconciles: 50"
    echo "  worker-number: 20"
    echo "  kube-api-qps: 80"
    echo "  kube-api-burst: 150"
    echo "  CPU Request: 500m, Limit: 2000m"
    echo "  Memory Request: 512Mi, Limit: 2Gi"
    echo "  Replicas: 2 (High Availability)"
fi

echo ""
echo "=========================================="
echo "Installation Command"
echo "=========================================="
echo ""
echo "helm install k8s-cleaner ./charts/k8s-cleaner \\"
echo "  -f charts/k8s-cleaner/$CONFIG_FILE \\"
echo "  --namespace projectsveltos \\"
echo "  --create-namespace"
echo ""
echo "Or upgrade existing installation:"
echo ""
echo "helm upgrade k8s-cleaner ./charts/k8s-cleaner \\"
echo "  -f charts/k8s-cleaner/$CONFIG_FILE \\"
echo "  --namespace projectsveltos"
echo ""

