import { describe, it, expect } from 'vitest';
import { generatePassword, generateDefaultPassword } from './passwordGenerator';
import { PasswordConfig } from '../db/types';

describe('密码生成器', () => {
  it('应该生成指定长度的密码', () => {
    const config: PasswordConfig = {
      length: 16,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSpecialChars: true
    };

    const password = generatePassword(config);
    expect(password).toHaveLength(16);
  });

  it('应该包含所有选中的字符类型', () => {
    const config: PasswordConfig = {
      length: 20,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSpecialChars: true
    };

    const password = generatePassword(config);

    // 验证包含小写字母
    expect(/[a-z]/.test(password)).toBe(true);
    // 验证包含大写字母
    expect(/[A-Z]/.test(password)).toBe(true);
    // 验证包含数字
    expect(/[0-9]/.test(password)).toBe(true);
    // 验证包含特殊字符
    expect(/[^a-zA-Z0-9]/.test(password)).toBe(true);
  });

  it('应该只包含小写字母', () => {
    const config: PasswordConfig = {
      length: 16,
      includeLowercase: true,
      includeUppercase: false,
      includeNumbers: false,
      includeSpecialChars: false
    };

    const password = generatePassword(config);

    expect(/^[a-z]+$/.test(password)).toBe(true);
    expect(password).toHaveLength(16);
  });

  it('应该拒绝长度小于8的密码', () => {
    const config: PasswordConfig = {
      length: 7,
      includeLowercase: true,
      includeUppercase: false,
      includeNumbers: false,
      includeSpecialChars: false
    };

    expect(() => generatePassword(config)).toThrow('密码长度必须在 8-128 之间');
  });

  it('应该拒绝长度大于128的密码', () => {
    const config: PasswordConfig = {
      length: 129,
      includeLowercase: true,
      includeUppercase: false,
      includeNumbers: false,
      includeSpecialChars: false
    };

    expect(() => generatePassword(config)).toThrow('密码长度必须在 8-128 之间');
  });

  it('应该拒绝没有选择任何字符类型', () => {
    const config: PasswordConfig = {
      length: 16,
      includeLowercase: false,
      includeUppercase: false,
      includeNumbers: false,
      includeSpecialChars: false
    };

    expect(() => generatePassword(config)).toThrow('至少需要选择一种字符类型');
  });

  it('生成的密码应该是随机的（不重复）', () => {
    const config: PasswordConfig = {
      length: 16,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSpecialChars: true
    };

    const password1 = generatePassword(config);
    const password2 = generatePassword(config);
    const password3 = generatePassword(config);

    // 三次生成的密码应该不完全相同（极低概率相同）
    expect(password1 === password2 && password2 === password3).toBe(false);
  });

  it('generateDefaultPassword应该生成16位默认密码', () => {
    const password = generateDefaultPassword();
    expect(password).toHaveLength(16);
    expect(/[a-z]/.test(password)).toBe(true);
    expect(/[A-Z]/.test(password)).toBe(true);
    expect(/[0-9]/.test(password)).toBe(true);
    expect(/[^a-zA-Z0-9]/.test(password)).toBe(true);
  });

  it('generateDefaultPassword应该接受自定义长度', () => {
    const password = generateDefaultPassword(32);
    expect(password).toHaveLength(32);
  });
});
