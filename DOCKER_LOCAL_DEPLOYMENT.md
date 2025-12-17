# ResearchNexus Docker 本地部署指南

## 🚀 快速开始（5 分钟）

### 前置要求
- ✅ Docker Desktop 已安装（版本 28.5.1+）
- ✅ docker-compose 已安装（版本 2.40.2+）
- ✅ Supabase 账户和项目已创建
- ✅ 项目代码已克隆

### 第 1 步：配置环境变量

```bash
# 复制环境配置文件
cp .env.example .env

# 编辑 .env 文件，填入 Supabase 凭证
nano .env
```

**需要填入的信息：**
```env
# Supabase 配置（必需）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gemini API Key（可选，用于 AI 摘要功能）
GEMINI_API_KEY=your-gemini-key
```

**获取 Supabase 凭证步骤：**
1. 访问 https://app.supabase.com
2. 选择你的项目
3. 点击左侧菜单 "Settings" → "API"
4. 复制 "Project URL" 和 "anon public" 密钥

### 第 2 步：构建 Docker 镜像

```bash
# 构建镜像（首次需要 2-3 分钟）
docker-compose build

# 或使用 Makefile
make build
```

### 第 3 步：启动容器

```bash
# 启动应用
docker-compose up -d

# 或使用 Makefile
make up
```

### 第 4 步：验证应用

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 访问应用
# 打开浏览器访问 http://localhost:3000
```

---

## 📊 常用命令

### 基础命令
```bash
make up              # 启动应用
make down            # 停止应用
make logs            # 查看日志
make shell           # 进入容器
make clean           # 清理容器和镜像
```

### 调试命令
```bash
make health          # 健康检查
make stats           # 查看容器统计
make ps              # 查看容器状态
make restart         # 重启容器
```

### 生产命令
```bash
make prod-build      # 生产环境构建
make prod-up         # 启动生产环境
make prod-down       # 停止生产环境
```

---

## 🔍 故障排查

### 问题 1：端口已被占用
```bash
# 查看占用端口的进程
lsof -i :3000

# 修改 .env 中的 APP_PORT
APP_PORT=3001
```

### 问题 2：Supabase 连接失败
```bash
# 检查环境变量
docker-compose config | grep VITE_SUPABASE

# 查看详细错误日志
docker-compose logs app
```

### 问题 3：构建失败
```bash
# 清理并重新构建
docker-compose down
docker system prune -a
docker-compose build --no-cache
```

---

## 📚 更多文档

- [快速开始指南](./DOCKER_QUICK_START.md)
- [详细部署指南](./DOCKER_DEPLOYMENT.md)
- [架构设计文档](./DOCKER_ARCHITECTURE.md)
- [Supabase 设置指南](./SUPABASE_SETUP.md)

---

## ✅ 部署检查清单

- [ ] Docker 和 docker-compose 已安装
- [ ] .env 文件已配置
- [ ] Supabase 项目已创建
- [ ] 数据库表已创建
- [ ] Storage bucket 已创建
- [ ] 镜像已构建
- [ ] 容器已启动
- [ ] 应用可访问（http://localhost:3000）
- [ ] 没有错误日志

---

**现在开始部署吧！** 🎉

```bash
make up
```

