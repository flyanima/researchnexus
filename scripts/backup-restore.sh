#!/bin/bash

# ResearchNexus Docker 备份和恢复脚本
# 用法: ./scripts/backup-restore.sh [backup|restore] [options]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
BACKUP_DIR="./backups"
CONTAINER_NAME="researchnexus-app"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')

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

# 创建备份目录
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        log_success "备份目录已创建: $BACKUP_DIR"
    fi
}

# 备份容器配置
backup_container_config() {
    log_info "备份容器配置..."
    
    local config_file="$BACKUP_DIR/container-config-$TIMESTAMP.json"
    docker inspect "$CONTAINER_NAME" > "$config_file"
    
    log_success "容器配置已备份: $config_file"
}

# 备份环境变量
backup_env_files() {
    log_info "备份环境变量文件..."
    
    for env_file in .env .env.development .env.staging .env.production; do
        if [ -f "$env_file" ]; then
            cp "$env_file" "$BACKUP_DIR/${env_file}-$TIMESTAMP"
            log_success "已备份: $env_file"
        fi
    done
}

# 备份 Docker 镜像
backup_docker_image() {
    log_info "备份 Docker 镜像..."
    
    local image_file="$BACKUP_DIR/researchnexus-image-$TIMESTAMP.tar"
    
    if docker images | grep -q "researchnexus"; then
        docker save researchnexus:latest -o "$image_file"
        log_success "Docker 镜像已备份: $image_file"
        
        # 压缩镜像
        gzip "$image_file"
        log_success "镜像已压缩: ${image_file}.gz"
    else
        log_warning "未找到 researchnexus 镜像"
    fi
}

# 备份卷数据
backup_volumes() {
    log_info "备份卷数据..."
    
    local volumes=$(docker inspect "$CONTAINER_NAME" | grep -A 10 "Mounts" | grep "Source" | awk -F'"' '{print $4}')
    
    if [ -z "$volumes" ]; then
        log_warning "未找到挂载的卷"
        return
    fi
    
    for volume in $volumes; do
        if [ -d "$volume" ]; then
            local volume_name=$(basename "$volume")
            local backup_file="$BACKUP_DIR/volume-${volume_name}-$TIMESTAMP.tar.gz"
            
            tar -czf "$backup_file" -C "$(dirname "$volume")" "$(basename "$volume")"
            log_success "卷已备份: $backup_file"
        fi
    done
}

# 备份日志
backup_logs() {
    log_info "备份容器日志..."
    
    local log_file="$BACKUP_DIR/container-logs-$TIMESTAMP.txt"
    docker logs "$CONTAINER_NAME" > "$log_file" 2>&1
    
    log_success "日志已备份: $log_file"
}

# 完整备份
full_backup() {
    log_info "开始完整备份..."
    echo ""
    
    create_backup_dir
    backup_container_config
    backup_env_files
    backup_docker_image
    backup_volumes
    backup_logs
    
    # 创建备份清单
    local manifest_file="$BACKUP_DIR/backup-manifest-$TIMESTAMP.txt"
    {
        echo "ResearchNexus 备份清单"
        echo "======================================"
        echo "备份时间: $(date)"
        echo "容器名称: $CONTAINER_NAME"
        echo ""
        echo "备份文件:"
        ls -lh "$BACKUP_DIR"/*-$TIMESTAMP* 2>/dev/null || echo "无备份文件"
    } > "$manifest_file"
    
    log_success "备份清单已创建: $manifest_file"
    echo ""
    log_success "完整备份完成！"
}

# 恢复环境变量
restore_env_files() {
    log_info "恢复环境变量文件..."
    
    local env_backup="$1"
    
    if [ ! -f "$env_backup" ]; then
        log_error "备份文件不存在: $env_backup"
        return 1
    fi
    
    local env_name=$(basename "$env_backup" | sed "s/-[0-9]*-[0-9]*//")
    cp "$env_backup" "$env_name"
    
    log_success "已恢复: $env_name"
}

# 恢复 Docker 镜像
restore_docker_image() {
    log_info "恢复 Docker 镜像..."
    
    local image_file="$1"
    
    if [ ! -f "$image_file" ]; then
        log_error "镜像文件不存在: $image_file"
        return 1
    fi
    
    # 如果是压缩文件，先解压
    if [[ "$image_file" == *.gz ]]; then
        gunzip -c "$image_file" | docker load
    else
        docker load -i "$image_file"
    fi
    
    log_success "Docker 镜像已恢复"
}

# 恢复卷数据
restore_volumes() {
    log_info "恢复卷数据..."
    
    local volume_backup="$1"
    
    if [ ! -f "$volume_backup" ]; then
        log_error "卷备份文件不存在: $volume_backup"
        return 1
    fi
    
    # 提取卷名
    local volume_name=$(basename "$volume_backup" | sed 's/volume-//;s/-[0-9]*-[0-9]*.tar.gz//')
    
    # 恢复到原位置
    tar -xzf "$volume_backup" -C /
    
    log_success "卷已恢复: $volume_name"
}

# 显示备份列表
list_backups() {
    log_info "可用的备份:"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_warning "备份目录不存在"
        return
    fi
    
    ls -lh "$BACKUP_DIR" | tail -n +2 || log_warning "没有备份文件"
}

# 清理旧备份
cleanup_old_backups() {
    log_info "清理旧备份..."
    
    local retention_days="${1:-30}"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_warning "备份目录不存在"
        return
    fi
    
    find "$BACKUP_DIR" -type f -mtime +$retention_days -delete
    
    log_success "已删除 $retention_days 天前的备份"
}

# 显示帮助信息
show_help() {
    cat << EOF
ResearchNexus Docker 备份和恢复脚本

用法: $0 [命令] [选项]

命令:
    backup              执行完整备份
    backup-config       仅备份容器配置
    backup-env          仅备份环境变量
    backup-image        仅备份 Docker 镜像
    backup-volumes      仅备份卷数据
    backup-logs         仅备份日志
    
    restore-env FILE    恢复环境变量
    restore-image FILE  恢复 Docker 镜像
    restore-volumes FILE 恢复卷数据
    
    list                列出所有备份
    cleanup [DAYS]      清理旧备份 (默认 30 天)
    
    help                显示此帮助信息

示例:
    $0 backup                          # 完整备份
    $0 backup-image                    # 仅备份镜像
    $0 restore-env backups/.env-*      # 恢复环境变量
    $0 list                            # 列出备份
    $0 cleanup 7                       # 清理 7 天前的备份

EOF
}

# 主程序
main() {
    local command="${1:-help}"
    
    case "$command" in
        backup)
            full_backup
            ;;
        backup-config)
            create_backup_dir
            backup_container_config
            ;;
        backup-env)
            create_backup_dir
            backup_env_files
            ;;
        backup-image)
            create_backup_dir
            backup_docker_image
            ;;
        backup-volumes)
            create_backup_dir
            backup_volumes
            ;;
        backup-logs)
            create_backup_dir
            backup_logs
            ;;
        restore-env)
            restore_env_files "$2"
            ;;
        restore-image)
            restore_docker_image "$2"
            ;;
        restore-volumes)
            restore_volumes "$2"
            ;;
        list)
            list_backups
            ;;
        cleanup)
            cleanup_old_backups "$2"
            ;;
        help)
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 执行主程序
main "$@"

