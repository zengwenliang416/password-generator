/**
 * 密码强度等级
 */
export enum PasswordStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong'
}

/**
 * 密码强度结果接口
 */
export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  entropy: number; // 熵值（比特）
  feedback: string[]; // 反馈信息
}

/**
 * 计算字符集大小
 * @param password 密码
 * @returns 字符集大小
 */
function getCharsetSize(password: string): number {
  let charsetSize = 0;

  if (/[a-z]/.test(password)) charsetSize += 26; // 小写字母
  if (/[A-Z]/.test(password)) charsetSize += 26; // 大写字母
  if (/[0-9]/.test(password)) charsetSize += 10; // 数字
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32; // 特殊字符（估算）

  return charsetSize;
}

/**
 * 计算密码熵值
 * 熵 = log2(字符集大小^密码长度)
 * @param password 密码
 * @returns 熵值（比特）
 */
function calculateEntropy(password: string): number {
  const charsetSize = getCharsetSize(password);
  const length = password.length;
  return Math.log2(Math.pow(charsetSize, length));
}

/**
 * 检测常见模式
 * @param password 密码
 * @returns 是否包含常见模式
 */
function hasCommonPatterns(password: string): boolean {
  // 连续字符（如 abc, 123）
  const sequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i;

  // 重复字符（如 aaa, 111）
  const repeated = /(.)\1{2,}/;

  // 键盘模式（如 qwerty, asdfgh）
  const keyboard = /(?:qwerty|asdfgh|zxcvbn|qwertz|azerty)/i;

  return sequential.test(password) || repeated.test(password) || keyboard.test(password);
}

/**
 * 计算密码强度
 * @param password 密码
 * @returns 密码强度结果
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  // 1. 基础分数：长度（最高40分）
  const lengthScore = Math.min(password.length * 2.5, 40);
  score += lengthScore;

  if (password.length < 8) {
    feedback.push('密码长度至少应为 8 个字符');
  } else if (password.length >= 16) {
    feedback.push('密码长度很好');
  }

  // 2. 字符类型多样性（最高30分）
  let diversity = 0;
  if (/[a-z]/.test(password)) diversity++;
  if (/[A-Z]/.test(password)) diversity++;
  if (/[0-9]/.test(password)) diversity++;
  if (/[^a-zA-Z0-9]/.test(password)) diversity++;

  const diversityScore = diversity * 7.5;
  score += diversityScore;

  if (diversity < 3) {
    feedback.push('建议使用更多种类的字符（大小写字母、数字、特殊字符）');
  }

  // 3. 熵值（最高30分）
  const entropy = calculateEntropy(password);
  const entropyScore = Math.min((entropy / 100) * 30, 30);
  score += entropyScore;

  // 4. 扣分项：常见模式
  if (hasCommonPatterns(password)) {
    score -= 20;
    feedback.push('避免使用连续字符、重复字符或键盘模式');
  }

  // 5. 确保分数在 0-100 之间
  score = Math.max(0, Math.min(100, score));

  // 6. 确定强度等级
  let strength: PasswordStrength;
  if (score < 40) {
    strength = PasswordStrength.WEAK;
    feedback.push('密码强度较弱，建议生成更强的密码');
  } else if (score < 60) {
    strength = PasswordStrength.MEDIUM;
    feedback.push('密码强度中等，可以进一步改进');
  } else if (score < 80) {
    strength = PasswordStrength.STRONG;
    feedback.push('密码强度良好');
  } else {
    strength = PasswordStrength.VERY_STRONG;
    feedback.push('密码强度非常好');
  }

  return {
    strength,
    score: Math.round(score),
    entropy: Math.round(entropy),
    feedback
  };
}

/**
 * 获取强度等级的中文描述
 * @param strength 强度等级
 * @returns 中文描述
 */
export function getStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.WEAK:
      return '弱';
    case PasswordStrength.MEDIUM:
      return '中等';
    case PasswordStrength.STRONG:
      return '强';
    case PasswordStrength.VERY_STRONG:
      return '非常强';
  }
}

/**
 * 获取强度等级对应的颜色
 * @param strength 强度等级
 * @returns Tailwind CSS 颜色类名
 */
export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.WEAK:
      return 'text-red-500';
    case PasswordStrength.MEDIUM:
      return 'text-yellow-500';
    case PasswordStrength.STRONG:
      return 'text-blue-500';
    case PasswordStrength.VERY_STRONG:
      return 'text-green-500';
  }
}
