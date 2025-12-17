# 多阶段构建 - ResearchNexus Docker 镜像
# 阶段 1: 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && \
    npm ci --only=development

# 复制源代码
COPY . .

# 构建应用
# 注意：构建时需要环境变量，可通过 --build-arg 传入
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG GEMINI_API_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

RUN npm run build

# 阶段 2: 运行阶段
FROM node:20-alpine

WORKDIR /app

# 安装轻量级 HTTP 服务器
RUN npm install -g serve

# 从构建阶段复制构建输出
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# 启动应用
CMD ["serve", "-s", "dist", "-l", "3000"]

