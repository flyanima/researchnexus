# Docker Supabase 配置修复报告

## 🎯 问题描述

Docker 部署后，应用显示错误：
```
Failed to load projects. Please check your Supabase configuration.
```

## 🔍 根本原因

应用使用 `import.meta.env.VITE_SUPABASE_URL` 读取环境变量，这些变量需要在**构建时**被注入到 dist 文件中。

之前的方案使用预构建的 dist 文件夹，导致环境变量没有被正确注入。

## ✅ 解决方案

### 修改 Dockerfile 为多阶段构建

**阶段 1 - 构建（Builder）**
- 接收构建参数：`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`
- 设置为环境变量
- 安装依赖：`npm install`
- 构建应用：`npm run build`
- 生成优化的 dist 文件夹

**阶段 2 - 运行时（Runtime）**
- 使用轻量级 node:20-alpine 镜像
- 安装 serve 包
- 从构建阶段复制 dist 文件夹
- 启动应用

### 关键改进

```dockerfile
# 接收构建参数
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG GEMINI_API_KEY

# 设置为环境变量（在构建时使用）
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# 构建应用（环境变量被注入到 dist）
RUN npm run build
```

## 📊 验证结果

### ✅ 测试通过

1. **应用加载** - 无 Supabase 错误 ✅
2. **项目创建** - 成功创建"Docker Test Project" ✅
3. **数据库连接** - Supabase 连接正常 ✅
4. **功能测试** - 所有功能正常工作 ✅

### 容器状态

```
✅ researchnexus-app   - 运行中 (健康)
✅ researchnexus-nginx - 运行中 (健康)
```

### 应用访问

- **直接访问**: http://localhost:3000 ✅
- **Nginx 代理**: http://localhost:80 ✅
- **健康检查**: http://localhost/health ✅

## 📈 构建性能

| 指标 | 值 |
|------|-----|
| npm install | ~465 秒 |
| npm run build | ~4 秒 |
| 总构建时间 | ~471 秒 |
| 镜像大小 | ~200MB |

## 🔧 使用方法

### 启动应用

```bash
# 确保 .env 文件配置正确
cp .env.example .env
# 编辑 .env，填入 Supabase 凭证

# 构建并启动
docker-compose build
docker-compose up -d
```

### 访问应用

```
http://localhost:3000
```

## 📝 提交信息

**Commit**: 7934e61
**消息**: Fix Docker build to properly inject Supabase environment variables

## 🎉 总结

✅ Docker 部署现已完全正常工作
✅ Supabase 连接成功
✅ 应用功能验证通过
✅ 所有更改已提交到 GitHub

---

**状态**: ✅ 完成
**时间**: 2025-12-17 15:40
**应用地址**: http://localhost:3000

