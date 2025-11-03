# 项目结构说明

## 📁 完整目录结构

```
password-generator/
├── 📄 配置文件
│   ├── package.json              # 前端依赖和脚本配置
│   ├── package-lock.json         # 前端依赖锁定文件
│   ├── vite.config.ts            # Vite 构建配置（包含代理配置）
│   ├── vitest.config.ts          # 测试框架配置
│   ├── tsconfig.json             # TypeScript 配置（应用代码）
│   ├── tsconfig.node.json        # TypeScript 配置（构建工具）
│   ├── tailwind.config.js        # Tailwind CSS 配置
│   ├── postcss.config.js         # PostCSS 配置
│   └── index.html                # HTML 入口文件
│
├── 🎨 前端代码 (src/)
│   ├── main.tsx                  # 应用入口文件
│   ├── App.tsx                   # 根组件（路由配置）
│   ├── index.css                 # 全局样式
│   ├── vite-env.d.ts             # Vite 类型声明
│   │
│   ├── api/                      # API 客户端
│   │   └── client.ts             # Axios HTTP 客户端封装
│   │
│   ├── components/               # 可复用组件
│   │   └── Layout.tsx            # 页面布局组件（导航栏）
│   │
│   ├── pages/                    # 页面组件
│   │   ├── PasswordGenerator.tsx # 密码生成器页面
│   │   ├── PasswordList.tsx      # 密码列表页面
│   │   └── PasswordDetail.tsx    # 密码详情页面
│   │
│   ├── utils/                    # 工具函数
│   │   ├── passwordGenerator.ts       # 密码生成算法
│   │   ├── passwordGenerator.test.ts  # 密码生成测试
│   │   ├── passwordStrength.ts        # 密码强度计算
│   │   └── passwordStrength.test.ts   # 强度计算测试
│   │
│   └── db/                       # 数据库相关（已废弃，使用后端）
│       ├── database.ts           # IndexedDB 配置（已不使用）
│       ├── services.ts           # 本地数据服务（已不使用）
│       └── types.ts              # 类型定义（共享类型）
│
├── 🔧 后端代码 (server/)
│   ├── package.json              # 后端依赖配置
│   ├── package-lock.json         # 后端依赖锁定文件
│   ├── server.js                 # Express 服务器（含日志中间件）
│   ├── database.js               # SQLite 数据库配置和 DAO
│   └── passwords.db              # SQLite 数据库文件（自动生成，已忽略）
│
├── 🐳 Docker 配置
│   ├── Dockerfile                # Docker 镜像构建文件
│   ├── docker-compose.yml        # Docker Compose 编排配置
│   ├── .dockerignore             # Docker 构建忽略文件
│   ├── docker-run.sh             # 手动 Docker 运行脚本
│   ├── build-docker.sh           # Docker 镜像构建脚本
│   └── docker-mirror-setup.sh    # Docker 镜像加速配置脚本
│
├── 📝 文档
│   ├── README.md                 # 项目主文档
│   ├── DOCKER_DEPLOY.md          # Docker 部署详细文档
│   ├── QUICKSTART.md             # 快速开始指南
│   └── PROJECT_STRUCTURE.md      # 项目结构说明（本文件）
│
├── 📦 运行时生成（已忽略）
│   ├── node_modules/             # 前端依赖包
│   ├── server/node_modules/      # 后端依赖包
│   ├── dist/                     # 前端构建产物
│   ├── logs/                     # 日志文件目录
│   │   └── access-YYYY-MM-DD.log # 按日期命名的访问日志
│   └── server/passwords.db       # 数据库文件
│
└── 🔍 开发工具配置
    └── .claude/                  # Claude AI 上下文
        ├── context-initial.json
        ├── fullstack-migration.md
        └── project-summary.md
```

---

## 🎯 核心模块说明

### 1. 前端 (React + TypeScript + Vite)

#### 📄 入口文件
- **index.html**: HTML 模板
- **src/main.tsx**: React 应用入口，渲染根组件
- **src/App.tsx**: 路由配置（React Router v6）

#### 🎨 页面组件 (src/pages/)
| 文件 | 路由 | 功能 |
|------|------|------|
| PasswordGenerator.tsx | `/generator` | 密码生成器主页面 |
| PasswordList.tsx | `/` | 密码列表展示 |
| PasswordDetail.tsx | `/password/:id` | 密码详情和历史 |

#### 🔧 工具模块 (src/utils/)
- **passwordGenerator.ts**:
  - 使用 `crypto.getRandomValues()` 生成密码学安全的随机密码
  - 支持可配置长度（8-128）和字符类型
  - 保证每种选中字符类型至少出现一次

