#!/bin/bash
# Docker 镜像加速器配置脚本

echo "🔧 配置 Docker 镜像加速器..."
echo ""

# 检测操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "检测到 macOS 系统"
    echo ""
    echo "请按照以下步骤手动配置 Docker Desktop："
    echo ""
    echo "1. 打开 Docker Desktop"
    echo "2. 点击右上角齿轮图标 (Settings)"
    echo "3. 选择 'Docker Engine'"
    echo "4. 在 JSON 配置中添加以下内容："
    echo ""
    cat << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
EOF
    echo ""
    echo "5. 点击 'Apply & Restart'"
    echo ""
    echo "或者使用以下国内镜像源（选择一个即可）："
    echo "  - 中科大: https://docker.mirrors.ustc.edu.cn"
    echo "  - 网易: https://hub-mirror.c.163.com"
    echo "  - 腾讯云: https://mirror.ccs.tencentyun.com"
    echo "  - 阿里云: https://你的ID.mirror.aliyuncs.com (需要注册)"

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "检测到 Linux 系统"

    # 创建或编辑 daemon.json
    DOCKER_CONFIG="/etc/docker/daemon.json"

    if [ -f "$DOCKER_CONFIG" ]; then
        echo "备份现有配置..."
        sudo cp "$DOCKER_CONFIG" "${DOCKER_CONFIG}.backup.$(date +%Y%m%d%H%M%S)"
    fi

    echo "写入镜像加速器配置..."
    sudo tee "$DOCKER_CONFIG" > /dev/null << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}
EOF

    echo "重启 Docker 服务..."
    sudo systemctl daemon-reload
    sudo systemctl restart docker

    echo "✅ 配置完成！"
else
    echo "未知操作系统: $OSTYPE"
    echo "请手动配置 Docker 镜像加速器"
fi

echo ""
echo "📝 验证配置："
echo "docker info | grep -A 5 'Registry Mirrors'"
