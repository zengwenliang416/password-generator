# 密码生成器（全栈版）

一个功能完整的密码生成器应用，使用 React + TypeScript + Node.js + SQLite 构建。

## 功能特性

### 核心功能

- **强密码生成**
  - 使用 `crypto.getRandomValues()` API 确保密码的密码学安全性
  - 可配置密码长度（8-128 位）
  - 支持选择字符类型：小写字母、大写字母、数字、特殊字符
  - 确保每种选中的字符类型至少出现一次

- **密码强度评估**
  - 实时计算密码强度（弱/中等/强/非常强）
  - 显示密码熵值（比特）
  - 提供改进建议和反馈
  - 可视化强度指示器

- **密码管理**
  - 使用 SQLite 数据库持久化存储密码
  - 支持添加多个标签分类
  - 实时搜索和筛选功能
  - 一键复制密码到剪贴板

- **密码轮换**
  - 生成新密码替换旧密码
  - 保存完整的轮换历史记录
  - 可添加轮换原因备注
  - 查看历史密码

## 技术栈

### 前端
- **框架**: React 18
- **构建工具**: Vite
- **语言**: TypeScript
- **路由**: React Router v6
- **样式**: 自定义手绘风格 CSS
- **测试**: Vitest + jsdom

### 后端
- **运行时**: Node.js
- **框架**: Express
- **数据库**: SQLite (better-sqlite3)
- **API**: RESTful API

### 部署
- **容器化**: Docker + Docker Compose
- **基础镜像**: node:18-slim (Debian)
- **数据持久化**: Docker Volume
- **进程管理**: dumb-init

## 项目结构

```
password-generator/
├── src/                    # 前端代码
│   ├── api/
│   │   └── client.ts       # API 客户端
│   ├── components/
│   │   └── Layout.tsx      # 布局组件
│   ├── pages/
│   │   ├── PasswordGenerator.tsx  # 密码生成器
│   │   ├── PasswordList.tsx       # 密码列表
│   │   └── PasswordDetail.tsx     # 密码详情
│   ├── db/
│   │   └── types.ts        # 类型定义
│   ├── utils/
│   │   ├── passwordGenerator.ts   # 密码生成算法
│   │   └── passwordStrength.ts    # 强度计算
│   └── App.tsx
├── server/                 # 后端代码
│   ├── server.js           # Express 服务器
│   ├── database.js         # SQLite 数据库
│   └── passwords.db        # 数据库文件（自动生成）
├── Dockerfile              # Docker 镜像构建文件
├── docker-compose.yml      # Docker Compose 配置
├── .dockerignore           # Docker 构建忽略文件
├── DOCKER_DEPLOY.md        # Docker 部署详细文档
└── package.json
```

## 快速开始

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 开发模式

#### 方式1：同时启动前后端（推荐）

```bash
npm run dev:all
```

这会同时启动：
- 前端开发服务器：http://localhost:5173
- 后端 API 服务器：http://localhost:3001

#### 方式2：分别启动

```bash
# 终端1：启动后端
npm run dev:server

# 终端2：启动前端
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
npm test
```

## Docker 部署

### 快速部署（推荐）

使用 Docker Compose 一键部署：

```bash
# 构建并启动容器
docker-compose up -d

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 访问应用
# http://localhost:3001
```

### 手动 Docker 部署

#### 方式 1: 使用命令行脚本（推荐）

```bash
# 构建镜像
docker build -t password-generator:latest .

# 使用提供的脚本启动（自动配置所有参数）
./docker-run.sh
```

这个脚本会自动：
- 创建并挂载 Docker volume（数据持久化）
- 挂载日志目录到 `./logs`
- 配置日志轮转（10MB，保留3个文件）
- 设置健康检查和自动重启

#### 方式 2: Docker Desktop GUI 启动

⚠️ **重要提示**: 在 Docker Desktop 中直接点击镜像启动时，**不会**自动应用 docker-compose.yml 的配置。

**正确的 GUI 启动步骤**:

1. **构建镜像**（命令行）:
   ```bash
   docker build -t password-generator:latest .
   ```

2. **在 Docker Desktop 中启动**:
   - 点击镜像 → **Run**
   - 展开 **"Optional settings"**