- **passwordStrength.ts**:
  - 计算密码熵值（bits）
  - 评估密码强度（弱/中等/强/非常强）
  - 提供改进建议

#### 🌐 API 客户端 (src/api/)
- **client.ts**: Axios 封装，配置基础 URL 和拦截器

---

### 2. 后端 (Node.js + Express + SQLite)

#### 📡 API 服务器 (server/server.js)
**核心功能**:
- Express 服务器，监听端口 3001
- 请求日志中间件（console + file）
- RESTful API 路由
- 生产环境静态文件服务

**日志系统**:
- 双重输出：控制台（Docker logs）+ 文件（./logs/）
- 日志格式：`[ISO8601时间戳] 方法 路径 状态码 - 耗时ms`
- 自动轮转：单文件超过 10MB 自动重命名
- 日志文件命名：`access-YYYY-MM-DD.log`

#### 💾 数据库 (server/database.js)
**数据库选择**: SQLite (better-sqlite3)

**数据表结构**:

1. **passwords** - 密码主表
   ```sql
   CREATE TABLE passwords (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     password TEXT NOT NULL,
     tags TEXT NOT NULL,              -- JSON 数组
     length INTEGER NOT NULL,
     includeNumbers INTEGER NOT NULL,
     includeSpecialChars INTEGER NOT NULL,
     includeUppercase INTEGER NOT NULL,
     includeLowercase INTEGER NOT NULL,
     createdAt INTEGER NOT NULL,
     updatedAt INTEGER NOT NULL
   );
   ```

2. **password_history** - 密码轮换历史
   ```sql
   CREATE TABLE password_history (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     passwordId INTEGER NOT NULL,
     oldPassword TEXT NOT NULL,
     newPassword TEXT NOT NULL,
     rotatedAt INTEGER NOT NULL,
     reason TEXT,
     FOREIGN KEY (passwordId) REFERENCES passwords(id) ON DELETE CASCADE
   );
   ```

3. **password_generations** - 生成记录统计
   ```sql
   CREATE TABLE password_generations (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     password TEXT NOT NULL,
     length INTEGER NOT NULL,
     includeNumbers INTEGER NOT NULL,
     includeSpecialChars INTEGER NOT NULL,
     includeUppercase INTEGER NOT NULL,
     includeLowercase INTEGER NOT NULL,
     isSaved INTEGER NOT NULL DEFAULT 0,
     passwordId INTEGER,
     generatedAt INTEGER NOT NULL
   );
   ```

**DAO 模式**:
- `passwordDAO`: 密码 CRUD 操作
- `historyDAO`: 历史记录管理
- `generationDAO`: 生成记录统计

#### 🔌 API 端点

**密码管理**:
```
GET    /api/passwords           # 获取所有密码
GET    /api/passwords/:id       # 获取单个密码
POST   /api/passwords           # 创建新密码
PATCH  /api/passwords/:id/tags  # 更新标签
POST   /api/passwords/:id/rotate # 轮换密码
GET    /api/passwords/:id/history # 获取历史
DELETE /api/passwords/:id       # 删除密码
```

**生成记录**:
```
GET    /api/generations         # 获取生成记录
POST   /api/generations         # 创建生成记录
PATCH  /api/generations/:id/save # 更新保存状态
```

**健康检查**:
```
GET    /api/health              # 服务器状态
```

---

### 3. Docker 部署

#### 🐳 Dockerfile 特性
- **多阶段构建**: 优化镜像大小
- **基础镜像**: node:18-slim (Debian)
- **进程管理**: dumb-init (PID 1 问题)
- **非 root 用户**: node 用户运行
- **健康检查**: 定期检查 /api/health
- **单容器部署**: 前后端打包在一起

#### 📦 docker-compose.yml 配置
```yaml
services:
  password-generator:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - password-data:/app/data      # 数据库持久化
      - ./logs:/app/logs              # 日志持久化
    logging:
      driver: "json-file"
      options:
        max-size: "10m"               # 单文件 10MB
        max-file: "3"                 # 保留 3 个文件
        compress: "true"              # 压缩旧文件
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "..."]
      interval: 30s
      timeout: 3s
      retries: 3
```

#### 📝 部署脚本

1. **build-docker.sh**: 构建 Docker 镜像
2. **docker-run.sh**: 手动运行容器（等效 docker-compose）
3. **docker-mirror-setup.sh**: 配置 Docker 镜像加速

---

## 🔄 数据流

### 密码生成流程
```
用户配置 → PasswordGenerator.tsx
           ↓
  passwordGenerator.ts (前端生成)
           ↓
  passwordStrength.ts (强度评估)
           ↓
  用户点击"保存" → POST /api/passwords
           ↓
  server.js → passwordDAO.create()
           ↓
  SQLite 数据库 → passwords 表
```

