#!/bin/bash
# k8s-cleaner 性能基准测试脚本
# 用于测量和对比不同配置下的性能表现

set -euo pipefail

NAMESPACE="${NAMESPACE:-projectsveltos}"
SERVICE_NAME="${SERVICE_NAME:-k8s-cleaner}"
DURATION="${DURATION:-600}"  # 测试时长（秒），默认10分钟
METRICS_PORT="${METRICS_PORT:-8443}"

echo "=========================================="
echo "k8s-cleaner Performance Benchmark"
echo "=========================================="
echo "Namespace: $NAMESPACE"
echo "Service: $SERVICE_NAME"
echo "Duration: ${DURATION}s"
echo ""

# 检查依赖
command -v kubectl >/dev/null 2>&1 || { echo "kubectl is required but not installed. Aborting." >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq is required but not installed. Aborting." >&2; exit 1; }

# 检查 Pod 是否存在
if ! kubectl get pod -n "$NAMESPACE" -l app.kubernetes.io/name=k8s-cleaner -o name | head -1 >/dev/null 2>&1; then
    echo "Error: k8s-cleaner pod not found in namespace $NAMESPACE"
    exit 1
fi

# 启动端口转发
echo "Starting port-forward..."
kubectl port-forward -n "$NAMESPACE" svc/$SERVICE_NAME $METRICS_PORT:$METRICS_PORT >/dev/null 2>&1 &
PF_PID=$!
trap "kill $PF_PID 2>/dev/null || true" EXIT

# 等待端口就绪
sleep 5

# 获取初始指标
echo "Collecting baseline metrics..."
INITIAL_METRICS=$(curl -s http://localhost:$METRICS_PORT/metrics)

# 提取初始值
get_metric_value() {
    local metric_name=$1
    echo "$INITIAL_METRICS" | grep "^${metric_name}" | awk '{print $2}' | head -1 || echo "0"
}

INITIAL_RUNS=$(get_metric_value "k8s_cleaner_runs_total")
INITIAL_DELETED=$(get_metric_value "k8s_cleaner_deleted_resources_total")
INITIAL_UPDATED=$(get_metric_value "k8s_cleaner_updated_resources_total")
INITIAL_ERRORS=$(get_metric_value "k8s_cleaner_error_resources_total")

echo "Initial values:"
echo "  Runs: $INITIAL_RUNS"
echo "  Deleted: $INITIAL_DELETED"
echo "  Updated: $INITIAL_UPDATED"
echo "  Errors: $INITIAL_ERRORS"
echo ""

# 等待测试时长
echo "Running benchmark for ${DURATION} seconds..."
sleep "$DURATION"

# 获取最终指标
echo "Collecting final metrics..."
FINAL_METRICS=$(curl -s http://localhost:$METRICS_PORT/metrics)

FINAL_RUNS=$(echo "$FINAL_METRICS" | grep "^k8s_cleaner_runs_total" | awk '{print $2}' | head -1 || echo "0")
FINAL_DELETED=$(echo "$FINAL_METRICS" | grep "^k8s_cleaner_deleted_resources_total" | awk '{print $2}' | head -1 || echo "0")
FINAL_UPDATED=$(echo "$FINAL_METRICS" | grep "^k8s_cleaner_updated_resources_total" | awk '{print $2}' | head -1 || echo "0")
FINAL_ERRORS=$(echo "$FINAL_METRICS" | grep "^k8s_cleaner_error_resources_total" | awk '{print $2}' | head -1 || echo "0")

# 计算增量
DELTA_RUNS=$((FINAL_RUNS - INITIAL_RUNS))
DELTA_DELETED=$((FINAL_DELETED - INITIAL_DELETED))
DELTA_UPDATED=$((FINAL_UPDATED - INITIAL_UPDATED))
DELTA_ERRORS=$((FINAL_ERRORS - INITIAL_ERRORS))

# 计算速率
RATE_RUNS=$(echo "scale=2; $DELTA_RUNS / $DURATION" | bc)
RATE_DELETED=$(echo "scale=2; $DELTA_DELETED / $DURATION" | bc)
RATE_UPDATED=$(echo "scale=2; $DELTA_UPDATED / $DURATION" | bc)
ERROR_RATE=$(echo "scale=4; $DELTA_ERRORS / $DELTA_RUNS" | bc || echo "0")

# 获取资源使用情况
echo "Collecting resource usage..."
POD_NAME=$(kubectl get pod -n "$NAMESPACE" -l app.kubernetes.io/name=k8s-cleaner -o jsonpath='{.items[0].metadata.name}')
RESOURCE_USAGE=$(kubectl top pod -n "$NAMESPACE" "$POD_NAME" --no-headers 2>/dev/null || echo "N/A N/A")

# 获取运行耗时分布（如果有）
DURATION_P95=$(echo "$FINAL_METRICS" | grep "k8s_cleaner_run_duration_seconds.*0.95" | awk '{print $2}' | head -1 || echo "N/A")
DURATION_P99=$(echo "$FINAL_METRICS" | grep "k8s_cleaner_run_duration_seconds.*0.99" | awk '{print $2}' | head -1 || echo "N/A")

# 输出结果
echo ""
echo "=========================================="
echo "Benchmark Results"
echo "=========================================="
echo "Duration: ${DURATION}s"
echo ""
echo "Operations:"
echo "  Total Runs: $DELTA_RUNS (Rate: ${RATE_RUNS}/s)"
echo "  Deleted Resources: $DELTA_DELETED (Rate: ${RATE_DELETED}/s)"
echo "  Updated Resources: $DELTA_UPDATED (Rate: ${RATE_UPDATED}/s)"
echo "  Errors: $DELTA_ERRORS (Error Rate: ${ERROR_RATE})"
echo ""
echo "Performance:"
echo "  P95 Duration: ${DURATION_P95}s"
echo "  P99 Duration: ${DURATION_P99}s"
echo ""
echo "Resource Usage:"
echo "  $RESOURCE_USAGE"
echo ""
echo "=========================================="

# 保存详细指标到文件
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="benchmark_${TIMESTAMP}.txt"
echo "$FINAL_METRICS" > "$OUTPUT_FILE"
echo "Detailed metrics saved to: $OUTPUT_FILE"

