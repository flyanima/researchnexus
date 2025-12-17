.PHONY: help build up down logs restart clean test health

# 默认目标
.DEFAULT_GOAL := help

# 颜色定义
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## 显示帮助信息
	@echo "$(BLUE)ResearchNexus Docker 命令$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

build: ## 构建 Docker 镜像
	@echo "$(BLUE)构建镜像...$(NC)"
	docker-compose build

build-no-cache: ## 不使用缓存构建镜像
	@echo "$(BLUE)不使用缓存构建镜像...$(NC)"
	docker-compose build --no-cache

up: ## 启动所有服务
	@echo "$(BLUE)启动服务...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ 服务已启动$(NC)"
	@echo "应用地址: http://localhost:3000"

down: ## 停止并删除容器
	@echo "$(BLUE)停止服务...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ 服务已停止$(NC)"

restart: ## 重启所有服务
	@echo "$(BLUE)重启服务...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ 服务已重启$(NC)"

logs: ## 查看应用日志
	docker-compose logs -f app

logs-nginx: ## 查看 Nginx 日志
	docker-compose logs -f nginx

logs-all: ## 查看所有服务日志
	docker-compose logs -f

ps: ## 查看容器状态
	@echo "$(BLUE)容器状态:$(NC)"
	docker-compose ps

shell: ## 进入应用容器
	docker-compose exec app sh

shell-nginx: ## 进入 Nginx 容器
	docker-compose exec nginx sh

health: ## 检查服务健康状态
	@echo "$(BLUE)检查健康状态...$(NC)"
	@docker-compose exec app wget --quiet --tries=1 --spider http://localhost:3000/ && echo "$(GREEN)✓ 应用健康$(NC)" || echo "$(RED)✗ 应用不健康$(NC)"

stats: ## 查看容器资源使用
	docker stats researchnexus-app

clean: ## 清理所有 Docker 资源
	@echo "$(RED)清理资源...$(NC)"
	docker-compose down -v
	docker system prune -f
	@echo "$(GREEN)✓ 清理完成$(NC)"

prod-up: ## 启动生产环境
	@echo "$(BLUE)启动生产环境...$(NC)"
	docker-compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ 生产环境已启动$(NC)"

prod-down: ## 停止生产环境
	@echo "$(BLUE)停止生产环境...$(NC)"
	docker-compose -f docker-compose.prod.yml down
	@echo "$(GREEN)✓ 生产环境已停止$(NC)"

prod-logs: ## 查看生产环境日志
	docker-compose -f docker-compose.prod.yml logs -f

test: ## 运行测试
	@echo "$(BLUE)运行测试...$(NC)"
	docker-compose exec app npm test

lint: ## 运行代码检查
	@echo "$(BLUE)运行代码检查...$(NC)"
	docker-compose exec app npm run lint

build-prod: ## 构建生产镜像
	@echo "$(BLUE)构建生产镜像...$(NC)"
	docker build \
		--build-arg VITE_SUPABASE_URL=$(VITE_SUPABASE_URL) \
		--build-arg VITE_SUPABASE_ANON_KEY=$(VITE_SUPABASE_ANON_KEY) \
		--build-arg GEMINI_API_KEY=$(GEMINI_API_KEY) \
		-t researchnexus:latest .

push: ## 推送镜像到仓库
	@echo "$(BLUE)推送镜像...$(NC)"
	docker tag researchnexus:latest $(REGISTRY)/researchnexus:latest
	docker push $(REGISTRY)/researchnexus:latest

env-setup: ## 设置环境变量
	@echo "$(BLUE)创建 .env 文件...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)✓ .env 文件已创建$(NC)"; \
		echo "请编辑 .env 文件并填入实际值"; \
	else \
		echo "$(RED)✗ .env 文件已存在$(NC)"; \
	fi

info: ## 显示项目信息
	@echo "$(BLUE)ResearchNexus 项目信息$(NC)"
	@echo ""
	@echo "项目名称: ResearchNexus"
	@echo "技术栈: React 19 + TypeScript + Vite"
	@echo "容器化: Docker + Docker Compose"
	@echo ""
	@echo "镜像信息:"
	@docker images researchnexus 2>/dev/null || echo "  未构建"
	@echo ""
	@echo "容器状态:"
	@docker-compose ps 2>/dev/null || echo "  未启动"

version: ## 显示版本信息
	@echo "Docker 版本:"
	@docker --version
	@echo "Docker Compose 版本:"
	@docker-compose --version