### 密码轮换流程
```
用户点击"轮换" → PasswordDetail.tsx
           ↓
  POST /api/passwords/:id/rotate
           ↓
  server.js → 获取旧密码 → historyDAO.create()
           ↓           ↓
           ↓    password_history 表
           ↓
  passwordDAO.updatePassword()
           ↓
  passwords 表更新
```

---

## 🛠️ 开发命令

### 📦 依赖安装
```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install
```

### 🚀 开发模式
```bash
# 同时启动前后端（推荐）
npm run dev:all

# 分别启动
npm run dev          # 前端 Vite (localhost:5173)
npm run dev:server   # 后端 Express (localhost:3001)
```

### 🧪 测试
```bash
npm test             # 运行所有测试（Vitest）
```

### 🏗️ 构建
```bash
npm run build        # 构建前端到 dist/
```

### 🐳 Docker 部署
```bash
# 方式 1: Docker Compose (推荐)
docker-compose up -d

# 方式 2: 使用脚本
./docker-run.sh

# 方式 3: 手动命令
docker build -t password-generator:latest .
docker run -d -p 3001:3001 \
  -v password-generator_password-data:/app/data \
  -v $(pwd)/logs:/app/logs \
  password-generator:latest
```

---

## 📊 端口配置

| 服务 | 端口 | 用途 |
|------|------|------|
| 前端开发服务器 | 5173 | Vite 开发服务器 |
| 后端 API | 3001 | Express 服务器 |
| 生产环境 | 3001 | 前后端合并（单端口） |

---

## 📝 配置文件说明

### vite.config.ts
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',  // 代理 API 请求到后端
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',  // 构建输出目录
  },
});
```

### tsconfig.json
- **target**: ES2020
- **module**: ESNext
- **strict**: true
- **paths**: 配置路径别名

---

## 🔒 数据持久化

### Docker Volume
- **Volume 名称**: `password-generator_password-data`
- **容器路径**: `/app/data/`
- **包含文件**: `passwords.db`, `*.db-shm`, `*.db-wal`

### 日志挂载
- **宿主机路径**: `./logs/`
- **容器路径**: `/app/logs/`
- **日志文件**: `access-YYYY-MM-DD.log`

---

## 🧪 测试覆盖

### 单元测试
- ✅ **passwordGenerator.test.ts** (9 个测试用例)
  - 密码长度验证
  - 字符类型验证
  - 边界条件测试

- ✅ **passwordStrength.test.ts** (10 个测试用例)
  - 强度计算准确性
  - 熵值计算
  - 边界条件测试

**测试命令**:
```bash
npm test              # 运行测试
npm test -- --watch   # 监听模式
npm test -- --coverage # 覆盖率报告
```

---

## 📚 文档体系

| 文档 | 用途 |
|------|------|
| README.md | 项目主文档，功能介绍和快速开始 |
| DOCKER_DEPLOY.md | Docker 部署详细说明 |
| QUICKSTART.md | 快速开始指南 |
| PROJECT_STRUCTURE.md | 项目结构说明（本文件） |

---

## 🎨 技术栈总结

### 前端
- **框架**: React 18.3.1
- **语言**: TypeScript 5.2.2
- **构建**: Vite 5.3.1
- **路由**: React Router v6.23.1
- **HTTP**: Axios 1.7.2
- **测试**: Vitest + jsdom
- **样式**: 原生 CSS（手绘风格）

### 后端
- **运行时**: Node.js 18
- **框架**: Express 4.19.2
- **数据库**: SQLite (better-sqlite3 11.0.0)
- **跨域**: cors 2.8.5

### 部署
- **容器**: Docker + Docker Compose
- **基础镜像**: node:18-slim
- **进程管理**: dumb-init

---

## 📌 注意事项

### 已废弃的模块
- **src/db/database.ts**: IndexedDB 配置（已迁移到后端 SQLite）
- **src/db/services.ts**: 前端数据服务（已替换为 API 调用）

### Git 忽略
```gitignore
node_modules/
dist/
*.db
*.db-shm
*.db-wal
logs/
*.log
```

### Docker 忽略
```dockerignore
node_modules/
dist/
logs/
*.db
.git/
.claude/
```

---

## 🔗 相关链接

- 🏠 **主文档**: [README.md](./README.md)
- 🐳 **Docker 部署**: [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md)
- ⚡ **快速开始**: [QUICKSTART.md](./QUICKSTART.md)

---

**最后更新**: 2025-11-03
**项目版本**: v0.3.0
