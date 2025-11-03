import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase, passwordDAO, historyDAO, generationDAO } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 日志管理
const LOG_DIR = process.env.NODE_ENV === 'production' ? '/app/logs' : path.join(__dirname, '..', 'logs');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 获取当前日志文件路径
function getLogFilePath() {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(LOG_DIR, `access-${date}.log`);
}

// 写入日志到文件
function writeLog(message) {
  const logFile = getLogFilePath();
  const logMessage = message + '\n';

  try {
    // 检查文件大小，如果超过限制则轮转
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > MAX_LOG_SIZE) {
        const timestamp = Date.now();
        const rotatedFile = logFile.replace('.log', `-${timestamp}.log`);
        fs.renameSync(logFile, rotatedFile);
      }
    }

    // 追加日志
    fs.appendFileSync(logFile, logMessage, 'utf8');
  } catch (error) {
    console.error('写入日志失败:', error);
  }
}

// 中间件
app.use(cors());
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`;

    // 同时输出到控制台和文件
    console.log(logMessage);
    writeLog(logMessage);
  });
  next();
});

// 初始化数据库
initDatabase();

/**
 * 健康检查
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

/**
 * 获取所有密码
 */
app.get('/api/passwords', (req, res) => {
  try {
    const passwords = passwordDAO.getAll();
    res.json(passwords);
  } catch (error) {
    console.error('获取密码列表失败:', error);
    res.status(500).json({ error: '获取密码列表失败' });
  }
});

/**
 * 根据ID获取密码
 */
app.get('/api/passwords/:id', (req, res) => {
  try {
    const password = passwordDAO.getById(parseInt(req.params.id));
    if (!password) {
      return res.status(404).json({ error: '密码不存在' });
    }
    res.json(password);
  } catch (error) {
    console.error('获取密码失败:', error);
    res.status(500).json({ error: '获取密码失败' });
  }
});

/**
 * 创建新密码
 */
app.post('/api/passwords', (req, res) => {
  try {
    const { password, tags = [], config } = req.body;

    if (!password || !config) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const now = Date.now();
    const result = passwordDAO.create({
      password,
      tags,
      length: config.length,
      includeNumbers: config.includeNumbers,
      includeSpecialChars: config.includeSpecialChars,
      includeUppercase: config.includeUppercase,
      includeLowercase: config.includeLowercase,
      createdAt: now,
      updatedAt: now
    });

    res.status(201).json({ id: result.id });
  } catch (error) {
    console.error('创建密码失败:', error);
    res.status(500).json({ error: '创建密码失败' });
  }
});

/**
 * 更新密码标签
 */
app.patch('/api/passwords/:id/tags', (req, res) => {
  try {
    const { tags } = req.body;
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: '标签必须是数组' });
    }

    const success = passwordDAO.updateTags(parseInt(req.params.id), tags);
    if (!success) {
      return res.status(404).json({ error: '密码不存在' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('更新标签失败:', error);
    res.status(500).json({ error: '更新标签失败' });
  }
});

/**
 * 轮换密码
 */
app.post('/api/passwords/:id/rotate', (req, res) => {
  try {
    const passwordId = parseInt(req.params.id);
    const { newPassword, reason } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: '缺少新密码' });
    }

    // 获取旧密码
    const oldPasswordRecord = passwordDAO.getById(passwordId);
    if (!oldPasswordRecord) {
      return res.status(404).json({ error: '密码不存在' });
    }

    // 保存历史记录
    historyDAO.create({
      passwordId,
      oldPassword: oldPasswordRecord.password,
      newPassword,
      rotatedAt: Date.now(),
      reason
    });

    // 更新密码
    passwordDAO.updatePassword(passwordId, newPassword);

    res.json({ success: true });
  } catch (error) {
    console.error('轮换密码失败:', error);
    res.status(500).json({ error: '轮换密码失败' });
  }
});

/**
 * 获取密码历史
 */
app.get('/api/passwords/:id/history', (req, res) => {
  try {
    const history = historyDAO.getByPasswordId(parseInt(req.params.id));
    res.json(history);
  } catch (error) {
    console.error('获取历史失败:', error);
    res.status(500).json({ error: '获取历史失败' });
  }
});

/**
 * 删除密码
 */
app.delete('/api/passwords/:id', (req, res) => {
  try {
    const success = passwordDAO.delete(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: '密码不存在' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('删除密码失败:', error);
    res.status(500).json({ error: '删除密码失败' });
  }
});

/**
 * 创建密码生成记录
 */
app.post('/api/generations', (req, res) => {
  try {
    const { password, config, isSaved = false, passwordId = null } = req.body;

    if (!password || !config) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const result = generationDAO.create({
      password,
      length: config.length,
      includeNumbers: config.includeNumbers,
      includeSpecialChars: config.includeSpecialChars,
      includeUppercase: config.includeUppercase,
      includeLowercase: config.includeLowercase,
      isSaved,
      passwordId,
      generatedAt: Date.now()
    });

    res.status(201).json({ id: result.id });
  } catch (error) {
    console.error('创建生成记录失败:', error);
    res.status(500).json({ error: '创建生成记录失败' });
  }
});

/**
 * 获取所有生成记录
 */
app.get('/api/generations', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const generations = generationDAO.getAll(limit);
    res.json(generations);
  } catch (error) {
    console.error('获取生成记录失败:', error);
    res.status(500).json({ error: '获取生成记录失败' });
  }
});

/**
 * 更新生成记录的保存状态
 */
app.patch('/api/generations/:id/save', (req, res) => {
  try {
    const { passwordId } = req.body;
    if (!passwordId) {
      return res.status(400).json({ error: '缺少密码ID' });
    }

    const success = generationDAO.updateSaveStatus(parseInt(req.params.id), passwordId);
    if (!success) {
      return res.status(404).json({ error: '生成记录不存在' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('更新生成记录失败:', error);
    res.status(500).json({ error: '更新生成记录失败' });
  }
});

// 生产环境：提供前端静态文件
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');

  // 提供静态文件
  app.use(express.static(distPath));

  // 所有非 API 路由返回 index.html (支持前端路由)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 API 端点: http://localhost:${PORT}/api`);
});
