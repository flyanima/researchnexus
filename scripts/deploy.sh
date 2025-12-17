#!/bin/bash

# ResearchNexus Docker 部署脚本
# 用法: ./scripts/deploy.sh [dev|prod]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数定义
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 检查前置条件
check_requirements() {
    log_info "检查前置条件..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装"
        exit 1
    fi
    
    log_success "前置条件检查通过"
}

# 检查环境变量
check_env() {
    log_info "检查环境变量..."
    
    if [ ! -f .env ]; then
        log_error ".env 文件不存在"
        log_info "请复制 .env.example 为 .env 并填入实际值"
        exit 1
    fi
    
    # 检查必需的环境变量
    source .env
    
    if [ -z "$VITE_SUPABASE_URL" ]; then
        log_error "VITE_SUPABASE_URL 未设置"
        exit 1
    fi
    
    if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
        log_error "VITE_SUPABASE_ANON_KEY 未设置"
        exit 1
    fi
    
    log_success "环境变量检查通过"
}

# 构建镜像
build_image() {
    log_info "构建 Docker 镜像..."
    docker-compose build
    log_success "镜像构建完成"
}

# 启动开发环境
deploy_dev() {
    log_info "启动开发环境..."
    
    check_requirements
    check_env
    build_image
    
    log_info "启动容器..."
    docker-compose up -d
    
    log_success "开发环境已启动"
    log_info "应用地址: http://localhost:3000"
    log_info "查看日志: docker-compose logs -f app"
}

# 启动生产环境
deploy_prod() {
    log_info "启动生产环境..."
    
    check_requirements
    check_env
    
    # 检查 SSL 证书
    if [ ! -f certs/cert.pem ] || [ ! -f certs/key.pem ]; then
        log_warning "SSL 证书未找到"
        log_info "请将证书放在 certs/ 目录下"
        log_info "或在 nginx.conf 中注释掉 SSL 配置"
    fi
    
    build_image
    
    log_info "启动生产环境容器..."
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "生产环境已启动"
    log_info "应用地址: https://your-domain.com"
    log_info "查看日志: docker-compose -f docker-compose.prod.yml logs -f"
}

# 停止服务
stop_services() {
    log_info "停止服务..."
    docker-compose down
    log_success "服务已停止"
}

# 清理资源
cleanup() {
    log_info "清理资源..."
    docker-compose down -v
    docker system prune -f
    log_success "资源已清理"
}

# 显示帮助信息
show_help() {
    cat << EOF
ResearchNexus Docker 部署脚本

用法: $0 [命令]

命令:
    dev         启动开发环境
    prod        启动生产环境
    stop        停止服务
    clean       清理所有资源
    help        显示此帮助信息

示例:
    $0 dev      # 启动开发环境
    $0 prod     # 启动生产环境
    $0 stop     # 停止服务

EOF
}

# 主程序
main() {
    case "${1:-help}" in
        dev)
            deploy_dev
            ;;
        prod)
            deploy_prod
            ;;
        stop)
            stop_services
            ;;
        clean)
            cleanup
            ;;
        help)
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主程序
main "$@"