3. **配置卷挂载**（必须手动配置）:

   **挂载 1 - 日志目录** (必须):
   - Host path: `/Users/你的用户名/项目路径/logs`
   - Container path: `/app/logs`

   **挂载 2 - 数据持久化** (必须):
   - 类型: Volume
   - Volume name: `password-data`
   - Container path: `/app/data`

4. **配置端口映射**:
   - Host port: `3001`
   - Container port: `3001`

5. **配置环境变量**:
   - `NODE_ENV=production`
   - `PORT=3001`

6. 点击 **"Run"** 启动容器

**推荐做法**: 使用 Docker Desktop 的 **Compose** 功能，它会自动识别 `docker-compose.yml` 并正确配置所有参数。

#### 方式 3: 原始 Docker 命令

```bash
# 1. 构建镜像
docker build -t password-generator:latest .

# 2. 创建数据卷
docker volume create password-data

# 3. 创建日志目录
mkdir -p logs

# 4. 运行容器（完整配置）
docker run -d \
  --name password-generator \
  --restart unless-stopped \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -v password-data:/app/data \
  -v "$(pwd)/logs:/app/logs" \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  --log-opt compress=true \
  password-generator:latest

# 5. 查看日志
docker logs -f password-generator
```

### 数据持久化

应用使用 Docker Volume 和目录挂载实现数据持久化：

#### 数据库持久化
- **Volume 名称**: `password-generator_password-data` (docker-compose) 或 `password-data` (手动)
- **容器挂载路径**: `/app/data/`
- **数据库文件**: `/app/data/passwords.db`
- **宿主机存储路径**: `/var/lib/docker/volumes/password-generator_password-data/_data`

#### 日志持久化
- **宿主机目录**: `./logs`
- **容器挂载路径**: `/app/logs/`
- **日志文件格式**: `access-YYYY-MM-DD.log`
- **日志轮转**: 单个文件超过 10MB 自动重命名为 `access-YYYY-MM-DD-{timestamp}.log`

**重要提示**:
- ✅ 容器删除后数据和日志都不会丢失
- ✅ 容器重启后数据自动恢复
- ✅ 日志文件可直接在宿主机访问（`./logs/` 目录）
- ⚠️ 使用 `docker-compose down -v` 会删除 volume 和所有数据（危险操作）
- ✅ 安全停止: `docker-compose down` (不带 `-v` 参数)

**查看日志的两种方式**:
```bash
# 方式 1: Docker 日志（包含所有容器输出）
docker logs -f password-generator

# 方式 2: 文件日志（HTTP 访问日志）
tail -f logs/access-*.log
```

### 常用 Docker 命令

```bash
# 启动服务
docker-compose up -d

# 停止服务（保留数据）
docker-compose down

# 重启服务
docker-compose restart

# 查看容器状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 进入容器
docker-compose exec password-generator sh

# 查看数据卷
docker volume ls
docker volume inspect password-generator_password-data
```

### 数据备份与恢复

#### 备份数据

```bash
# 方式1：备份整个 volume
docker run --rm \
  -v password-generator_password-data:/data \
  -v $(pwd):/backup \
  alpine tar -czf /backup/password-backup-$(date +%Y%m%d).tar.gz -C /data .

# 方式2：直接复制数据库文件
docker cp password-generator:/app/data/passwords.db ./passwords-backup.db
```

#### 恢复数据

```bash
# 停止容器
docker-compose down

# 恢复 volume 数据
docker run --rm \
  -v password-generator_password-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar -xzf /backup/password-backup-YYYYMMDD.tar.gz"

# 重启容器
docker-compose up -d
```

### Docker 镜像特性

- ✅ **多阶段构建**: 优化镜像大小
- ✅ **基于 Debian (node:18-slim)**: 稳定可靠
- ✅ **非 root 用户**: 增强安全性
- ✅ **健康检查**: 自动监控容器健康状态
- ✅ **数据持久化**: 使用 Docker volume 保存数据库
- ✅ **单容器部署**: 前后端打包在一个容器中

### 环境变量配置

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 服务端口 | `3001` |

### 端口映射

默认映射 `3001:3001`，可以修改宿主机端口：

