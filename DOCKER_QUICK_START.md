# ResearchNexus Docker 快速开始指南

## ⚡ 5 分钟快速启动

### 1️⃣ 准备环境变量
```bash
# 创建 .env 文件
cat > .env << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-key-here
APP_PORT=3000
EOF
```

### 2️⃣ 启动应用
```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f app
```

### 3️⃣ 访问应用
打开浏览器访问：**http://localhost:3000**

---

## 📋 常用命令速查表

| 命令 | 说明 |
|------|------|
| `docker-compose up -d` | 启动所有服务 |
| `docker-compose down` | 停止并删除容器 |
| `docker-compose ps` | 查看容器状态 |
| `docker-compose logs -f app` | 查看应用日志 |
| `docker-compose exec app sh` | 进入应用容器 |
| `docker-compose restart` | 重启所有服务 |
| `docker-compose build --no-cache` | 重新构建镜像 |

---

## 🔧 常见配置

### 修改端口
编辑 `.env` 文件：
```env
APP_PORT=8080
NGINX_PORT=8000
```

### 启用 Nginx 反向代理
```bash
# 取消注释 docker-compose.yml 中的 nginx 服务
docker-compose up -d
```

### 使用生产配置
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🐛 快速故障排查

### 容器无法启动
```bash
# 查看错误日志
docker-compose logs app

# 重新构建
docker-compose build --no-cache
docker-compose up -d
```

### 无法连接到 Supabase
```bash
# 验证环境变量
docker-compose exec app env | grep VITE_SUPABASE

# 测试网络连接
docker-compose exec app curl -I https://your-project.supabase.co
```

### 端口被占用
```bash
# 查看占用端口的进程
lsof -i :3000

# 或修改 .env 中的 APP_PORT
```

---

## 📦 镜像信息

- **基础镜像**：node:20-alpine
- **镜像大小**：~200MB
- **构建时间**：~2-3 分钟
- **运行时内存**：~100-150MB

---

## 🌐 网络配置

### 容器间通信
- 应用容器：`app:3000`
- Nginx 容器：`nginx:80/443`
- 网络名称：`researchnexus-network`

### 外部访问
- HTTP：`http://localhost:3000`
- HTTPS：`https://localhost:443`（需配置证书）

---

## 📊 监控命令

```bash
# 查看容器资源使用
docker stats researchnexus-app

# 查看镜像大小
docker images researchnexus

# 查看容器详细信息
docker inspect researchnexus-app

# 查看健康检查状态
docker inspect researchnexus-app | grep -A 10 Health
```

---

## 🔐 安全检查清单

- [ ] 环境变量已配置
- [ ] Supabase 密钥正确
- [ ] 防火墙规则已配置
- [ ] SSL 证书已准备（生产环境）
- [ ] 日志级别已设置
- [ ] 资源限制已配置

---

## 📚 更多信息

详细文档请参考：[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

---

## 💡 提示

- 首次构建可能需要 2-3 分钟
- 确保 Docker 和 Docker Compose 已安装
- 建议使用 Docker Desktop 或 Docker Engine 20.10+
- 生产环境建议使用 `docker-compose.prod.yml`

