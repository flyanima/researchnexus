#!/bin/bash

# ResearchNexus Docker 性能测试脚本
# 用法: ./scripts/performance-test.sh [options]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
APP_URL="http://localhost:3000"
CONTAINER_NAME="researchnexus-app"
DURATION=60
CONCURRENCY=10
REQUESTS=1000

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

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v ab &> /dev/null; then
        log_error "Apache Bench (ab) 未安装"
        echo "安装方法:"
        echo "  Ubuntu/Debian: sudo apt-get install apache2-utils"
        echo "  macOS: brew install httpd"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 检查容器状态
check_container() {
    log_info "检查容器状态..."
    
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        log_error "容器未运行"
        exit 1
    fi
    
    log_success "容器正在运行"
}

# 检查应用可访问性
check_app_accessibility() {
    log_info "检查应用可访问性..."
    
    if ! curl -s -f "$APP_URL" > /dev/null; then
        log_error "应用无法访问"
        exit 1
    fi
    
    log_success "应用可访问"
}

# 基准测试
benchmark_test() {
    log_info "运行基准测试..."
    echo "  URL: $APP_URL"
    echo "  并发数: $CONCURRENCY"
    echo "  请求数: $REQUESTS"
    echo ""
    
    local report_file="benchmark-$(date '+%Y%m%d-%H%M%S').txt"
    
    ab -n $REQUESTS -c $CONCURRENCY -t $DURATION "$APP_URL/" | tee "$report_file"
    
    log_success "基准测试完成，报告已保存: $report_file"
}

# 负载测试
load_test() {
    log_info "运行负载测试..."
    echo "  URL: $APP_URL"
    echo "  持续时间: $DURATION 秒"
    echo "  并发数: $CONCURRENCY"
    echo ""
    
    local report_file="load-test-$(date '+%Y%m%d-%H%M%S').txt"
    
    ab -t $DURATION -c $CONCURRENCY "$APP_URL/" | tee "$report_file"
    
    log_success "负载测试完成，报告已保存: $report_file"
}

# 压力测试
stress_test() {
    log_info "运行压力测试..."
    echo "  URL: $APP_URL"
    echo "  并发数: $CONCURRENCY (逐步增加)"
    echo ""
    
    local report_file="stress-test-$(date '+%Y%m%d-%H%M%S').txt"
    
    {
        echo "ResearchNexus 压力测试报告"
        echo "======================================"
        echo "时间: $(date)"
        echo "URL: $APP_URL"
        echo ""
        
        for concurrency in 5 10 20 50 100; do
            echo "并发数: $concurrency"
            ab -n 100 -c $concurrency "$APP_URL/" 2>&1 | grep -E "Requests per second|Time per request|Failed requests"
            echo ""
        done
    } | tee "$report_file"
    
    log_success "压力测试完成，报告已保存: $report_file"
}

# 资源监控
monitor_resources() {
    log_info "监控资源使用..."
    echo "  持续时间: $DURATION 秒"
    echo ""
    
    local report_file="resource-monitor-$(date '+%Y%m%d-%H%M%S').txt"
    
    {
        echo "ResearchNexus 资源监控报告"
        echo "======================================"
        echo "时间: $(date)"
        echo ""
        
        for i in $(seq 1 $DURATION); do
            echo "时间戳: $(date '+%H:%M:%S')"
            docker stats --no-stream "$CONTAINER_NAME" | tail -1
            sleep 1
        done
    } | tee "$report_file"
    
    log_success "资源监控完成，报告已保存: $report_file"
}

# 内存泄漏测试
memory_leak_test() {
    log_info "运行内存泄漏测试..."
    echo "  持续时间: $DURATION 秒"
    echo ""
    
    local report_file="memory-leak-$(date '+%Y%m%d-%H%M%S').txt"
    
    {
        echo "ResearchNexus 内存泄漏测试报告"
        echo "======================================"
        echo "时间: $(date)"
        echo ""
        
        # 获取初始内存
        local initial_memory=$(docker stats --no-stream "$CONTAINER_NAME" | tail -1 | awk '{print $4}')
        echo "初始内存: $initial_memory"
        echo ""
        
        # 持续发送请求
        for i in $(seq 1 $DURATION); do
            curl -s "$APP_URL/" > /dev/null &
            
            if [ $((i % 10)) -eq 0 ]; then
                echo "第 $i 秒 - 内存使用:"
                docker stats --no-stream "$CONTAINER_NAME" | tail -1 | awk '{print $4}'
            fi
            
            sleep 1
        done
        
        # 获取最终内存
        local final_memory=$(docker stats --no-stream "$CONTAINER_NAME" | tail -1 | awk '{print $4}')
        echo ""
        echo "最终内存: $final_memory"
        
        # 等待后台任务完成
        wait
    } | tee "$report_file"
    
    log_success "内存泄漏测试完成，报告已保存: $report_file"
}

# 显示帮助信息
show_help() {
    cat << EOF
ResearchNexus Docker 性能测试脚本

用法: $0 [选项]

选项:
    -u, --url URL              应用 URL (默认: http://localhost:3000)
    -c, --container NAME       容器名称 (默认: researchnexus-app)
    -d, --duration SECONDS     测试持续时间 (默认: 60)
    -n, --requests COUNT       请求数 (默认: 1000)
    -p, --concurrency COUNT    并发数 (默认: 10)
    
测试类型:
    -b, --benchmark            运行基准测试
    -l, --load                 运行负载测试
    -s, --stress               运行压力测试
    -m, --monitor              监控资源使用
    -M, --memory-leak          运行内存泄漏测试
    -a, --all                  运行所有测试
    
其他:
    -h, --help                 显示此帮助信息

示例:
    $0 --benchmark             # 基准测试
    $0 --load --duration 120   # 120 秒负载测试
    $0 --all                   # 运行所有测试

EOF
}

# 主程序
main() {
    local test_type=""
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -u|--url)
                APP_URL="$2"
                shift 2
                ;;
            -c|--container)
                CONTAINER_NAME="$2"
                shift 2
                ;;
            -d|--duration)
                DURATION="$2"
                shift 2
                ;;
            -n|--requests)
                REQUESTS="$2"
                shift 2
                ;;
            -p|--concurrency)
                CONCURRENCY="$2"
                shift 2
                ;;
            -b|--benchmark)
                test_type="benchmark"
                shift
                ;;
            -l|--load)
                test_type="load"
                shift
                ;;
            -s|--stress)
                test_type="stress"
                shift
                ;;
            -m|--monitor)
                test_type="monitor"
                shift
                ;;
            -M|--memory-leak)
                test_type="memory_leak"
                shift
                ;;
            -a|--all)
                test_type="all"
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
    log_info "开始 ResearchNexus 性能测试..."
    echo ""
    
    # 前置检查
    check_dependencies
    check_container
    check_app_accessibility
    
    echo ""
    
    # 运行测试
    case "$test_type" in
        benchmark)
            benchmark_test
            ;;
        load)
            load_test
            ;;
        stress)
            stress_test
            ;;
        monitor)
            monitor_resources
            ;;
        memory_leak)
            memory_leak_test
            ;;
        all)
            benchmark_test
            echo ""
            load_test
            echo ""
            stress_test
            echo ""
            monitor_resources
            ;;
        *)
            log_error "未指定测试类型"
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    log_success "性能测试完成！"
}

# 执行主程序
main "$@"

