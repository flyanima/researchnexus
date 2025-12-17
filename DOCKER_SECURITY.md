# ResearchNexus Docker 安全配置指南

## 🔐 安全最佳实践

### 1. 镜像安全

#### 使用官方基础镜像
```dockerfile
# ✅ 推荐
FROM node:20-alpine

# ❌ 避免
FROM node:latest
FROM ubuntu:latest
```

#### 定期更新基础镜像
```bash
# 检查镜像漏洞
docker scan researchnexus:latest

# 更新基础镜像
docker pull node:20-alpine
docker-compose build --no-cache
```

#### 最小化镜像大小
```dockerfile
# 使用多阶段构建
FROM node:20-alpine AS builder
# ... 构建阶段

FROM node:20-alpine
# ... 运行阶段（仅包含必要文件）
```

### 2. 容器运行安全

#### 以非 root 用户运行
```dockerfile
# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 切换用户
USER nodejs
```

#### 使用只读文件系统
```yaml
# docker-compose.yml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /var/tmp
```

#### 限制容器权限
```yaml
# docker-compose.yml
services:
  app:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    security_opt:
      - no-new-privileges:true
```

### 3. 网络安全

#### 使用专用网络
```yaml
# docker-compose.yml
networks:
  researchnexus-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: br-researchnexus
```

#### 限制端口暴露
```yaml
# docker-compose.yml
services:
  app:
    expose:
      - "3000"  # 仅内部访问
    # 不使用 ports，通过 Nginx 代理
```

#### 配置防火墙规则
```bash
# 仅允许特定 IP 访问
sudo ufw allow from 192.168.1.0/24 to any port 80
sudo ufw allow from 192.168.1.0/24 to any port 443
```

### 4. 环境变量安全

#### 不在 Dockerfile 中硬编码敏感信息
```dockerfile
# ❌ 避免
ENV VITE_SUPABASE_ANON_KEY=secret-key

# ✅ 推荐
# 通过 .env 文件或 Docker Secrets 传入
```

#### 使用 Docker Secrets（Swarm 模式）
```bash
# 创建 secret
echo "your-secret-key" | docker secret create supabase_key -

# 在 docker-compose 中使用
services:
  app:
    secrets:
      - supabase_key
    environment:
      VITE_SUPABASE_ANON_KEY_FILE: /run/secrets/supabase_key
```

#### 使用 .env 文件
```bash
# 设置正确的文件权限
chmod 600 .env
chmod 600 .env.production

# 不要提交到 Git
echo ".env*" >> .gitignore
```

### 5. 日志安全

#### 不记录敏感信息
```bash
# ❌ 避免
echo "API Key: $API_KEY"

# ✅ 推荐
echo "API Key: ****"
```

#### 配置日志轮转
```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### 定期清理日志
```bash
# 清理旧日志
docker system prune --volumes

# 查看日志大小
du -sh /var/lib/docker/containers/*/
```

### 6. SSL/TLS 安全

#### 使用 HTTPS
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    
    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;
    
    # 使用安全的 SSL 协议
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # 使用强加密套件
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
}
```

#### 获取 SSL 证书
```bash
# 使用 Let's Encrypt
certbot certonly --standalone -d your-domain.com

# 复制证书
mkdir -p certs
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem certs/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem certs/key.pem

# 设置权限
chmod 600 certs/key.pem
```

#### 自动更新证书
```bash
# 创建 cron 任务
0 0 1 * * certbot renew --quiet && docker-compose restart nginx
```

### 7. 访问控制

#### 限制 Docker 守护进程访问
```bash
# 仅允许特定用户访问 Docker
sudo usermod -aG docker $USER

# 不要使用 sudo docker
```

#### 配置 Docker 权限
```bash
# 检查 Docker 套接字权限
ls -l /var/run/docker.sock

# 应该是 root:docker 660
```

### 8. 镜像扫描和漏洞检查

#### 使用 Docker Scout
```bash
# 扫描镜像漏洞
docker scout cves researchnexus:latest

# 生成详细报告
docker scout cves researchnexus:latest --format json > report.json
```

#### 使用 Trivy
```bash
# 安装 Trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# 扫描镜像
trivy image researchnexus:latest

# 扫描文件系统
trivy fs .
```

### 9. 运行时安全

#### 启用 AppArmor
```bash
# 创建 AppArmor 配置文件
sudo aa-enforce /etc/apparmor.d/docker-researchnexus

# 在 docker-compose 中使用
services:
  app:
    security_opt:
      - apparmor=docker-researchnexus
```

#### 启用 SELinux
```bash
# 在 docker-compose 中使用
services:
  app:
    security_opt:
      - label=type:svirt_apache_t
```

### 10. 定期安全审计

#### 检查清单
- [ ] 基础镜像已更新
- [ ] 没有已知漏洞
- [ ] 使用非 root 用户
- [ ] 启用了只读文件系统
- [ ] 配置了资源限制
- [ ] 使用了 HTTPS
- [ ] 环境变量已加密
- [ ] 日志已配置
- [ ] 访问控制已配置
- [ ] 定期备份已启用

---

## 🛡️ 安全命令参考

```bash
# 扫描镜像漏洞
docker scan researchnexus:latest

# 检查容器安全配置
docker inspect researchnexus-app | grep -A 20 "SecurityOpt"

# 查看容器权限
docker exec researchnexus-app id

# 检查文件系统权限
docker exec researchnexus-app ls -la /app

# 查看网络配置
docker network inspect researchnexus-network

# 检查日志
docker logs researchnexus-app | grep -i "error\|warning"

# 查看资源限制
docker stats researchnexus-app

# 检查 SSL 证书
openssl x509 -in certs/cert.pem -text -noout
```

---

## 📚 相关资源

- [Docker 安全最佳实践](https://docs.docker.com/engine/security/)
- [OWASP Docker 安全](https://owasp.org/www-project-container-security/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)
- [Trivy 漏洞扫描](https://github.com/aquasecurity/trivy)

