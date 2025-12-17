# ResearchNexus Docker 部署指南

## 📋 目录
1. [项目架构](#项目架构)
2. [前置要求](#前置要求)
3. [快速开始](#快速开始)
4. [详细配置](#详细配置)
5. [生产部署](#生产部署)
6. [故障排查](#故障排查)
7. [性能优化](#性能优化)

## 🏗️ 项目架构

ResearchNexus 是一个纯前端 SPA 应用，采用以下架构：

```
┌─────────────────────────────────────────┐
│         用户浏览器                       │
└────────────────┬────────────────────────┘
                 │ HTTP/HTTPS
┌────────────────▼────────────────────────┐
│      Nginx 反向代理 (可选)               │
│      - SSL/TLS 终止                     │
│      - 静态文件缓存                     │
│      - 安全头配置                       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    ResearchNexus 应用容器                │
│    - Node.js + Serve                    │
│    - 静态文件服务                       │
│    - 端口 3000                          │
└────────────────┬────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────┐
│      外部服务                            │
│    - Supabase (数据库)                  │
│    - Google Gemini API                  │
└─────────────────────────────────────────┘
```

## 📦 前置要求

### 系统要求
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM 最小
- 2GB 磁盘空间

### 账户和密钥
- Supabase 项目（获取 URL 和 Anon Key）
- Google Gemini API Key（可选，用于 AI 功能）

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/flyanima/researchnexus.git
cd researchnexus
```

### 2. 配置环境变量
```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，填入实际值
nano .env
```

必需的环境变量：
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key  # 可选
```

### 3. 构建并启动容器
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f app
```

### 4. 访问应用
- 应用地址：http://localhost:3000
- 健康检查：http://localhost:3000/health

## 🔧 详细配置

### Docker 镜像构建

#### Dockerfile 说明
- **阶段 1 (Builder)**：编译 React 应用
  - 使用 Node.js 20 Alpine
  - 安装依赖并构建
  - 输出到 `dist/` 目录

- **阶段 2 (Runtime)**：运行应用
  - 使用 Node.js 20 Alpine（轻量级）
  - 使用 `serve` 提供静态文件
  - 暴露端口 3000

#### 构建参数
```bash
# 手动构建时传入参数
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-key \
  --build-arg GEMINI_API_KEY=your-key \
  -t researchnexus:latest .
```

### Docker Compose 配置

#### 服务说明

**app 服务**
- 容器名：researchnexus-app
- 端口：3000
- 重启策略：unless-stopped
- 资源限制：1 CPU, 512MB RAM
- 健康检查：每 30 秒检查一次

**nginx 服务**（可选）
- 容器名：researchnexus-nginx
- 端口：80 (HTTP), 443 (HTTPS)
- 功能：反向代理、SSL 终止、缓存
- 依赖：app 服务

#### 环境变量
```yaml
APP_PORT=3000          # 应用端口
NGINX_PORT=80          # HTTP 端口
NGINX_HTTPS_PORT=443   # HTTPS 端口
NODE_ENV=production    # 环境模式
```

### 卷挂载

#### 开发模式（热重载）
```yaml
volumes:
  - .:/app
  - /app/node_modules
```

#### 生产模式（只读）
```yaml
volumes:
  - ./dist:/app/dist:ro
```

## 🌐 生产部署

### 1. 使用 Nginx 反向代理

启用 docker-compose.yml 中的 nginx 服务：

```bash
# 取消注释 nginx 服务
docker-compose up -d
```

### 2. SSL/TLS 配置

#### 使用 Let's Encrypt 证书
```bash
# 生成证书
certbot certonly --standalone -d your-domain.com

# 复制证书到项目
mkdir -p certs
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem certs/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem certs/key.pem
```

#### 在 nginx.conf 中启用 SSL
```nginx
ssl_certificate /etc/nginx/certs/cert.pem;
ssl_certificate_key /etc/nginx/certs/key.pem;
```

### 3. 环境变量管理

#### 使用 .env 文件
```bash
docker-compose --env-file .env.production up -d
```

#### 使用 Docker Secrets（Swarm 模式）
```bash
docker secret create supabase_url -
docker secret create supabase_key -
```

### 4. 监控和日志

#### 查看容器日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app

# 查看最后 100 行
docker-compose logs --tail=100 app
```

#### 日志配置
- 驱动：json-file
- 最大大小：10MB
- 最大文件数：3

#### 健康检查
```bash
# 检查容器状态
docker-compose ps

# 查看健康检查详情
docker inspect researchnexus-app | grep -A 10 Health
```

## 🐛 故障排查

### 问题 1：容器无法启动

**症状**：`docker-compose up` 失败

**解决方案**：
```bash
# 查看详细错误日志
docker-compose logs app

# 检查环境变量
docker-compose config

# 重建镜像
docker-compose build --no-cache
```

### 问题 2：Supabase 连接失败

**症状**：应用加载但无法获取数据

**解决方案**：
```bash
# 验证环境变量
docker-compose exec app env | grep VITE_SUPABASE

# 检查网络连接
docker-compose exec app curl -I https://your-project.supabase.co
```

### 问题 3：端口已被占用

**症状**：`Error: bind: address already in use`

**解决方案**：
```bash
# 更改端口
docker-compose -f docker-compose.yml up -d -e APP_PORT=3001

# 或编辑 .env 文件
APP_PORT=3001
```

### 问题 4：内存不足

**症状**：容器频繁重启

**解决方案**：
```bash
# 增加内存限制
# 编辑 docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

## ⚡ 性能优化

### 1. 镜像优化

#### 减小镜像大小
```dockerfile
# 使用 Alpine 基础镜像
FROM node:20-alpine

# 清理 npm 缓存
RUN npm ci --only=production && npm cache clean --force
```

#### 多阶段构建
- 构建阶段：包含所有开发依赖
- 运行阶段：只包含生产依赖和构建输出

### 2. 缓存优化

#### Docker 层缓存
```dockerfile
# 先复制 package.json（变化频率低）
COPY package*.json ./
RUN npm ci

# 再复制源代码（变化频率高）
COPY . .
```

#### Nginx 缓存
```nginx
# 静态资源缓存 30 天
location ~* \.(js|css|png|jpg)$ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
}
```

### 3. 资源限制

#### CPU 和内存限制
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

### 4. 网络优化

#### Gzip 压缩
```nginx
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript;
```

#### HTTP/2
```nginx
listen 443 ssl http2;
```

## 📊 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 进入容器
docker-compose exec app sh

# 重启服务
docker-compose restart

# 重建镜像
docker-compose build --no-cache

# 清理资源
docker-compose down -v

# 查看镜像大小
docker images researchnexus

# 查看容器资源使用
docker stats researchnexus-app
```

## 🔐 安全建议

1. **环境变量**：不要在 Dockerfile 中硬编码敏感信息
2. **镜像扫描**：使用 `docker scan` 检查漏洞
3. **网络隔离**：使用 Docker 网络隔离容器
4. **只读文件系统**：生产环境使用只读挂载
5. **非 root 用户**：在 Dockerfile 中创建非 root 用户
6. **定期更新**：定期更新基础镜像和依赖

## 📚 相关资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Nginx 文档](https://nginx.org/en/docs/)
- [ResearchNexus README](./README.md)
- [Supabase 文档](https://supabase.com/docs)

