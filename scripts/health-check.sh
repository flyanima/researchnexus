#!/bin/bash

# ResearchNexus Docker 健康检查脚本
# 用法: ./scripts/health-check.sh [options]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
CONTAINER_NAME="researchnexus-app"
HEALTH_CHECK_URL="http://localhost:3000"
TIMEOUT=5
RETRIES=3

# 函数定义
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# 检查容器是否运行
check_container_running() {
    log_info "检查容器运行状态..."
    
    if docker ps | grep -q "$CONTAINER_NAME"; then
        log_success "容器正在运行"
        return 0
    else
        log_error "容器未运行"
        return 1
    fi
}

# 检查容器健康状态
check_container_health() {
    log_info "检查容器健康状态..."
    
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "unknown")
    
    case "$health_status" in
        "healthy")
            log_success "容器健康状态: healthy"
            return 0
            ;;
        "unhealthy")
            log_error "容器健康状态: unhealthy"
            return 1
            ;;
        "starting")
            log_warning "容器健康状态: starting"
            return 0
            ;;
        *)
            log_warning "容器健康状态: unknown"
            return 0
            ;;
    esac
}

# 检查应用可访问性
check_app_accessibility() {
    log_info "检查应用可访问性..."
    
    local attempt=1
    while [ $attempt -le $RETRIES ]; do
        if curl -s -f -m $TIMEOUT "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            log_success "应用可访问 ($HEALTH_CHECK_URL)"
            return 0
        fi
        
        log_warning "尝试 $attempt/$RETRIES 失败，重试中..."
        attempt=$((attempt + 1))
        sleep 2
    done
    
    log_error "应用无法访问"
    return 1
}

# 检查资源使用
check_resource_usage() {
    log_info "检查资源使用..."
    
    local stats=$(docker stats --no-stream "$CONTAINER_NAME" 2>/dev/null)
    
    if [ -z "$stats" ]; then
        log_error "无法获取资源统计"
        return 1
    fi
    
    echo "$stats" | tail -1 | awk '{
        printf "  CPU: %s\n", $3
        printf "  内存: %s\n", $4
    }'
    
    log_success "资源使用正常"
    return 0
}

# 检查日志错误
check_logs() {
    log_info "检查容器日志..."
    
    local error_count=$(docker logs "$CONTAINER_NAME" 2>&1 | grep -i "error" | wc -l)
    
    if [ $error_count -gt 0 ]; then
        log_warning "发现 $error_count 条错误日志"
        echo "最近的错误:"
        docker logs "$CONTAINER_NAME" 2>&1 | grep -i "error" | tail -5
        return 1
    else
        log_success "日志检查通过"
        return 0
    fi
}

# 检查网络连接
check_network() {
    log_info "检查网络连接..."
    
    if docker exec "$CONTAINER_NAME" curl -s -f -m $TIMEOUT "https://www.google.com" > /dev/null 2>&1; then
        log_success "网络连接正常"
        return 0
    else
        log_warning "网络连接可能有问题"
        return 1
    fi
}

# 检查 Supabase 连接
check_supabase_connection() {
    log_info "检查 Supabase 连接..."
    
    local supabase_url=$(docker exec "$CONTAINER_NAME" env | grep VITE_SUPABASE_URL | cut -d= -f2)
    
    if [ -z "$supabase_url" ]; then
        log_error "VITE_SUPABASE_URL 未设置"
        return 1
    fi
    
    if docker exec "$CONTAINER_NAME" curl -s -f -m $TIMEOUT "$supabase_url" > /dev/null 2>&1; then
        log_success "Supabase 连接正常"
        return 0
    else
        log_error "Supabase 连接失败"
        return 1
    fi
}

# 生成健康检查报告
generate_report() {
    log_info "生成健康检查报告..."
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local report_file="health-check-report-$(date '+%Y%m%d-%H%M%S').txt"
    
    {
        echo "ResearchNexus 健康检查报告"
        echo "======================================"
        echo "时间: $timestamp"
        echo ""
        echo "容器信息:"
        docker inspect "$CONTAINER_NAME" | grep -E '"Id"|"Name"|"State"' | head -5
        echo ""
        echo "资源使用:"
        docker stats --no-stream "$CONTAINER_NAME" | tail -1
        echo ""
        echo "最近日志:"
        docker logs --tail 20 "$CONTAINER_NAME"
    } > "$report_file"
    
    log_success "报告已保存: $report_file"
}

# 显示帮助信息
show_help() {
    cat << EOF
ResearchNexus Docker 健康检查脚本

用法: $0 [选项]

选项:
    -c, --container NAME    容器名称 (默认: researchnexus-app)
    -u, --url URL          健康检查 URL (默认: http://localhost:3000)
    -t, --timeout SECONDS  超时时间 (默认: 5)
    -r, --retries COUNT    重试次数 (默认: 3)
    -f, --full             执行完整检查
    -r, --report           生成检查报告
    -h, --help             显示此帮助信息

示例:
    $0                      # 基本检查
    $0 --full              # 完整检查
    $0 --report            # 生成报告

EOF
}

# 基本检查
basic_check() {
    local failed=0
    
    check_container_running || failed=$((failed + 1))
    check_container_health || failed=$((failed + 1))
    check_app_accessibility || failed=$((failed + 1))
    
    return $failed
}

# 完整检查
full_check() {
    local failed=0
    
    check_container_running || failed=$((failed + 1))
    check_container_health || failed=$((failed + 1))
    check_app_accessibility || failed=$((failed + 1))
    check_resource_usage || failed=$((failed + 1))
    check_logs || failed=$((failed + 1))
    check_network || failed=$((failed + 1))
    check_supabase_connection || failed=$((failed + 1))
    
    return $failed
}

# 主程序
main() {
    local full_check_flag=false
    local report_flag=false
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--container)
                CONTAINER_NAME="$2"
                shift 2
                ;;
            -u|--url)
                HEALTH_CHECK_URL="$2"
                shift 2
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            -r|--retries)
                RETRIES="$2"
                shift 2
                ;;
            -f|--full)
                full_check_flag=true
                shift
                ;;
            --report)
                report_flag=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo ""
    log_info "开始 ResearchNexus 健康检查..."
    echo ""
    
    if [ "$full_check_flag" = true ]; then
        full_check
    else
        basic_check
    fi
    
    local result=$?
    
    echo ""
    if [ $result -eq 0 ]; then
        log_success "所有检查通过！"
    else
        log_error "检查失败，请查看上面的错误信息"
    fi
    
    if [ "$report_flag" = true ]; then
        echo ""
        generate_report
    fi
    
    return $result
}

# 执行主程序
main "$@"

