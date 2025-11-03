import { db } from './database';
import { Password, PasswordHistory, PasswordConfig } from './types';

/**
 * 密码数据库服务类
 * 提供对密码和历史记录的 CRUD 操作
 */
export class PasswordService {
  /**
   * 添加新密码
   */
  static async addPassword(config: PasswordConfig, password: string, tags: string[] = []): Promise<number> {
    const now = Date.now();
    const passwordRecord: Password = {
      password,
      tags,
      length: config.length,
      includeNumbers: config.includeNumbers,
      includeSpecialChars: config.includeSpecialChars,
      includeUppercase: config.includeUppercase,
      includeLowercase: config.includeLowercase,
      createdAt: now,
      updatedAt: now
    };

    return await db.passwords.add(passwordRecord);
  }

  /**
   * 获取所有密码
   */
  static async getAllPasswords(): Promise<Password[]> {
    return await db.passwords.orderBy('createdAt').reverse().toArray();
  }

  /**
   * 根据ID获取密码
   */
  static async getPasswordById(id: number): Promise<Password | undefined> {
    return await db.passwords.get(id);
  }

  /**
   * 根据标签筛选密码
   */
  static async getPasswordsByTag(tag: string): Promise<Password[]> {
    return await db.passwords.where('tags').equals(tag).toArray();
  }

  /**
   * 更新密码标签
   */
  static async updatePasswordTags(id: number, tags: string[]): Promise<number> {
    return await db.passwords.update(id, {
      tags,
      updatedAt: Date.now()
    });
  }

  /**
   * 删除密码
   */
  static async deletePassword(id: number): Promise<void> {
    // 同时删除相关的历史记录
    await db.passwordHistory.where('passwordId').equals(id).delete();
    await db.passwords.delete(id);
  }

  /**
   * 轮换密码（生成新密码并保存历史记录）
   */
  static async rotatePassword(
    id: number,
    newPassword: string,
    reason?: string
  ): Promise<void> {
    const oldPasswordRecord = await db.passwords.get(id);
    if (!oldPasswordRecord) {
      throw new Error('密码记录不存在');
    }

    const now = Date.now();

    // 保存历史记录
    await db.passwordHistory.add({
      passwordId: id,
      oldPassword: oldPasswordRecord.password,
      newPassword,
      rotatedAt: now,
      reason
    });

    // 更新密码
    await db.passwords.update(id, {
      password: newPassword,
      updatedAt: now
    });
  }

  /**
   * 获取密码的轮换历史
   */
  static async getPasswordHistory(passwordId: number): Promise<PasswordHistory[]> {
    return await db.passwordHistory
      .where('passwordId')
      .equals(passwordId)
      .reverse()
      .sortBy('rotatedAt');
  }

  /**
   * 搜索密码（根据标签）
   */
  static async searchPasswords(query: string): Promise<Password[]> {
    const allPasswords = await db.passwords.toArray();
    return allPasswords.filter(pwd =>
      pwd.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }
}
