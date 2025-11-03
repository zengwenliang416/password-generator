import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库文件路径
// 生产环境使用 /app/data (Docker volume)，开发环境使用当前目录
const dbPath = process.env.NODE_ENV === 'production'
  ? '/app/data/passwords.db'
  : join(__dirname, 'passwords.db');

// 创建或连接数据库
const db = new Database(dbPath);

// 启用 WAL 模式以提高性能
db.pragma('journal_mode = WAL');

/**
 * 初始化数据库表
 */
export function initDatabase() {
  // 创建密码表
  db.exec(`
    CREATE TABLE IF NOT EXISTS passwords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      password TEXT NOT NULL,
      tags TEXT NOT NULL,
      length INTEGER NOT NULL,
      includeNumbers INTEGER NOT NULL,
      includeSpecialChars INTEGER NOT NULL,
      includeUppercase INTEGER NOT NULL,
      includeLowercase INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);

  // 创建密码历史表
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      passwordId INTEGER NOT NULL,
      oldPassword TEXT NOT NULL,
      newPassword TEXT NOT NULL,
      rotatedAt INTEGER NOT NULL,
      reason TEXT,
      FOREIGN KEY (passwordId) REFERENCES passwords(id) ON DELETE CASCADE
    )
  `);

  // 创建密码生成记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS generation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      password TEXT NOT NULL,
      length INTEGER NOT NULL,
      includeNumbers INTEGER NOT NULL,
      includeSpecialChars INTEGER NOT NULL,
      includeUppercase INTEGER NOT NULL,
      includeLowercase INTEGER NOT NULL,
      isSaved INTEGER NOT NULL DEFAULT 0,
      passwordId INTEGER,
      generatedAt INTEGER NOT NULL,
      FOREIGN KEY (passwordId) REFERENCES passwords(id) ON DELETE SET NULL
    )
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_passwords_createdAt ON passwords(createdAt);
    CREATE INDEX IF NOT EXISTS idx_password_history_passwordId ON password_history(passwordId);
    CREATE INDEX IF NOT EXISTS idx_generation_history_generatedAt ON generation_history(generatedAt);
  `);

  console.log('✅ 数据库初始化成功');
}

/**
 * 密码数据访问对象
 */
export const passwordDAO = {
  /**
   * 添加新密码
   */
  create(data) {
    const stmt = db.prepare(`
      INSERT INTO passwords (password, tags, length, includeNumbers, includeSpecialChars,
                            includeUppercase, includeLowercase, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.password,
      JSON.stringify(data.tags),
      data.length,
      data.includeNumbers ? 1 : 0,
      data.includeSpecialChars ? 1 : 0,
      data.includeUppercase ? 1 : 0,
      data.includeLowercase ? 1 : 0,
      data.createdAt,
      data.updatedAt
    );

    return { id: result.lastInsertRowid };
  },

  /**
   * 获取所有密码
   */
  getAll() {
    const stmt = db.prepare('SELECT * FROM passwords ORDER BY createdAt DESC');
    const rows = stmt.all();
    return rows.map(row => ({
      ...row,
      tags: JSON.parse(row.tags),
      includeNumbers: Boolean(row.includeNumbers),
      includeSpecialChars: Boolean(row.includeSpecialChars),
      includeUppercase: Boolean(row.includeUppercase),
      includeLowercase: Boolean(row.includeLowercase)
    }));
  },

  /**
   * 根据ID获取密码
   */
  getById(id) {
    const stmt = db.prepare('SELECT * FROM passwords WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;

    return {
      ...row,
      tags: JSON.parse(row.tags),
      includeNumbers: Boolean(row.includeNumbers),
      includeSpecialChars: Boolean(row.includeSpecialChars),
      includeUppercase: Boolean(row.includeUppercase),
      includeLowercase: Boolean(row.includeLowercase)
    };
  },

  /**
   * 更新密码标签
   */
  updateTags(id, tags) {
    const stmt = db.prepare('UPDATE passwords SET tags = ?, updatedAt = ? WHERE id = ?');
    const result = stmt.run(JSON.stringify(tags), Date.now(), id);
    return result.changes > 0;
  },

  /**
   * 更新密码
   */
  updatePassword(id, password) {
    const stmt = db.prepare('UPDATE passwords SET password = ?, updatedAt = ? WHERE id = ?');
    const result = stmt.run(password, Date.now(), id);
    return result.changes > 0;
  },

  /**
   * 删除密码
   */
  delete(id) {
    // 先删除历史记录
    const deleteHistory = db.prepare('DELETE FROM password_history WHERE passwordId = ?');
    deleteHistory.run(id);

    // 再删除密码
    const stmt = db.prepare('DELETE FROM passwords WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

/**
 * 密码历史数据访问对象
 */
export const historyDAO = {
  /**
   * 添加历史记录
   */
  create(data) {
    const stmt = db.prepare(`
      INSERT INTO password_history (passwordId, oldPassword, newPassword, rotatedAt, reason)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.passwordId,
      data.oldPassword,
      data.newPassword,
      data.rotatedAt,
      data.reason || null
    );

    return { id: result.lastInsertRowid };
  },

  /**
   * 获取密码的历史记录
   */
  getByPasswordId(passwordId) {
    const stmt = db.prepare('SELECT * FROM password_history WHERE passwordId = ? ORDER BY rotatedAt DESC');
    return stmt.all(passwordId);
  }
};

/**
 * 密码生成记录数据访问对象
 */
export const generationDAO = {
  /**
   * 添加生成记录
   */
  create(data) {
    const stmt = db.prepare(`
      INSERT INTO generation_history (password, length, includeNumbers, includeSpecialChars,
                                     includeUppercase, includeLowercase, isSaved, passwordId, generatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.password,
      data.length,
      data.includeNumbers ? 1 : 0,
      data.includeSpecialChars ? 1 : 0,
      data.includeUppercase ? 1 : 0,
      data.includeLowercase ? 1 : 0,
      data.isSaved ? 1 : 0,
      data.passwordId || null,
      data.generatedAt
    );

    return { id: result.lastInsertRowid };
  },

  /**
   * 获取所有生成记录
   */
  getAll(limit = 100) {
    const stmt = db.prepare('SELECT * FROM generation_history ORDER BY generatedAt DESC LIMIT ?');
    const rows = stmt.all(limit);
    return rows.map(row => ({
      ...row,
      includeNumbers: Boolean(row.includeNumbers),
      includeSpecialChars: Boolean(row.includeSpecialChars),
      includeUppercase: Boolean(row.includeUppercase),
      includeLowercase: Boolean(row.includeLowercase),
      isSaved: Boolean(row.isSaved)
    }));
  },

  /**
   * 更新生成记录的保存状态
   */
  updateSaveStatus(id, passwordId) {
    const stmt = db.prepare('UPDATE generation_history SET isSaved = 1, passwordId = ? WHERE id = ?');
    const result = stmt.run(passwordId, id);
    return result.changes > 0;
  },

  /**
   * 删除旧记录（保留最近N条）
   */
  cleanup(keepCount = 1000) {
    const stmt = db.prepare(`
      DELETE FROM generation_history
      WHERE id NOT IN (
        SELECT id FROM generation_history
        ORDER BY generatedAt DESC
        LIMIT ?
      )
    `);
    return stmt.run(keepCount);
  }
};

export default db;
