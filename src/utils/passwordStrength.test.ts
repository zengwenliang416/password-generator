import { describe, it, expect } from 'vitest';
import {
  calculatePasswordStrength,
  PasswordStrength,
  getStrengthLabel,
  getStrengthColor
} from './passwordStrength';

describe('密码强度计算', () => {
  it('应该识别弱密码', () => {
    const result = calculatePasswordStrength('12345678');
    expect(result.strength).toBe(PasswordStrength.WEAK);
    expect(result.score).toBeLessThan(40);
  });

  it('应该识别中等强度密码', () => {
    const result = calculatePasswordStrength('Password123');
    expect(result.strength).toBe(PasswordStrength.MEDIUM);
    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThan(60);
  });

  it('应该识别强密码', () => {
    const result = calculatePasswordStrength('Pass@word123');
    expect(result.strength).toBe(PasswordStrength.STRONG);
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.score).toBeLessThan(80);
  });

  it('应该识别非常强的密码', () => {
    const result = calculatePasswordStrength('P@ssw0rd!2024#Secure');
    expect(result.strength).toBe(PasswordStrength.VERY_STRONG);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('应该计算熵值', () => {
    const result = calculatePasswordStrength('P@ssw0rd!2024');
    expect(result.entropy).toBeGreaterThan(0);
  });

  it('应该提供反馈信息', () => {
    const result = calculatePasswordStrength('12345678');
    expect(result.feedback).toBeInstanceOf(Array);
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it('应该对短密码给出反馈', () => {
    const result = calculatePasswordStrength('Pass1!');
    const feedbackText = result.feedback.join(' ');
    expect(feedbackText).toContain('长度');
  });

  it('应该检测常见模式并扣分', () => {
    const weakResult = calculatePasswordStrength('abc123456!!!');
    const strongResult = calculatePasswordStrength('X9#mK2@pL7$q');

    // 包含连续字符的密码应该得分更低
    expect(weakResult.score).toBeLessThan(strongResult.score);
  });

  it('getStrengthLabel应该返回正确的中文标签', () => {
    expect(getStrengthLabel(PasswordStrength.WEAK)).toBe('弱');
    expect(getStrengthLabel(PasswordStrength.MEDIUM)).toBe('中等');
    expect(getStrengthLabel(PasswordStrength.STRONG)).toBe('强');
    expect(getStrengthLabel(PasswordStrength.VERY_STRONG)).toBe('非常强');
  });

  it('getStrengthColor应该返回正确的颜色类名', () => {
    expect(getStrengthColor(PasswordStrength.WEAK)).toBe('text-red-500');
    expect(getStrengthColor(PasswordStrength.MEDIUM)).toBe('text-yellow-500');
    expect(getStrengthColor(PasswordStrength.STRONG)).toBe('text-blue-500');
    expect(getStrengthColor(PasswordStrength.VERY_STRONG)).toBe('text-green-500');
  });
});