```yaml
# docker-compose.yml
ports:
  - "8080:3001"  # 映射到宿主机 8080 端口
```

或使用 Docker 命令：

```bash
docker run -d -p 8080:3001 -v password-data:/app/data password-generator:latest
```

### 故障排查

#### 容器无法启动

```bash
# 查看详细错误
docker logs password-generator

# 检查端口占用
lsof -i :3001
```

#### 数据丢失

确保容器启动时挂载了 volume：

```bash
# 检查容器挂载
docker inspect password-generator | grep -A 10 Mounts
```

**必须看到**:
```json
{
  "Type": "volume",
  "Name": "password-generator_password-data",
  "Destination": "/app/data"
}
```

#### 重新构建镜像

```bash
# 清理旧容器和镜像
docker-compose down
docker rmi password-generator:latest

# 重新构建
docker-compose build --no-cache
docker-compose up -d
```

详细的 Docker 部署文档请参考: [DOCKER_DEPLOY.md](DOCKER_DEPLOY.md)

## API 接口

### 密码相关

- `GET /api/passwords` - 获取所有密码
- `GET /api/passwords/:id` - 获取单个密码
- `POST /api/passwords` - 创建新密码
- `PATCH /api/passwords/:id/tags` - 更新密码标签
- `POST /api/passwords/:id/rotate` - 轮换密码
- `GET /api/passwords/:id/history` - 获取密码历史
- `DELETE /api/passwords/:id` - 删除密码

### 健康检查

- `GET /api/health` - 服务器健康状态

## 使用说明

### 生成密码

1. 访问"生成密码"页面
2. 调整密码长度滑块（8-128位）
3. 选择要包含的字符类型
4. 点击"生成密码"按钮
5. 查看密码强度评估
6. 可选：添加标签分类
7. 点击"保存密码"保存到数据库

### 管理密码

1. 访问"密码列表"页面
2. 查看所有已保存的密码
3. 使用标签筛选或搜索功能
4. 点击"复制"快速复制密码
5. 点击"详情"查看密码详细信息
6. 点击"删除"移除密码

### 轮换密码

1. 在密码详情页面点击"轮换密码"
2. 可选：填写轮换原因
3. 点击"确认轮换"生成新密码
4. 旧密码会保存到历史记录中
5. 查看完整的轮换历史

## 数据库结构

### passwords 表
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

### password_history 表
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

## 安全性说明

- **服务器端存储**: 所有密码存储在本地 SQLite 数据库中
- **加密随机数**: 使用 Web Crypto API 的 `getRandomValues()` 生成密码学安全的随机数
- **数据持久化**: SQLite 数据库文件存储在 `server/passwords.db`
- **备份建议**: 定期备份 `server/passwords.db` 文件

## 测试覆盖

项目包含完整的单元测试：

- ✅ 密码生成算法测试（9个测试用例）
- ✅ 密码强度计算测试（10个测试用例）
- ✅ 所有测试通过率 100%

## 常见问题

### 数据存储在哪里？

密码存储在 `server/passwords.db` SQLite 数据库文件中。

### 如何备份数据？

复制 `server/passwords.db` 文件即可。

### 能否在多个设备间同步？

当前版本仅支持本地存储，不支持云端同步。

### 数据是否加密？

密码以明文形式存储在本地数据库中。如需加密，建议对整个数据库文件进行加密。

## 许可证

MIT

## 更新日志

### v0.3.0 (2025-11-03)
- 🐳 添加完整的 Docker 支持
- ✨ 实现 Docker Volume 数据持久化
- ✨ 多阶段构建优化镜像大小
- 📝 添加 Docker 部署文档 (DOCKER_DEPLOY.md)
- 🎨 实现手绘风格 UI 界面
- 🔧 配置健康检查和自动重启

### v0.2.0 (2025-11-03)
- ✨ 集成 SQLite 数据库替代浏览器 IndexedDB
- ✨ 添加 Express 后端 API
- ✨ 实现前后端分离架构
- 🔧 配置 Vite 代理

### v0.1.0 (2025-11-03)
- 🎉 初始版本
- ✨ 密码生成功能
- ✨ 密码强度评估
- ✨ 密码管理和轮换

## 作者

由 Claude Code 自动生成
