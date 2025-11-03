/**
 * 密码记录接口
 */
export interface Password {
  id?: number; // 主键（自增）
  password: string; // 密码（明文，IndexedDB 是本地存储）
  tags: string[]; // 标签数组
  length: number; // 密码长度
  includeNumbers: boolean; // 是否包含数字
  includeSpecialChars: boolean; // 是否包含特殊字符
  includeUppercase: boolean; // 是否包含大写字母
  includeLowercase: boolean; // 是否包含小写字母
  createdAt: number; // 创建时间（时间戳）
  updatedAt: number; // 最后更新时间（时间戳）
}

/**
 * 密码轮换历史记录接口
 */
export interface PasswordHistory {
  id?: number; // 主键（自增）
  passwordId: number; // 关联的密码ID
  oldPassword: string; // 旧密码
  newPassword: string; // 新密码
  rotatedAt: number; // 轮换时间（时间戳）
  reason?: string; // 轮换原因（可选）
}

/**
 * 密码生成配置接口
 */
export interface PasswordConfig {
  length: number;
  includeNumbers: boolean;
  includeSpecialChars: boolean;
  includeUppercase: boolean;
  includeLowercase: boolean;
}
