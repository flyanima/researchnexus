# ResearchNexus Docker 镜像 - 多阶段构建
# 阶段 1: 构建
FROM node:20-alpine AS builder

WORKDIR /app

# 接收构建参数
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG GEMINI_API_KEY

# 设置环境变量
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# 复制 package 文件
COPY package*.json ./

# 安装依赖（包括开发依赖，用于构建）
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 阶段 2: 运行时
FROM node:20-alpine

WORKDIR /app

# 安装轻量级 HTTP 服务器
RUN npm install -g serve

# 从构建阶段复制 dist 文件夹
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# 启动应用
CMD ["serve", "-s", "dist", "-l", "3000"]

