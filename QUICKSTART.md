# 快速开始指南

## 🚀 30秒启动应用

### 1. 安装依赖（首次运行）

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..
```

### 2. 启动应用

```bash
# 一键启动前后端
npm run dev:all
```

应用会自动启动：
- 🌐 **前端**: http://localhost:5173
- 🔌 **后端**: http://localhost:3001

### 3. 开始使用

1. 访问 http://localhost:5173
2. 点击"生成密码"
3. 调整配置并生成强密码
4. 保存密码到数据库
5. 在"密码列表"查看管理

---

## 📋 详细说明

### 分别启动前后端（调试时）

**终端1 - 启动后端**:
```bash
npm run dev:server
```

**终端2 - 启动前端**:
```bash
npm run dev
```

### 数据存储位置

密码存储在：`server/passwords.db`

**备份数据**:
```bash
cp server/passwords.db ~/backup/passwords-$(date +%Y%m%d).db
```

### 停止应用

按 `Ctrl + C` 停止服务器

---

## 🧪 运行测试

```bash
npm test
```

---

## 🏗️ 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录

---

## 📦 项目结构

```
password-generator/
├── src/              # 前端源码
├── server/           # 后端源码
│   ├── server.js     # API 服务器
│   ├── database.js   # 数据库
│   └── passwords.db  # SQLite 数据库文件（自动生成）
├── dist/             # 构建产物
└── package.json
```

---

## ❓ 常见问题

### Q: 端口被占用怎么办？

**前端端口冲突**:
修改 `vite.config.ts`:
```typescript
server: {
  port: 5174, // 改为其他端口
  ...
}
```

**后端端口冲突**:
修改 `server/server.js`:
```javascript
const PORT = process.env.PORT || 3002; // 改为其他端口
```

同时更新 `vite.config.ts` 中的代理配置。

### Q: 数据库文件在哪里？

在 `server/passwords.db`

### Q: 如何清空所有数据？

```bash
rm server/passwords.db
```

重启服务器会自动创建新数据库。

### Q: 能在生产环境使用吗？

当前版本适合**本地个人使用**。生产环境需要：
- 添加 HTTPS
- 实现用户认证
- 数据库加密
- 定期备份
- 错误监控

---

## 🎯 核心功能

- ✅ **密码生成**: 使用密码学安全的随机数生成强密码
- ✅ **强度评估**: 实时显示密码强度和熵值
- ✅ **标签管理**: 为密码添加标签分类
- ✅ **密码轮换**: 生成新密码并保存历史记录
- ✅ **搜索筛选**: 按标签搜索和筛选密码
- ✅ **一键复制**: 快速复制密码到剪贴板

---

## 🔧 开发模式

### 监视文件变化

前后端都支持热重载：
- **前端**: Vite HMR（自动）
- **后端**: Node.js --watch（自动）

修改代码后自动重启，无需手动刷新。

### 调试技巧

**前端调试**:
- 打开浏览器开发者工具（F12）
- 查看 Console 和 Network 面板

**后端调试**:
- 查看终端输出
- API 健康检查：访问 http://localhost:3001/api/health

---

## 📚 API 文档

### 获取所有密码
```
GET /api/passwords
```

### 创建新密码
```
POST /api/passwords
Content-Type: application/json

{
  "password": "生成的密码",
  "tags": ["工作", "重要"],
  "config": {
    "length": 16,
    "includeNumbers": true,
    "includeSpecialChars": true,
    "includeUppercase": true,
    "includeLowercase": true
  }
}
```

### 更多 API 端点

查看 `README.md` 的 API 接口部分。

---

## 💡 提示

1. **定期备份**: 养成定期备份 `server/passwords.db` 的习惯
2. **强密码**: 建议使用16位以上的密码，包含所有字符类型
3. **标签使用**: 使用标签如"工作"、"银行"、"邮箱"等分类管理
4. **密码轮换**: 重要账户定期轮换密码（3-6个月）

---

## 🎉 开始使用吧！

```bash
npm run dev:all
```

访问 http://localhost:5173 开始生成和管理密码！
