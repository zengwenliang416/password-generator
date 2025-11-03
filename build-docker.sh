#!/bin/bash
# Docker 构建脚本 - 解决网络问题

set -e

echo "🚀 开始构建 Docker 镜像..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步骤 1: 检查 Docker 是否运行
echo -e "${YELLOW}📋 步骤 1/5: 检查 Docker 状态...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未运行，请启动 Docker Desktop${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker 运行正常${NC}"
echo ""

# 步骤 2: 预先拉取基础镜像
echo -e "${YELLOW}📋 步骤 2/5: 拉取基础镜像 (node:18-alpine)...${NC}"
echo "这可能需要几分钟时间，请耐心等待..."

# 尝试多个镜像源
MIRRORS=(
    "docker.io"
    "docker.mirrors.ustc.edu.cn"
    "hub-mirror.c.163.com"
)

IMAGE_PULLED=false

for mirror in "${MIRRORS[@]}"; do
    if [ "$mirror" = "docker.io" ]; then
        echo "尝试从 Docker Hub 官方源拉取..."
        IMAGE="node:18-alpine"
    else
        echo "尝试从镜像源 $mirror 拉取..."
        IMAGE="$mirror/library/node:18-alpine"
    fi

    if timeout 60 docker pull "$IMAGE" 2>/dev/null; then
        # 如果不是官方源，需要重新标记
        if [ "$mirror" != "docker.io" ]; then
            docker tag "$IMAGE" "node:18-alpine"
        fi
        echo -e "${GREEN}✅ 成功从 $mirror 拉取镜像${NC}"
        IMAGE_PULLED=true
        break
    else
        echo -e "${YELLOW}⚠️  从 $mirror 拉取失败，尝试下一个...${NC}"
    fi
done

if [ "$IMAGE_PULLED" = false ]; then
    echo -e "${RED}❌ 所有镜像源都失败了，请检查网络连接${NC}"
    echo ""
    echo "建议："
    echo "1. 检查网络连接"
    echo "2. 尝试使用 VPN"
    echo "3. 稍后重试"
    exit 1
fi
echo ""

# 步骤 3: 清理旧镜像和容器
echo -e "${YELLOW}📋 步骤 3/5: 清理旧容器和镜像...${NC}"
docker-compose down 2>/dev/null || true
docker rmi password-generator:latest 2>/dev/null || true
echo -e "${GREEN}✅ 清理完成${NC}"
echo ""

# 步骤 4: 构建镜像
echo -e "${YELLOW}📋 步骤 4/5: 构建应用镜像...${NC}"
if DOCKER_BUILDKIT=1 docker-compose build --no-cache --progress=plain; then
    echo -e "${GREEN}✅ 镜像构建成功${NC}"
else
    echo -e "${RED}❌ 镜像构建失败${NC}"
    exit 1
fi
echo ""

# 步骤 5: 启动容器
echo -e "${YELLOW}📋 步骤 5/5: 启动容器...${NC}"
if docker-compose up -d; then
    echo -e "${GREEN}✅ 容器启动成功${NC}"
else
    echo -e "${RED}❌ 容器启动失败${NC}"
    exit 1
fi
echo ""

# 显示状态
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo "📊 容器状态："
docker-compose ps
echo ""
echo "📝 查看日志："
echo "  docker-compose logs -f"
echo ""
echo "🌐 访问应用："
echo "  http://localhost:3001"
echo ""
echo "🛑 停止容器："
echo "  docker-compose down"
