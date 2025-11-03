#!/bin/bash

# Docker CLI 启动脚本 - 等效于 docker-compose.yml 配置

# 停止并删除旧容器（如果存在）
docker stop password-generator 2>/dev/null || true
docker rm password-generator 2>/dev/null || true

# 创建 Docker volume（如果不存在）
# 注意：如果使用 docker-compose 创建过 volume，名称会是 password-generator_password-data
VOLUME_NAME="password-generator_password-data"
docker volume create $VOLUME_NAME 2>/dev/null || true

# 创建日志目录（如果不存在）
mkdir -p logs

# 获取当前目录的绝对路径
CURRENT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 启动容器
docker run -d \
  --name password-generator \
  --restart unless-stopped \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -v $VOLUME_NAME:/app/data \
  -v "${CURRENT_DIR}/logs:/app/logs" \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  --log-opt compress=true \
  password-generator:latest

echo "✅ 容器已启动"
echo "📊 查看日志: docker logs -f password-generator"
echo "🌐 访问地址: http://localhost:3001"
echo "📁 本地日志: ${CURRENT_DIR}/logs/"
echo "💾 数据卷: $VOLUME_NAME"
echo ""
echo "ℹ️  现有数据已自动挂载并保留"
