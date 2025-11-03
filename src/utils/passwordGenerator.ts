import { PasswordConfig } from '../db/types';

/**
 * 字符集定义
 */
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBER_CHARS = '0123456789';
const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * 使用 crypto.getRandomValues 生成安全的随机整数
 * @param max 最大值（不包含）
 * @returns 0 到 max-1 之间的随机整数
 */
function getSecureRandomInt(max: number): number {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

/**
 * 从字符集中随机选择一个字符
 * @param charset 字符集
 * @returns 随机字符
 */
function getRandomChar(charset: string): string {
  return charset[getSecureRandomInt(charset.length)];
}

/**
 * Fisher-Yates 洗牌算法（使用安全随机数）
 * @param array 要打乱的数组
 * @returns 打乱后的数组
 */
function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 根据配置生成强密码
 * @param config 密码生成配置
 * @returns 生成的密码
 */
export function generatePassword(config: PasswordConfig): string {
  // 验证配置
  if (config.length < 8 || config.length > 128) {
    throw new Error('密码长度必须在 8-128 之间');
  }

  // 构建字符池
  let charset = '';
  const requiredChars: string[] = [];

  if (config.includeLowercase) {
    charset += LOWERCASE_CHARS;
    requiredChars.push(getRandomChar(LOWERCASE_CHARS));
  }

  if (config.includeUppercase) {
    charset += UPPERCASE_CHARS;
    requiredChars.push(getRandomChar(UPPERCASE_CHARS));
  }

  if (config.includeNumbers) {
    charset += NUMBER_CHARS;
    requiredChars.push(getRandomChar(NUMBER_CHARS));
  }

  if (config.includeSpecialChars) {
    charset += SPECIAL_CHARS;
    requiredChars.push(getRandomChar(SPECIAL_CHARS));
  }

  // 至少要有一种字符类型
  if (charset.length === 0) {
    throw new Error('至少需要选择一种字符类型');
  }

  // 确保至少包含每种选中类型的字符各一个
  const passwordArray: string[] = [...requiredChars];

  // 填充剩余长度
  const remainingLength = config.length - requiredChars.length;
  for (let i = 0; i < remainingLength; i++) {
    passwordArray.push(getRandomChar(charset));
  }

  // 使用安全的洗牌算法打乱密码
  const shuffledPassword = secureShuffle(passwordArray);

  return shuffledPassword.join('');
}

/**
 * 生成默认配置的强密码
 * @param length 密码长度（默认16）
 * @returns 生成的密码
 */
export function generateDefaultPassword(length: number = 16): string {
  return generatePassword({
    length,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSpecialChars: true
  });
}
