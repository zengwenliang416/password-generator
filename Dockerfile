# 多阶段构建 Dockerfile

# 阶段 1: 构建前端
FROM node:18-slim AS frontend-builder

WORKDIR /app

# 复制前端 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制前端源码
COPY . .

# 构建前端静态文件
RUN npm run build

# 阶段 2: 构建最终镜像
FROM node:18-slim

# 添加 OCI 标签以自动关联到 GitHub Repository
LABEL org.opencontainers.image.source="https://github.com/zengwenliang416/password-generator"
LABEL org.opencontainers.image.description="一个安全、强大、易用的全栈密码管理应用"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# 安装 dumb-init（用于正确处理信号）
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

# 复制后端 package 文件
COPY server/package*.json ./server/

# 安装后端依赖（仅生产依赖）
RUN cd server && npm ci --only=production

# 复制后端源码
COPY server/ ./server/

# 从第一阶段复制构建好的前端文件
COPY --from=frontend-builder /app/dist ./dist

# 创建数据目录
RUN mkdir -p /app/data

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 使用非 root 用户运行
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 使用 dumb-init 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/server.js"]
