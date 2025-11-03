import Dexie, { Table } from 'dexie';
import { Password, PasswordHistory } from './types';

/**
 * 密码管理数据库类
 * 继承自 Dexie，定义数据库 schema 和表
 */
export class PasswordDatabase extends Dexie {
  // 密码表
  passwords!: Table<Password, number>;
  // 密码历史记录表
  passwordHistory!: Table<PasswordHistory, number>;

  constructor() {
    super('PasswordManagerDB');

    // 定义数据库版本和 schema
    this.version(1).stores({
      // 密码表：++id 表示自增主键，其他字段为索引
      passwords: '++id, createdAt, updatedAt, *tags',
      // 密码历史表：++id 表示自增主键，passwordId 和 rotatedAt 为索引
      passwordHistory: '++id, passwordId, rotatedAt'
    });
  }
}

// 创建数据库实例并导出
export const db = new PasswordDatabase();
