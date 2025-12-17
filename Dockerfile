# ResearchNexus Docker 镜像 - 使用预构建的 dist 文件夹
FROM node:20-alpine

WORKDIR /app

# 安装轻量级 HTTP 服务器
RUN npm install -g serve

# 复制预构建的 dist 文件夹
COPY dist ./dist

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# 启动应用
CMD ["serve", "-s", "dist", "-l", "3000"]

