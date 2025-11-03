<div align="center">

# 🔐 密码生成器

**一个安全、强大、易用的全栈密码管理应用**

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [Docker 部署](#-docker-部署) • [API 文档](#-api-文档)

</div>

---

## ✨ 功能特性

### 🎲 智能密码生成
- **加密安全随机数**：使用 Web Crypto API 确保密码安全性
- **灵活配置**：支持 8-128 位长度，自定义字符集组合
- **智能策略**：确保每种选中字符类型至少出现一次

### 📊 实时强度评估
- **熵值计算**：科学评估密码强度（弱/中等/强/非常强）
- **可视化反馈**：直观的强度指示器和改进建议
- **即时分析**：输入时实时更新评估结果

### 💾 密码管理
- **持久化存储**：SQLite 数据库安全存储
- **标签分类**：支持多标签组织和筛选
- **快速搜索**：实时搜索和过滤功能
- **一键复制**：快速复制密码到剪贴板

### 🔄 密码轮换
- **历史追踪**：完整记录密码变更历史
- **原因备注**：支持添加轮换原因说明
- **版本回溯**：查看和管理历史密码

---

## 🛠 技术栈

<table>
<tr>
<td valign="top" width="33%">

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router v6** - 路由管理
- **Tailwind CSS** - 样式方案
- **Vitest** - 单元测试

</td>
<td valign="top" width="33%">

### 后端
- **Node.js 18** - 运行环境
- **Express** - Web 框架
- **SQLite** - 数据库
- **better-sqlite3** - 数据库驱动
- **RESTful API** - 接口规范

</td>
<td valign="top" width="33%">

### DevOps
- **Docker** - 容器化
- **Docker Compose** - 编排工具
- **Multi-stage Build** - 镜像优化
- **Volume** - 数据持久化
- **Health Check** - 健康监控

</td>
</tr>
</table>

---

## 🚀 快速开始

### 方式一：Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/password-generator.git
cd password-generator

# 2. 启动服务
docker-compose up -d

# 3. 访问应用
open http://localhost:3001
```

### 方式二：本地开发

```bash
# 1. 安装依赖
npm install
cd server && npm install && cd ..

# 2. 启动开发服务器（前端 + 后端）
npm run dev:all
```

访问:
- 前端: http://localhost:5173
- 后端: http://localhost:3001

### 方式三：生产构建

```bash
# 构建前端
npm run build

# 启动后端（会自动服务前端静态文件）
cd server && npm start
```

---

## 🐳 Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务（保留数据）
docker-compose down

# 查看容器状态
docker-compose ps
```

### 手动 Docker 部署

```bash
# 构建镜像
docker build -t password-generator:latest .

# 运行容器
docker run -d \
  --name password-generator \
  -p 3001:3001 \
  -v password-data:/app/data \
  password-generator:latest
```

### 数据持久化

应用使用 Docker Volume 实现数据持久化：

- **数据库**: `/app/data/passwords.db` → `password-generator_password-data` volume
- **日志文件**: `/app/logs/` → `./logs/` 目录挂载

> ⚠️ **重要**: 使用 `docker-compose down` 停止服务，**不要**添加 `-v` 参数，否则会删除所有数据！

### 数据备份

```bash
# 备份数据库
docker cp password-generator:/app/data/passwords.db ./backup/passwords-$(date +%Y%m%d).db

# 或备份整个 volume
docker run --rm \
  -v password-generator_password-data:/data \
  -v $(pwd)/backup:/backup \
  alpine tar -czf /backup/data-$(date +%Y%m%d).tar.gz -C /data .
```

---

## 📡 API 文档

### 密码管理

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/passwords` | 获取所有密码列表 |
| `POST` | `/api/passwords` | 创建新密码 |
| `GET` | `/api/passwords/:id` | 获取单个密码详情 |
| `PATCH` | `/api/passwords/:id/tags` | 更新密码标签 |
| `DELETE` | `/api/passwords/:id` | 删除密码 |

### 密码轮换

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/passwords/:id/rotate` | 轮换密码 |
| `GET` | `/api/passwords/:id/history` | 获取轮换历史 |

### 生成记录

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/generations` | 记录生成操作 |
| `GET` | `/api/generations` | 获取生成历史 |
| `PATCH` | `/api/generations/:id/save` | 保存生成结果 |

### 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/health` | 服务器健康状态 |

---

## 📁 项目结构

```
password-generator/
├── src/                          # 前端源码
│   ├── api/                      # API 客户端
│   ├── components/               # React 组件
│   ├── pages/                    # 页面组件
│   │   ├── PasswordGenerator.tsx # 密码生成器
│   │   ├── PasswordList.tsx      # 密码列表
│   │   └── PasswordDetail.tsx    # 密码详情
│   ├── db/                       # 类型定义
│   ├── utils/                    # 工具函数
│   │   ├── passwordGenerator.ts  # 生成算法
│   │   └── passwordStrength.ts   # 强度评估
│   └── App.tsx                   # 根组件
├── server/                       # 后端源码
│   ├── server.js                 # Express 服务器
│   ├── database.js               # SQLite 数据库
│   └── package.json              # 后端依赖
├── Dockerfile                    # Docker 镜像定义
├── docker-compose.yml            # Docker Compose 配置
└── package.json                  # 前端依赖
```

---

## 🧪 测试

项目包含完整的单元测试覆盖：

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 查看覆盖率
npm run test:coverage
```

**测试覆盖**:
- ✅ 密码生成算法测试（9 个用例）
- ✅ 密码强度计算测试（10 个用例）
- ✅ 测试通过率 100%

---

## 🔒 安全性

### 密码生成
- 使用 **Web Crypto API** 的 `crypto.getRandomValues()` 生成密码学安全的随机数
- 采用 **Fisher-Yates 洗牌算法** 确保字符均匀分布

### 数据存储
- 所有密码存储在 **本地 SQLite 数据库** 中
- 不涉及任何第三方云服务
- 支持数据库文件级别的加密（需自行配置）

### 最佳实践
- 🔐 定期备份数据库文件
- 🔐 使用强密码保护系统访问
- 🔐 在生产环境中启用 HTTPS
- 🔐 考虑对数据库文件进行加密

> ⚠️ **注意**: 当前版本密码以明文形式存储在数据库中。生产环境建议对数据库文件进行系统级加密。

---

## 🛣 路线图

- [ ] 添加数据库加密支持
- [ ] 实现用户认证系统
- [ ] 支持密码导入/导出
- [ ] 添加密码强度历史统计
- [ ] 实现密码过期提醒
- [ ] 支持多语言国际化
- [ ] 移动端适配优化

---

## 🤝 贡献

欢迎贡献！请随时提交 Issue 或 Pull Request。

### 开发流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

## 👨‍💻 作者

由 **Claude Code** 自动生成

---

<div align="center">

### 💡 觉得有用？给个 ⭐️ 吧！

Made with ❤️ using React + TypeScript + Node.js

</div>
