# Docker 部署指南

本文档介绍如何使用 Docker 部署密码生成器应用。

## 📋 前置要求

- Docker (20.10+)
- Docker Compose (可选，推荐使用)

## 🚀 快速开始

### 方式 1: 使用 Docker Compose（推荐）

```bash
# 1. 构建并启动容器
docker-compose up -d

# 2. 查看日志
docker-compose logs -f

# 3. 访问应用
# 打开浏览器访问 http://localhost:3001
```

### 方式 2: 使用 Docker 命令

```bash
# 1. 构建镜像
docker build -t password-generator:latest .

# 2. 创建数据卷（用于持久化数据库）
docker volume create password-data

# 3. 运行容器
docker run -d \
  --name password-generator \
  -p 3001:3001 \
  -v password-data:/app/data \
  -e NODE_ENV=production \
  --restart unless-stopped \
  password-generator:latest

# 4. 查看日志
docker logs -f password-generator

# 5. 访问应用
# 打开浏览器访问 http://localhost:3001
```

## 📦 镜像特性

- **多阶段构建**: 优化镜像大小
- **基于 Alpine Linux**: 轻量级基础镜像
- **非 root 用户**: 增强安全性
- **健康检查**: 自动监控容器健康状态
- **数据持久化**: 使用 Docker volume 保存数据库

## 🔧 配置选项

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 服务端口 | `3001` |

### 端口映射

默认映射 `3001:3001`，可以修改宿主机端口：

```bash
# 映射到宿主机 8080 端口
docker run -d -p 8080:3001 ...
```

或修改 `docker-compose.yml`:

```yaml
ports:
  - "8080:3001"  # 宿主机:容器
```

## 💾 数据管理

### 备份数据库

```bash
# 使用 Docker Compose
docker-compose exec password-generator tar -czf /tmp/backup.tar.gz /app/data
docker cp password-generator:/tmp/backup.tar.gz ./backup-$(date +%Y%m%d).tar.gz

# 或直接备份 volume
docker run --rm \
  -v password-data:/data \
  -v $(pwd):/backup \
  alpine tar -czf /backup/password-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### 恢复数据库

```bash
# 停止容器
docker-compose down

# 恢复数据
docker run --rm \
  -v password-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar -xzf /backup/password-backup-YYYYMMDD.tar.gz"

# 重启容器
docker-compose up -d
```

### 查看数据卷

```bash
# 列出所有数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect password-data

# 清理未使用的数据卷（谨慎使用）
docker volume prune
```

## 📊 容器管理

### 启动/停止容器

```bash
# Docker Compose
docker-compose start    # 启动
docker-compose stop     # 停止
docker-compose restart  # 重启
docker-compose down     # 停止并删除容器

# Docker 命令
docker start password-generator
docker stop password-generator
docker restart password-generator
docker rm password-generator
```

### 查看日志

```bash
# 实时日志
docker-compose logs -f

# 最近 100 行
docker-compose logs --tail=100

# 仅查看错误日志
docker-compose logs | grep ERROR
```

### 进入容器

```bash
# Docker Compose
docker-compose exec password-generator sh

# Docker 命令
docker exec -it password-generator sh
```

### 查看资源使用

```bash
# 查看容器资源使用情况
docker stats password-generator

# 查看容器详细信息
docker inspect password-generator
```

## 🔍 健康检查

容器内置健康检查，每 30 秒检查一次：

```bash
# 查看健康状态
docker inspect --format='{{.State.Health.Status}}' password-generator

# 查看健康检查日志
docker inspect --format='{{json .State.Health}}' password-generator | jq
```

状态说明：
- `starting`: 启动中
- `healthy`: 健康
- `unhealthy`: 不健康

## 🛠️ 故障排查

### 容器无法启动

```bash
# 查看详细错误信息
docker logs password-generator

# 检查容器状态
docker ps -a | grep password-generator

# 检查端口是否被占用
lsof -i :3001
```

### 数据丢失

确保使用了数据卷：

```bash
# 检查数据卷是否挂载
docker inspect password-generator | grep -A 10 Mounts
```

### 性能问题

```bash
# 查看资源限制
docker stats password-generator

# 增加资源限制（在 docker-compose.yml 中）
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 1G
```

## 📝 更新应用

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose build

# 3. 重启容器（保留数据）
docker-compose up -d

# 4. 清理旧镜像
docker image prune
```

## 🌐 生产环境建议

### 1. 使用反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. 启用 HTTPS

```bash
# 使用 Let's Encrypt
docker run -d \
  --name nginx-proxy \
  -p 80:80 \
  -p 443:443 \
  -v /var/run/docker.sock:/tmp/docker.sock:ro \
  jwilder/nginx-proxy

docker run -d \
  --name letsencrypt \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  jrcs/letsencrypt-nginx-proxy-companion
```

### 3. 定期备份

添加到 crontab：

```bash
# 每天凌晨 2 点备份
0 2 * * * docker run --rm -v password-data:/data -v /backup:/backup alpine tar -czf /backup/password-$(date +\%Y\%m\%d).tar.gz -C /data .
```

### 4. 监控和告警

使用 Prometheus + Grafana 或其他监控方案。

## 🔒 安全建议

1. **定期更新**: 定期更新基础镜像和依赖
2. **限制网络**: 使用 Docker 网络隔离
3. **资源限制**: 设置 CPU 和内存限制
4. **日志管理**: 配置日志轮转
5. **备份加密**: 对备份文件进行加密

## 📚 更多资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Alpine Linux](https://alpinelinux.org/)

## ❓ 常见问题

### Q: 如何修改端口？
A: 修改 `docker-compose.yml` 中的 `ports` 配置或使用 `-p` 参数。

### Q: 数据存储在哪里？
A: 使用 Docker volume `password-data`，通过 `docker volume inspect password-data` 查看路径。

### Q: 如何清空所有数据？
A: 删除数据卷：`docker-compose down -v`（谨慎使用！）

### Q: 容器重启后数据丢失？
A: 确保正确挂载了数据卷，检查 `docker-compose.yml` 中的 `volumes` 配置。

---

如有问题，请查看日志或提交 Issue。
